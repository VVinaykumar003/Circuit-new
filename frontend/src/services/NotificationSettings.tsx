import React, { useState } from 'react';
import { MdSave, MdNotificationsActive, MdEmail, MdPhoneAndroid } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock initial state
  const [prefs, setPrefs] = useState({
    channels: {
      push: true,
      email: true,
      sms: false,
    },
    alerts: {
      tasks: true,
      leads: true,
      orders: true,
      meetings: true,
      targets: true,
      marketing: false,
      system: true,
    }
  });

  const handleToggleChannel = (key: keyof typeof prefs.channels) => {
    setPrefs(p => ({ ...p, channels: { ...p.channels, [key]: !p.channels[key] } }));
  };

  const handleToggleAlert = (key: keyof typeof prefs.alerts) => {
    setPrefs(p => ({ ...p, alerts: { ...p.alerts, [key]: !p.alerts[key] } }));
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Notification preferences saved successfully!");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Notification Preferences</h1>
          <p className="text-sm text-base-content/60 mt-1">Control how and when you want to be notified.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Delivery Channels */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
            <h3 className="text-base font-bold border-b border-base-200 pb-3 mb-4 text-primary flex items-center gap-2"><MdNotificationsActive /> Delivery Channels</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg text-primary"><MdNotificationsActive size={20}/></div><div><p className="font-semibold text-sm">Push Notifications</p><p className="text-xs text-base-content/50">In-app & Browser alerts</p></div></div>
                <input type="checkbox" className="toggle toggle-primary" checked={prefs.channels.push} onChange={() => handleToggleChannel('push')} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><div className="p-2 bg-info/10 rounded-lg text-info"><MdEmail size={20}/></div><div><p className="font-semibold text-sm">Email Alerts</p><p className="text-xs text-base-content/50">Daily digests & critical alerts</p></div></div>
                <input type="checkbox" className="toggle toggle-info" checked={prefs.channels.email} onChange={() => handleToggleChannel('email')} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><div className="p-2 bg-secondary/10 rounded-lg text-secondary"><MdPhoneAndroid size={20}/></div><div><p className="font-semibold text-sm">SMS Alerts</p><p className="text-xs text-base-content/50">Text messages for urgent items</p></div></div>
                <input type="checkbox" className="toggle toggle-secondary" checked={prefs.channels.sms} onChange={() => handleToggleChannel('sms')} />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
            <h3 className="text-base font-bold border-b border-base-200 pb-3 mb-6 text-primary flex items-center gap-2">Alert Categories</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl border border-base-200"><span className="font-semibold text-sm">Task Assignments & Updates</span><input type="checkbox" className="toggle toggle-success toggle-sm" checked={prefs.alerts.tasks} onChange={() => handleToggleAlert('tasks')} /></div>
              <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl border border-base-200"><span className="font-semibold text-sm">New Leads & Conversions</span><input type="checkbox" className="toggle toggle-success toggle-sm" checked={prefs.alerts.leads} onChange={() => handleToggleAlert('leads')} /></div>
              <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl border border-base-200"><span className="font-semibold text-sm">Order Status Changes</span><input type="checkbox" className="toggle toggle-success toggle-sm" checked={prefs.alerts.orders} onChange={() => handleToggleAlert('orders')} /></div>
              <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl border border-base-200"><span className="font-semibold text-sm">Meeting Reminders</span><input type="checkbox" className="toggle toggle-success toggle-sm" checked={prefs.alerts.meetings} onChange={() => handleToggleAlert('meetings')} /></div>
              <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl border border-base-200"><span className="font-semibold text-sm">Target Achievements / Misses</span><input type="checkbox" className="toggle toggle-success toggle-sm" checked={prefs.alerts.targets} onChange={() => handleToggleAlert('targets')} /></div>
              <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl border border-base-200"><span className="font-semibold text-sm">System Maintenance & Alerts</span><input type="checkbox" className="toggle toggle-success toggle-sm" checked={prefs.alerts.system} onChange={() => handleToggleAlert('system')} /></div>
              <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-xl border border-base-200 opacity-70"><span className="font-semibold text-sm">Marketing Announcements</span><input type="checkbox" className="toggle toggle-success toggle-sm" checked={prefs.alerts.marketing} onChange={() => handleToggleAlert('marketing')} /></div>
            </div>

            <div className="mt-8 bg-info/10 border border-info/20 rounded-xl p-4 flex gap-3 text-info-content text-sm">
              <MdNotificationsActive size={24} className="shrink-0 text-info" />
              <p>Critical system alerts and urgent customer escalations cannot be disabled to ensure business continuity.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button className="btn btn-primary px-10 shadow-lg" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner"></span> : <><MdSave size={18} /> Save Preferences</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}