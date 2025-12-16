import { Crown, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

export default function UserPresence() {
  const users = [];
  const isCreator = true;
  return (
    <Card className="border-none">
      {/* <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Users
          <Badge variant="secondary">{users.length}</Badge>
        </CardTitle>
      </CardHeader> */}
      <CardContent className="p-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No Active Users</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share space to collaborate
                </p>
              </div>
            ) : (
              users.map((user, index) => (
                <div
                  key={`${user.user_id || user.anon_id}-${index}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {isCreator(user) ? (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">
                        {getUserDisplayName(user)}
                        {isCurrentUser(user) && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                    {isCreator(user) && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Creator
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        new Date().getTime() -
                          new Date(user.last_seen).getTime() <
                        90000
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatLastSeen(user.last_seen)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
