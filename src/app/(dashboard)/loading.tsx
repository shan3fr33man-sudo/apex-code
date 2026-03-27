export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-800 rounded-lg w-1/3 animate-pulse" />
        <div className="h-4 bg-gray-800 rounded-lg w-1/2 animate-pulse" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-3">
            <div className="h-6 bg-gray-800 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-4/5 animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-gray-800 rounded flex-1 animate-pulse" />
              <div className="h-8 bg-gray-800 rounded flex-1 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
        <div className="h-6 bg-gray-800 rounded w-1/4 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-800 rounded flex-1 animate-pulse" />
              <div className="h-4 bg-gray-800 rounded flex-1 animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
