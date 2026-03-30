const SkeletonPost = () => (
  <div className="card-dark rounded-xl p-5 shadow-lg animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-10 w-10 rounded-full bg-secondary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-secondary" />
        <div className="h-2 w-16 rounded bg-secondary" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full rounded bg-secondary" />
      <div className="h-3 w-3/4 rounded bg-secondary" />
    </div>
    <div className="mt-4 h-48 rounded-lg bg-secondary" />
  </div>
);

export default SkeletonPost;
