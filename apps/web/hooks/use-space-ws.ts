import { useAuthStore } from "@/store/use-auth-store";
import { useWebSocket } from "./use-websockets";

export const useSpaceWebSocket = (spaceId: string) => {
  const session = useAuthStore((state) => state.session);
  const { access_token } = session;

  return useWebSocket({
    token: access_token || undefined,
    spaceId,
    enabled: !!spaceId,
    autoConnect: true,
  });
};
