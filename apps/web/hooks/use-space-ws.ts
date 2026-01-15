import { useAuthStore } from "@/store/use-auth-store";
import { useWebSocket } from "./use-websockets";

export const useSpaceWebSocket = (spaceId: string) => {
  const getToken = useAuthStore((state) => state.getAuthToken);
  const token = getToken();

  return useWebSocket({
    token: token || undefined,
    spaceId,
    enabled: !!spaceId,
    autoConnect: true,
  });
};
