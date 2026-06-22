import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications, MdTask, MdPerson, MdShoppingCart, MdAttachMoney, MdFlag, MdEvent, MdCampaign, MdInfo, MdCheckCircle } from 'react-icons/md';
import { useAuth } from '@/auth/AuthContext';
import { getUnreadNotifications, markAsRead, type Notification } from '@/services/notificationServices';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getIcon = (type: string) => {
  switch (type) {
    case 'Task': return <MdTask className="text-primary" />;
    case 'Lead': return <MdPerson className="text-info" />;
    case 'Order': return <MdShoppingCart className="text-success" />;
    case 'Payment': return <MdAttachMoney className="text-success" />;
    case 'Target': return <MdFlag className="text-warning" />;
    case 'Meeting': return <MdEvent className="text-secondary" />;
    case 'Announcement': return <MdCampaign className="text-error" />;
    default: return <MdInfo className="text-base-content/50" />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = useAuth();
  const slug = auth?.slug || 'default-tenant';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['unreadNotifications', slug],
    queryFn: async () => getUnreadNotifications(slug).then(res => res.data),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markAsRead(slug, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] }),
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    if (!notification.isRead) {
      readMutation.mutate(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate(`/sales/notifications?id=${notification._id}`);
    }
  };

  return (
    <div className="relative">
      <button className="btn btn-ghost btn-circle" onClick={() => setIsOpen(!isOpen)}>
        <div className="indicator">
          <MdNotifications size={24} className="text-base-content/80" />
          {unreadCount > 0 && (
            <span className="badge badge-error badge-xs indicator-item animate-pulse"></span>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-base-100 rounded-2xl shadow-2xl border border-base-300 z-50 overflow-hidden transform origin-top-right transition-all">
            <div className="p-4 border-b border-base-200 bg-base-200/50 flex justify-between items-center">
              <h3 className="font-bold text-base-content">Notifications</h3>
              {unreadCount > 0 && <span className="badge badge-primary badge-sm">{unreadCount} New</span>}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-base-300 shrink-0"></div>
                      <div className="space-y-2 flex-1"><div className="h-4 bg-base-300 rounded w-3/4"></div><div className="h-3 bg-base-300 rounded w-1/2"></div></div>
                    </div>
                  ))}
                </div>
              ) : notifications?.length === 0 ? (
                <div className="p-8 text-center text-base-content/50 flex flex-col items-center">
                  <MdCheckCircle size={40} className="mb-2 text-success/50" />
                  <p className="font-medium">You're all caught up!</p>
                </div>
              ) : (
                notifications?.slice(0, 5).map(n => (
                  <div key={n._id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-base-200 hover:bg-base-200/50 cursor-pointer flex gap-4 transition-colors ${!n.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}>
                    <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0 shadow-sm border border-base-300 text-xl">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm truncate ${!n.isRead ? 'font-bold text-base-content' : 'font-medium text-base-content/80'}`}>{n.title}</h4>
                      <p className="text-xs text-base-content/60 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] font-semibold text-base-content/40 mt-2">{formatTimeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-base-200 bg-base-200/30 text-center"><button onClick={() => { setIsOpen(false); navigate('/sales/notifications'); }} className="btn btn-ghost btn-sm w-full text-primary hover:bg-primary/10">View All Notifications</button></div>
          </div>
        </>
      )}
    </div>
  );
}