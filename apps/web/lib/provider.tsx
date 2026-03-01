"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useEffect } from "react";
import { queryClient } from "./queryClient";
import { useAuthInitialization } from "@/hooks/use-auth";

export function Provider({ children }: { children: ReactNode }) {
  const { isInitialized } = useAuthInitialization();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
