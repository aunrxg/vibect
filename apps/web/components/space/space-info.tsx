import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionState, Space } from "@/lib/types";
import {
  Check,
  Copy,
  Crown,
  Ghost,
  Globe,
  Lock,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { ConnectionStatus } from "./connection-status";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface SpaceInfoProps {
  space: Space;
  connectionState: ConnectionState;
  isOwner: boolean;
}

export default function SpaceInfo({
  space,
  connectionState,
  isOwner,
}: SpaceInfoProps) {
  const [copied, setCopied] = useState(false);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(space.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Primary Info Card */}
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        <div className="h-24 bg-linear-to-r from-indigo-600/20 to-purple-600/20 flex items-center px-6">
          <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <Globe className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        <CardHeader className="-mt-12 pt-0">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white leading-tight">
                {space.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                >
                  {space.isPublic ? (
                    <Globe className="h-3 w-3 mr-1" />
                  ) : (
                    <Lock className="h-3 w-3 mr-1" />
                  )}
                  {space.isPublic ? "Public Space" : "Private Space"}
                </Badge>
                {isOwner && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Creator
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {space.description || "No description provided for this space."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Users className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Live Now
                </span>
              </div>
              <div className="text-xl font-bold text-white tabular-nums">
                {space.memberCount || 0}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Wifi className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Status
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ConnectionStatus connectionState={connectionState} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
          Invite Friends
        </h3>
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group focus-within:border-indigo-500/50 transition-colors">
          <div className="flex-1 px-3 font-mono text-sm text-indigo-300 font-bold tracking-wider">
            {space.inviteCode}
          </div>
          <Button
            onClick={copyInviteCode}
            size="sm"
            variant="ghost"
            className="rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Owner Details */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
          Space Owner
        </h3>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage
                  src={space.owner.avatarUrl}
                  alt={space.owner.name}
                />
                <AvatarFallback className="bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
                  {space.owner.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold tracking-tight`}>
                  {space.owner.name}
                </span>
                {/* {isYou && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                        (You)
                                    </span>
                                )} */}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                <Crown className="h-3 w-3" />
                Host
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
