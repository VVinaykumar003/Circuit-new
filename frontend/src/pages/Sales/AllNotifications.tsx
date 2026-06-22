import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdCheckCircle, MdDelete, MdSearch, MdOutlineSettings, MdClose ,MdWarning } from 'react-icons/md';
import {  useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { getNotifications, markAllAsRead, markAsRead,deleteNotification, type Notification } from '@/services/notificationServices';
import { toast } from 'react-toastify';

export default function AllNotifications() {
  const { auth } = useAuth();
  const slug = auth?.slug || 'default-tenant';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  // Success Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', slug],
    queryFn: async () => getNotifications(slug), // Replace with getNotifications api
  });

  console.log("Fetched Notifications:", notifications); // Debug log


  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(slug, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });


 const confirmDelete = async () => {
    if (!notificationToDelete) return;

    try {
        await deleteMutation.mutateAsync(notificationToDelete);

        if (selectedNotif?._id === notificationToDelete) {
            setSelectedNotif(null);
        }

        setDeleteModalOpen(false);
        setNotificationToDelete(null);

        setSuccessMessage("Notification deleted successfully!");
        setSuccessModalOpen(true);

    } catch (error) {
        toast.error("Failed to delete notification.");
        console.error("Delete Error:", error);
    }
};



  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAsRead(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markAsRead(slug, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const filteredNotifications = notifications?.filter( n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
    if (filter === 'Unread') return matchesSearch && !n.isRead;
    if (filter === 'Tasks') return matchesSearch && n.type === 'Task';
    if (filter === 'Orders') return matchesSearch && n.type === 'Order';
    if (filter === 'Leads') return matchesSearch && n.type === 'Lead';
    return matchesSearch;
  });

  // Grouping by Date
  const groupNotifications = (notifs: Notification[]) => {
    const groups: Record<string, Notification[]> = { Today: [], Yesterday: [], Older: [] };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    notifs.forEach(n => {
      const dateStr = new Date(n.createdAt).toDateString();
      if (dateStr === today) groups.Today.push(n);
      else if (dateStr === yesterday) groups.Yesterday.push(n);
      else groups.Older.push(n);
    });
    return groups;
  };

  const grouped = groupNotifications(filteredNotifications || []);

  const handleRowClick = (n: Notification) => {
    if (!n.isRead) readMutation.mutate(n._id);
    setSelectedNotif(n);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans flex flex-col relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Your Notifications</h1>
          <p className="text-sm text-base-content/60 mt-1">Stay updated on your tasks, leads, and orders.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => markAllReadMutation.mutate()} className="btn btn-outline btn-sm gap-2"><MdCheckCircle /> Mark All as Read</button>
          <button onClick={() => navigate('/sales/notifications/settings')} className="btn btn-ghost btn-sm btn-square"><MdOutlineSettings size={20} /></button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        
        {/* Main List */}
        <div className="flex-1 bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-base-200 bg-base-200/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto">
              {['All', 'Unread', 'Tasks', 'Leads', 'Orders'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm rounded-full ${filter === f ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>{f}</button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input type="text" placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} className="input input-sm input-bordered w-full pl-9 rounded-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-base-200 rounded-xl animate-pulse"></div>)}
              </div>
            ) : filteredNotifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
                <MdCheckCircle size={64} className="mb-4 text-success/30" />
                <h3 className="text-xl font-bold text-base-content/70">You're all caught up!</h3>
                <p className="text-sm mt-2">No new notifications matching your criteria.</p>
              </div>
            ) : (
              ['Today', 'Yesterday', 'Older'].map(group => grouped[group].length > 0 && (
                <div key={group} className="space-y-3">
                  <h4 className="text-xs font-bold text-base-content/50 uppercase tracking-wider pl-2 sticky top-0 bg-base-100/90 py-1 z-10 backdrop-blur-sm">{group}</h4>
                  {grouped[group].map(n => (
                    <div key={n._id} onClick={() => handleRowClick(n)} className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${!n.isRead ? 'bg-primary/5 border-primary shadow-sm' : 'bg-base-100 border-base-200 hover:border-primary/50 hover:bg-base-200/50'}`}>
                      {!n.isRead && <div className="absolute top-1/2 -left-1 w-2 h-2 rounded-full bg-primary -translate-y-1/2"></div>}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`text-base truncate ${!n.isRead ? 'font-bold text-base-content' : 'font-semibold text-base-content/80'}`}>{n.title}</h3>
                          <span className="text-xs font-medium text-base-content/50 shrink-0">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-base-content/70 line-clamp-2 leading-relaxed">{n.message}</p>
                        <div className="mt-3 flex gap-2 items-center">
                          <span className={`badge badge-sm badge-outline ${n.priority === 'Urgent' ? 'badge-error' : n.priority === 'High' ? 'badge-warning' : 'badge-ghost'}`}>{n.priority} Priority</span>
                          <span className="text-xs text-base-content/50 font-medium bg-base-200 px-2 py-1 rounded-md">{n.type}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col justify-between items-end shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="btn btn-ghost btn-xs btn-square text-error"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the notification drawer
                            setNotificationToDelete(n._id);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedNotif ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setSelectedNotif(null)}>
        <div className={`absolute right-0 top-0 h-full w-full md:w-[450px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedNotif ? "translate-x-0" : "translate-x-full"} flex flex-col`} onClick={e => e.stopPropagation()}>
          <div className="p-5 border-b border-base-300 flex justify-between items-start bg-base-200/30">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-primary badge-sm font-semibold">{selectedNotif?.type}</span>
                <span className={`badge badge-sm badge-outline ${selectedNotif?.priority === 'Urgent' ? 'badge-error' : 'badge-ghost'}`}>{selectedNotif?.priority}</span>
              </div>
              <h2 className="text-xl font-bold text-base-content leading-tight">{selectedNotif?.title}</h2>
              <p className="text-xs text-base-content/50 mt-1">{selectedNotif?.createdAt && new Date(selectedNotif.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={() => setSelectedNotif(null)} className="btn btn-ghost btn-circle btn-sm bg-base-200"><MdClose size={20} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-base-200/50 p-5 rounded-xl border border-base-200">
              <p className="text-sm text-base-content whitespace-pre-wrap leading-relaxed">{selectedNotif?.message}</p>
            </div>

            <div className="bg-base-100 border border-base-200 p-4 rounded-xl shadow-sm text-sm grid grid-cols-2 gap-4">
              <div><p className="text-xs text-base-content/50 uppercase font-bold mb-1">Sender</p><p className="font-semibold">{selectedNotif?.createdBy}</p></div>
              <div><p className="text-xs text-base-content/50 uppercase font-bold mb-1">Status</p><p className="font-semibold text-success flex items-center gap-1"><MdCheckCircle /> Read</p></div>
            </div>
          </div>

          <div className="p-4 border-t border-base-200 bg-base-100 flex gap-3">
            {selectedNotif?.link && (
              <button onClick={() => navigate(selectedNotif.link!)} className="btn btn-primary flex-1 shadow-sm">View Details</button>
            )}
            <button className="btn btn-outline btn-error flex-1 shadow-sm"
            onClick={() => {
              if (selectedNotif) {
                setNotificationToDelete(selectedNotif._id);
                setDeleteModalOpen(true);
              }
            }}
            >Delete</button>
          </div>
        </div>
      </div>


        {/* Delete Confirmation Modal */}
            <dialog className={`modal ${deleteModalOpen ? "modal-open" : ""}`}>
              <div className="modal-box">
                <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Delete</h3>
                <p className="py-4 text-base-content/80">Are you sure you want to delete this product? This action cannot be undone.</p>
                <div className="modal-action">
                  <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                  <button className="btn btn-error text-white" onClick={confirmDelete}>Yes, Delete</button>
                </div>
              </div>
            </dialog>
      
            {/* Success Modal */}
            <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
              <div className="modal-box flex flex-col items-center justify-center p-8">
                <MdCheckCircle className="text-success w-16 h-16 mb-4" />
                <h3 className="font-bold text-xl text-center mb-2">Success!</h3>
                <p className="text-base-content/80 text-center">{successMessage}</p>
                <div className="modal-action mt-6 w-full justify-center">
                  <button className="btn btn-primary px-8" onClick={() => setSuccessModalOpen(false)}>Close</button>
                </div>
              </div>
            </dialog>


    </div>
  );
}