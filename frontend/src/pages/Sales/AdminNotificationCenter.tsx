import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MdSend, MdHistory, MdRefresh } from 'react-icons/md';
import { toast } from 'react-toastify';
import {getNotificationStats,   getNotifications , sendNotification, } from '@/services/notificationServices';
import {useAuth} from '@/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';

const notifSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(['Announcement', 'Task', 'Target', 'System']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  recipientType: z.enum(['All', 'Department', 'Employee']),
  department: z.string().optional(),
  employee: z.string().optional(),
  link: z.string().optional(),
});

type NotifForm = z.infer<typeof notifSchema>;

export default function AdminNotificationCenter() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  
  const { auth } = useAuth();
  const slug = auth.slug!;
  // const stats = getNotificationStats(slug); // Replace with API

  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["notification-stats", slug],
    queryFn: () => getNotificationStats(slug),
  });
  

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<NotifForm>({
    resolver: zodResolver(notifSchema),
    defaultValues: { type: 'Announcement', priority: 'Medium', recipientType: 'All' }
  });

  const wRecipientType = watch('recipientType');

  const onSubmit = async (data: NotifForm) => {
    try {
      await sendNotification(slug, data);
      console.log('Broadcasting:', data);
      toast.success('Notification broadcasted successfully!');
      reset();
    } catch (err) {
      toast.error('Failed to send notification.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Notification Center</h1>
          <p className="text-sm text-base-content/60 mt-1">Broadcast announcements and manage system alerts.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm gap-2 bg-base-100"><MdRefresh /> Refresh Stats</button>
        </div>
      </div>

     {/* Analytics */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Total Sent */}
  <div className="bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center">
    <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
      Total Sent
    </span>

    {isLoading ? (
      <div className="skeleton h-9 w-20 mt-2"></div>
    ) : (
      <span className="text-3xl font-black mt-1 text-primary">
        {stats?.total?.toLocaleString() ?? 0}
      </span>
    )}
  </div>

  {/* Read Rate */}
  <div className="bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center">
    <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
      Read Rate
    </span>

    {isLoading ? (
      <div className="skeleton h-9 w-24 mt-2"></div>
    ) : (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-3xl font-black text-success">
          {stats?.readRate ?? 0}%
        </span>

        <progress
          className="progress progress-success w-20"
          value={stats?.readRate ?? 0}
          max={100}
        />
      </div>
    )}
  </div>

  {/* Delivery Rate */}
  <div className="bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center">
    <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
      Delivery Rate
    </span>

    {isLoading ? (
      <div className="skeleton h-9 w-24 mt-2"></div>
    ) : (
      <span className="text-3xl font-black mt-1 text-info">
        {stats?.deliveryRate ?? 0}%
      </span>
    )}
  </div>

  {/* Unread Notifications */}
  <div className="bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center">
    <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
      Unread
    </span>

    {isLoading ? (
      <div className="skeleton h-9 w-20 mt-2"></div>
    ) : (
      <span className="text-3xl font-black mt-1 text-warning">
        {stats?.unread ?? 0}
      </span>
    )}
  </div>
</div>

      <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="tabs tabs-bordered pt-2 px-4 border-b border-base-200 bg-base-200/30">
          <a className={`tab tab-bordered h-12 font-bold ${activeTab === 'send' ? 'tab-active text-primary border-primary' : ''}`} onClick={() => setActiveTab('send')}><MdSend className="mr-2" size={18} /> Compose</a>
          <a className={`tab tab-bordered h-12 font-bold ${activeTab === 'history' ? 'tab-active text-primary border-primary' : ''}`} onClick={() => setActiveTab('history')}><MdHistory className="mr-2" size={18} /> History</a>
        </div>

        <div className="p-6 flex-1 bg-base-100">
          {activeTab === 'send' && (
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control md:col-span-2">
                  <label className="label font-bold text-sm">Notification Title <span className="text-error">*</span></label>
                  <input {...register("title")} className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`} placeholder="e.g. Q3 Sales Target Update" />
                </div>
                
                <div className="form-control md:col-span-2">
                  <label className="label font-bold text-sm">Message Body <span className="text-error">*</span></label>
                  <textarea {...register("message")} className={`textarea textarea-bordered w-full h-32 ${errors.message ? 'textarea-error' : ''}`} placeholder="Enter detailed announcement..."></textarea>
                </div>

                <div className="form-control">
                  <label className="label font-bold text-sm">Notification Type</label>
                  <select {...register("type")} className="select select-bordered w-full">
                    <option value="Announcement">Announcement</option><option value="Target">Target Update</option><option value="System">System Alert</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-bold text-sm">Priority</label>
                  <select {...register("priority")} className="select select-bordered w-full">
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-control md:col-span-2 bg-base-200/50 p-4 rounded-xl border border-base-200 mt-2">
                  <label className="label font-bold text-sm pt-0">Recipients</label>
                  <div className="flex gap-6 mb-4">
                    <label className="cursor-pointer flex items-center gap-2"><input type="radio" value="All" {...register("recipientType")} className="radio radio-primary radio-sm" /><span className="text-sm font-medium">Entire Company</span></label>
                    <label className="cursor-pointer flex items-center gap-2"><input type="radio" value="Department" {...register("recipientType")} className="radio radio-primary radio-sm" /><span className="text-sm font-medium">Specific Department</span></label>
                    <label className="cursor-pointer flex items-center gap-2"><input type="radio" value="Employee" {...register("recipientType")} className="radio radio-primary radio-sm" /><span className="text-sm font-medium">Individual Employee</span></label>
                  </div>
                  {wRecipientType === 'Department' && (
                    <select {...register("department")} className="select select-sm select-bordered w-full max-w-xs"><option>Sales</option><option>Marketing</option></select>
                  )}
                  {wRecipientType === 'Employee' && (
                    <input {...register("employee")} className="input input-sm input-bordered w-full max-w-xs" placeholder="Search employee email/ID..." />
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label font-bold text-sm">Action Link (Optional)</label>
                  <input {...register("link")} className="input input-bordered w-full" placeholder="https://..." />
                </div>
              </div>

              <div className="pt-4 border-t border-base-200 flex gap-3 justify-end">
                <button type="button" className="btn btn-outline" onClick={() => reset()}>Discard</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary shadow-lg px-8">
                  {isSubmitting ? <span className="loading loading-spinner"></span> : <><MdSend size={18} /> Broadcast Now</>}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead className="bg-base-200">
                  <tr>
                    <th>Date Sent</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Audience</th>
                    <th>Read Rate</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* MOCK ROWS */}
                  <tr><td>2026-06-18</td><td className="font-bold">Q3 Targets Live</td><td>Target</td><td>Sales</td><td className="text-success font-semibold">95%</td><td className="text-right"><button className="btn btn-xs btn-ghost text-primary">View</button></td></tr>
                  <tr><td>2026-06-15</td><td className="font-bold">System Maintenance</td><td>System</td><td>All</td><td className="text-success font-semibold">88%</td><td className="text-right"><button className="btn btn-xs btn-ghost text-primary">View</button></td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}