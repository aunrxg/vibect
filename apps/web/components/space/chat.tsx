import { User2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export default function Chat() {
  return (
    <Card className="rounded-none border-0">
      <CardContent className="p-0">
        <div className="text-center py-8">
          <User2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Comming Soon</p>
          <p className="text-sm text-muted-foreground mt-1">
            Build in progress
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
