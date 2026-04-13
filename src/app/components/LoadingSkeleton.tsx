export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <LoadingSkeleton className="w-12 h-12 rounded-lg" />
        <LoadingSkeleton className="w-16 h-6 rounded" />
      </div>
      <LoadingSkeleton className="w-24 h-4 mb-2" />
      <LoadingSkeleton className="w-32 h-8" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6">
      <LoadingSkeleton className="w-full h-10 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingSkeleton key={i} className="w-full h-12 mb-2" />
      ))}
    </div>
  );
}
