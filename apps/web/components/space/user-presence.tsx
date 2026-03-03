"use client";

import { Crown, User, Users, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { useAuthStore } from "@/store/use-auth-store";
import { useSpace } from "@/hooks/use-space";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function UserPresence({ creator }: { creator: string }) {
  const { id: spaceId } = useParams();
  const { data: space } = useSpace(spaceId as string);
  const { identity } = useAuthStore();
  const currentUserId = identity.id;

  const users = space?.members || [];

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-3 p-1">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">
                  No one here yet
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1 max-w-[200px]">
                  Share this space with friends to start the party!
                </p>
              </div>
            ) : (
              users.map((user) => {
                const isYou = user.id === currentUserId;
                const isCreator = user.id === creator;
                const displayName =
                  isYou && !user.name.startsWith("Guest")
                    ? identity.name || user.name
                    : user.name;

                return (
                  <div
                    key={user.id}
                    className="group flex items-center justify-between p-3 rounded-xl bg-muted/5 hover:bg-muted/10 border border-transparent hover:border-muted/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback className="bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-semibold tracking-tight ${isYou ? "text-indigo-400" : "text-foreground/90"}`}
                          >
                            {displayName}
                          </span>
                          {isYou && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                              (You)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isCreator ? (
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                              <Crown className="h-3 w-3" />
                              Host
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                              {user.isAnonymous
                                ? "Anonymous Listener"
                                : "Viber"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCreator && (
                        <ShieldCheck className="h-4 w-4 text-indigo-500/50" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
