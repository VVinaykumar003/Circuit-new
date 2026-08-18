import React from 'react';
import { FaMapMarkerAlt, FaDesktop, FaGlobe } from 'react-icons/fa';
import type { TodayAttendance } from "@/type/index";

interface Props {
  todayData: TodayAttendance;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | null }> = ({ icon, label, value }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3 text-base-content/70">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <span className="font-semibold text-base-content">{value || 'N/A'}</span>
    </div>
);

const LocationInfo: React.FC<Props> = ({ todayData }) => {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body p-6 md:p-8">
        <h2 className="card-title text-lg font-semibold text-base-content mb-4">
          Check-In Details
        </h2>
        <div className="space-y-2">
            <InfoRow icon={<FaMapMarkerAlt />} label="Location" value={todayData.location} />
            <InfoRow icon={<FaGlobe />} label="IP Address" value={todayData.ipAddress} />
            <InfoRow icon={<FaDesktop />} label="Device" value={todayData.device} />
            {todayData.gps && (
                <div className="pt-2 text-center">
                    <a href={`https://www.google.com/maps?q=${todayData.gps.lat},${todayData.gps.lng}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline btn-primary">
                        View on Map
                    </a>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;