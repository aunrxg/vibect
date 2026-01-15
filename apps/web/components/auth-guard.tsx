"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/auth" }: AuthGuardProps) {
  const { loading, isAuthenticated } = useAuthStore();
  const isAuth = isAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push(redirectTo);
    }
  }, [isAuth, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Card className="bg-background border-secondary p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Music className="h-8 w-8 text-primary animate-pulse" />
            <p className="text-secondary">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuth) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
