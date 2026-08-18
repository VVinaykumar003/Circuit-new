import React from 'react';
import { FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import type { AdminApprovalRecord, ApprovalStatus, AttendanceStatus } from '@/type/index';

interface Props {
  records: AdminApprovalRecord[];
  onApprove: (attendanceDocId: string, employeeId: string) => void;
  onReject: (attendanceDocId: string, employeeId: string) => void;
  actionLoading: { [key: string]: boolean };
}

const approvalBadge: { [key in ApprovalStatus]: string } = {
  Pending: "badge-warning",
  Approved: "badge-success",
  Rejected: "badge-error",
};

const statusBadge: { [key in AttendanceStatus]?: string } = {
  Present: "badge-success/80",
  Late: "badge-warning/80",
  Absent: "badge-error/80",
};

const ApprovalTable: React.FC<Props> = ({ records, onApprove, onReject, actionLoading }) => {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body p-0">
        <div className="p-6">
            <h2 className="card-title text-lg font-semibold text-base-content">Pending Approvals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check In/Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Approval</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img src={record.profileImageUrl || `https://i.pravatar.cc/80?u=${record.employeeId}`} alt={record.employeeName} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{record.employeeName}</div>
                        <div className="text-sm opacity-50">{record.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {record.checkIn || '--:--'}
                    <br />
                    <span className="text-xs opacity-60">{record.checkOut || '--:--'}</span>
                  </td>
                  <td>
                    <span className="font-semibold">{record.workingHours}</span>
                    {record.late && <div className="text-xs text-warning">Late: {record.late}</div>}
                  </td>
                  <td>
                    <span className={`badge badge-sm ${statusBadge[record.status] || 'badge-ghost'}`}>{record.status}</span>
                  </td>
                  <td>
                    <span className={`badge ${approvalBadge[record.approval]}`}>{record.approval}</span>
                  </td>
                  <td className="text-center">
                    {record.approval === 'Pending' ? (
                      <div className="join">
                        <button 
                          className="btn btn-xs btn-success join-item" 
                          onClick={() => onApprove(record.attendanceDocId, record.employeeId)}
                          disabled={actionLoading[record.attendanceDocId]}
                        >
                          {actionLoading[record.attendanceDocId] ? <span className="loading loading-spinner loading-xs"></span> : <FaCheck />}
                        </button>
                        <button 
                          className="btn btn-xs btn-error join-item" 
                          onClick={() => onReject(record.attendanceDocId, record.employeeId)}
                          disabled={actionLoading[record.attendanceDocId]}
                        >
                          {actionLoading[record._id] ? <span className="loading loading-spinner loading-xs"></span> : <FaTimes />}
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-xs btn-ghost" disabled>
                        <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {records.length === 0 && (
            <div className="text-center py-16 text-base-content/60">No pending approvals found.</div>
        )}
      </div>
    </div>
  );
};

export default ApprovalTable;