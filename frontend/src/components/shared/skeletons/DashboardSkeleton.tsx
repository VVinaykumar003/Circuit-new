

const DashboardSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
        <div className="card-body flex-col sm:flex-row items-center gap-6 p-6">
          <div className="skeleton w-20 h-20 rounded-full shrink-0"></div>
          <div className="flex-1 w-full space-y-3">
            <div className="skeleton h-6 w-1/2"></div>
            <div className="skeleton h-4 w-3/4"></div>
            <div className="skeleton h-4 w-1/3"></div>
          </div>
          <div className="divider sm:divider-horizontal"></div>
          <div className="w-full sm:w-auto grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="skeleton h-4 w-16"></div>
            <div className="skeleton h-4 w-24"></div>
            <div className="skeleton h-4 w-12"></div>
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-4 w-14"></div>
            <div className="skeleton h-4 w-16"></div>
          </div>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="skeleton h-48 w-full rounded-2xl"></div>
          <div className="skeleton h-48 w-full rounded-2xl"></div>
          <div className="skeleton h-96 w-full rounded-2xl"></div>
        </div>
        <div className="space-y-8">
          <div className="skeleton h-64 w-full rounded-2xl"></div>
          <div className="skeleton h-48 w-full rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;