import React from 'react';

const AdminDashboardSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl"></div>
        ))}
      </div>

      {/* Filters and Table Skeleton */}
      <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
        <div className="card-body p-6 md:p-8">
          {/* Filters Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="skeleton h-12 w-full sm:w-64 rounded-lg"></div>
            <div className="flex gap-2">
              <div className="skeleton h-12 w-24 rounded-lg"></div>
              <div className="skeleton h-12 w-24 rounded-lg"></div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="space-y-3">
            <div className="skeleton h-10 w-full rounded-lg"></div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-14 w-full rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;