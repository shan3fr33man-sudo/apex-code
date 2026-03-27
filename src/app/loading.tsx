export default function RootLoading() {
  return (
    <div className="bg-gray-950 text-white antialiased font-sans min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        {/* Logo skeleton */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg animate-pulse" />
        </div>

        {/* Main content skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-800 rounded-lg w-3/4 mx-auto animate-pulse" />
          <div className="h-4 bg-gray-800 rounded-lg w-full animate-pulse" />
          <div className="h-4 bg-gray-800 rounded-lg w-5/6 mx-auto animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="flex gap-3 mt-8 pt-4">
          <div className="h-10 bg-gray-800 rounded-lg flex-1 animate-pulse" />
          <div className="h-10 bg-gray-800 rounded-lg flex-1 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
