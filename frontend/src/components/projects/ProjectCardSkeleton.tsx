export default function ProjectCardSkeleton() {
  return (
    <div className="bg-base-200 border border-base-300 rounded-xl p-5 animate-pulse">
      <div className="h-4 w-2/3 bg-base-300 rounded" />
      <div className="h-3 w-1/2 bg-base-300 rounded mt-2" />

      <div className="mt-4 space-y-2">
        <div className="h-2 w-full bg-base-300 rounded" />
        <div className="h-2 w-5/6 bg-base-300 rounded" />
      </div>

      <div className="flex justify-between mt-4">
        <div className="h-3 w-24 bg-base-300 rounded" />
        <div className="h-3 w-20 bg-base-300 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        <div className="h-8 bg-base-300 rounded" />
        <div className="h-8 bg-base-300 rounded" />
      </div>
    </div>
  );
}
