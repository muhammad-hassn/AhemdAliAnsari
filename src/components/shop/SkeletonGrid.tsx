export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-[2/3] w-full bg-[#EAE4D9]" />
          <div className="h-4 bg-[#EAE4D9] w-3/4" />
          <div className="h-3 bg-[#EAE4D9] w-1/3" />
        </div>
      ))}
    </div>
  );
}
