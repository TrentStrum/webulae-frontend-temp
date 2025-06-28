import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoading() {
  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-4 mt-8">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
      </div>
    </main>
  );
}