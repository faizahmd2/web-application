import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoader ({type}: {type?: string}) {

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/4 mb-8" />
      <Skeleton className="w-full h-64 md:h-96 mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
};