"use client";

import { ConnectionState } from "@/lib/types";
import { Badge } from "../ui/badge";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  connectionState: ConnectionState;
}

export function ConnectionStatus({ connectionState }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <Badge
        variant={
          connectionState === "connected"
            ? "default"
            : connectionState === "error"
              ? "destructive"
              : "secondary"
        }
        className="flex items-center gap-1"
      >
        {connectionState === "connected" && (
          <>
            <Wifi className="h-3 w-3" />
            Connected
          </>
        )}
        {connectionState === "connecting" && (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            Connecting…
          </>
        )}
        {connectionState === "disconnected" && (
          <>
            <WifiOff className="h-3 w-3" />
            Disconnected
          </>
        )}
        {connectionState === "error" && (
          <>
            <WifiOff className="h-3 w-3 text-red-500" />
            Error
          </>
        )}
      </Badge>
    </div>
  );
}
