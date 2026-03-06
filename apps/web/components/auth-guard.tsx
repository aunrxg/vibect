"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { HomeSkeleton } from "./loading-skeletons";

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
    return <HomeSkeleton />;
  }

  if (!isAuth) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
