import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/use-auth-store";

export function useAuthInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const init = useAuthStore((s) => s.init);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    init().then(() => {
      setIsInitialized(true);
    });
  }, [init]);

  return { isInitialized: isInitialized && !loading };
}

// hook to check if the user is authenticated
export function useIsAuthenticated() {
  return useAuthStore((s) => s.isAuthenticated());
}

//hook to get current identity (authenticated or anonymous)
export function useIdentity() {
  return useAuthStore((s) => s.identity);
}
