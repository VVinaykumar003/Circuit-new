import React from 'react';
import { FaSignInAlt, FaSignOutAlt, FaCoffee, FaClock } from 'react-icons/fa';
import type { TodayAttendance } from "@/type/index";

interface Props {
  todayData: TodayAttendance;
  
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | null }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 bg-base-200 rounded-full text-primary">
            {icon}
        </div>
        <div>
            <div className="text-sm text-base-content/60">{label}</div>
            <div className="font-bold text-base-content text-xs">{value || '--:--'}</div>
        </div>
    </div>
);

const TodayStatusCard: React.FC<Props> = ({ todayData }) => {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatMinutes = (minutes: number | string | null) => {
    if (typeof minutes !== 'number' || minutes < 0) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body p-6 md:p-8">
        <h2 className="card-title text-lg font-semibold text-base-content mb-6">
          Today's Activity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
            <InfoItem icon={<FaSignInAlt />} label="Check-In Time" value={formatTime(todayData.checkIn)} />
            <InfoItem icon={<FaSignOutAlt />} label="Check-Out Time" value={formatTime(todayData.checkOut)} />
            <InfoItem icon={<FaCoffee />} label="Total Break" value={formatMinutes(todayData.totalBreak)} />
            <InfoItem icon={<FaClock />} label="Working Hours" value={formatMinutes(todayData.workingHours)} />
        </div>
      </div>
    </div>
  );
};

export default TodayStatusCard;