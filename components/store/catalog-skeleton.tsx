export function CatalogSkeleton() {
  return (
    <div aria-busy className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      <div className="skeleton h-10 w-2/3 rounded-full md:w-1/3" />
      <div className="skeleton mt-4 h-4 w-1/2 rounded-full" />
      <div className="mt-10 flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="skeleton h-[72px] w-[72px] shrink-0 rounded-full md:h-[92px] md:w-[92px]" />
        ))}
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index}>
            <div className="skeleton aspect-[3/4] rounded-3xl" />
            <div className="skeleton mt-3 h-3 w-3/4 rounded-full" />
            <div className="skeleton mt-2 h-4 w-1/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
