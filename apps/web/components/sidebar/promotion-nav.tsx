import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function Promotion() {
  return (
    <Card className="bg-primary text-background">
      <CardHeader className="text-2xl text-center">
        <CardTitle>Upgrade to premium</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p>A new experience of space at you finger tips.</p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="secondary"
          size="lg"
          className="text-background w-1/2 font-bold "
        >
          Upgrade Now
        </Button>
      </CardFooter>
    </Card>
  );
}
