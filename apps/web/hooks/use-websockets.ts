import { ConnectionState } from "@/lib/types";
import { wsClient } from "@/lib/websocket";
import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
  token?: string;
  spaceId?: string | null;
  enabled?: boolean;
  autoConnect?: boolean;
}

export const useWebSocket = ({
  token,
  spaceId,
  enabled = true,
  autoConnect = true,
}: UseWebSocketOptions = {}) => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const hasInitialized = useRef(false);
  // const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // connect to websocket on mount
    // if (autoConnect && !hasInitialized.current) {
    //   hasInitialized.current = true;

    //   wsClient
    //     .connect(token)
    //     .then(() => {
    //       setIsConnected(true);
    //       setConnectionState("connected");
    //     })
    //     .catch((e) => {
    //       console.error("Failed to connect: ", e);
    //       setIsConnected(false);
    //       setConnectionState("disconnected");
    //     });
    // }

    // event listener
    const handleConnect = () => {
      // setIsConnected(true);
      setConnectionState("connected");
      if (spaceId) wsClient.joinSpace(spaceId);
    };

    const handleDisconnect = () => {
      // setIsConnected(false);
      setConnectionState("disconnected");
    };

    const handleError = (e: any) => {
      console.error("Websocket error: ", e);
    };

    wsClient.on("connect", handleConnect);
    wsClient.on("disconnect", handleDisconnect);
    wsClient.on("error", handleError);

    // join space if provided
    // if (spaceId && wsClient.isConnected) {
    //   wsClient.joinSpace(spaceId);
    // }
    if (autoConnect && !hasInitialized.current) {
      hasInitialized.current = true;
      wsClient.connect(token);
    }

    return () => {
      if (spaceId) {
        wsClient.leaveSpace();
      }

      wsClient.off("connect", handleConnect);
      wsClient.off("disconnect", handleDisconnect);
      wsClient.off("error", handleError);
    };
  }, [token, spaceId, enabled, autoConnect]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setIsConnected(wsClient.isConnected);
  //     setConnectionState(wsClient.state);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  return {
    isConnected: connectionState === "connected",
    connectionState,
    connect: () => wsClient.connect(token),
    disconnect: () => wsClient.disconnect(),
    joinSpace: (id: string) => wsClient.joinSpace(id),
    leaveSpace: () => wsClient.leaveSpace(),
    requestTimeSync: () => wsClient.requestTimeSync(),
  };
};
