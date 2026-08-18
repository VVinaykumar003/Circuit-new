import React from 'react';
import type { AdminDashboardData } from '@/type/index';

interface Props {
  kpis: AdminDashboardData['kpis'];
}

const KpiCard: React.FC<{ title: string; value: number; className?: string }> = ({ title, value, className = '' }) => (
  <div className={`card bg-base-100 border border-base-300 shadow-md rounded-2xl p-4 text-center ${className}`}>
    <div className="text-4xl font-extrabold">{value}</div>
    <div className="text-sm font-medium text-base-content/70 mt-1">{title}</div>
  </div>
);

const AdminKpiCards: React.FC<Props> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard 
        title="Present Today" 
        value={kpis.presentToday} 
        className="text-success" 
      />
      <KpiCard 
        title="Absent Today" 
        value={kpis.absentToday} 
        className="text-error" 
      />
      <KpiCard 
        title="Late Arrivals" 
        value={kpis.lateEmployees} 
        className="text-warning" 
      />
      <KpiCard 
        title="On Leave" 
        value={kpis.onLeave} 
        className="text-info" 
      />
      <KpiCard 
        title="Work From Home" 
        value={kpis.workFromHome} 
        className="text-primary" 
      />
      <KpiCard 
        title="Pending Approvals" 
        value={kpis.pendingApprovals} 
        className="text-secondary" 
      />
    </div>
  );
};

export default AdminKpiCards;