import React from "react";
import { useSpaceStore } from "@/store/use-space-store";
import { Users, Wifi, Clock, AlignLeft } from "lucide-react";
import { useSpace } from "@/hooks/use-space";

export function TopBar({ spaceId }: { spaceId: string }) {
  const metrics = useSpaceStore((s) => s.metrics);
  const { data: space } = useSpace(spaceId);

  return (
    <div className="w-full h-10 border-b border-white/10 bg-black/50 flex flex-row items-center justify-between px-4 text-[11px] text-gray-400 font-medium tracking-wide">
      <div className="flex items-center gap-3 md:gap-5">
        <span className="flex items-center gap-2 text-white font-semibold">
          <AlignLeft className="w-3.5 h-3.5 text-green-500" />
          Vibect
        </span>
        <div className="h-3 w-px bg-white/10" />
        <span className="flex items-center gap-1.5">
          <span className="text-gray-500">Room</span>
          <span
            className="text-white hover:text-green-400 cursor-pointer transition-colors"
            title="Copy Invite Code"
            onClick={() =>
              navigator.clipboard.writeText(space?.inviteCode || spaceId)
            }
          >
            #{space?.inviteCode || spaceId.slice(0, 6)}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <span className="flex items-center gap-1.5" title="Connected Users">
          <Users className="w-3.5 h-3.5" />
          {space?.memberCount || 0}
        </span>
        <div className="h-3 w-px bg-white/10 hidden md:block" />
        <span
          className="hidden md:flex items-center gap-1.5"
          title="Server Sync Offset"
        >
          <Clock className="w-3.5 h-3.5" />
          Offset: {Math.round(metrics.offset)}ms
        </span>
        <span
          className="hidden md:flex items-center gap-1.5"
          title="Network Round Trip Time"
        >
          <Wifi className="w-3.5 h-3.5" />
          RTT: {Math.round(metrics.rtt)}ms
        </span>
      </div>
    </div>
  );
}
