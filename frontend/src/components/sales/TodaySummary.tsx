import React from 'react';
import { FaHourglassHalf, FaArrowUp, FaCoffee } from 'react-icons/fa';
import type {  TodaySummaryData } from "@/type/index";



interface Props {
  summary: TodaySummaryData;
}

const SummaryStat: React.FC<{ icon: React.ReactNode; title: string; value: string; desc: string }> = ({ icon, title, value, desc }) => (
    <div className="stat p-0">
        <div className="stat-figure text-primary">{icon}</div>
        <div className="stat-title text-base-content/60">{title}</div>
        <div className="stat-value text-2xl">{value}</div>
        <div className="stat-desc">{desc}</div>
    </div>
);

const TodaySummary: React.FC<Props> = ({ summary = {} }) => {
  const formatMinutes = (minutes: number | string | null | undefined) => {
    if (typeof minutes !== 'number' || minutes < 0) return '00:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body p-6 md:p-8">
        <div className="stats stats-vertical lg:stats-horizontal shadow-none w-full">
            <SummaryStat 
                icon={<FaHourglassHalf size={24} />}
                title="Late By"
                value={formatMinutes(summary.lateBy)}
                desc="Based on shift start time"
            />
            <SummaryStat 
                icon={<FaArrowUp size={24} />}
                title="Overtime"
                value={formatMinutes(summary.overtime)}
                desc="After standard shift hours"
            />
            <SummaryStat 
                icon={<FaCoffee size={24} />}
                title="Break"
                value={formatMinutes(summary.totalBreak)}
                desc="Total break duration"
            />
        </div>
      </div>
    </div>
  );
};

export default TodaySummary;