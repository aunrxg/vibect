import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 border-r border-border md:block">
          <div className="space-y-4 py-4 px-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-xl border border-border p-4"
                >
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <main className="bg-background flex min-h-screen w-full flex-col items-center justify-center sm:px-4">
      <div className="w-full space-y-8 sm:max-w-md">
        <div className="text-center space-y-6">
          <Skeleton className="mx-auto h-20 w-20 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
        </div>
        <div className="space-y-6 rounded-2xl border border-border p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="relative flex items-center py-2">
            <div className="grow border-t border-border"></div>
            <Skeleton className="mx-4 h-4 w-24" />
            <div className="grow border-t border-border"></div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-lg mt-6" />
        </div>
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </main>
  );
}

export function FormSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Skeleton className="h-8 w-8 rounded-lg mr-4" />
          <Skeleton className="h-8 w-40" />
        </div>
      </header>
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto h-5 w-96 max-w-full" />
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-6 md:p-8 shadow-sm space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Skeleton className="h-12 flex-1 rounded-lg" />
                <Skeleton className="h-12 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function SpaceSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col bg-black">
      <div className="flex flex-1 flex-col md:flex-row min-h-0 relative">
        <section className="flex-1 h-full bg-black p-6 flex flex-col items-center overflow-hidden">
          <div className="w-full max-w-md space-y-8 flex flex-col items-center">
            <Skeleton className="w-full aspect-square rounded-[32px] bg-white/5" />
            <div className="w-full space-y-3 md:text-center px-4">
              <Skeleton className="h-8 w-3/4 md:mx-auto" />
              <Skeleton className="h-6 w-1/2 md:mx-auto" />
            </div>
          </div>
        </section>
        <section className="hidden md:flex h-full w-[400px] border-l border-border flex-col bg-card">
          <div className="p-6 space-y-6">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 flex-1 rounded-md" />
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
