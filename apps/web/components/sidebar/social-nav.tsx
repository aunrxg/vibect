import { IconArrowNarrowRight } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";

export default function SocialNav() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Social</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://github.com/maxleiter.png"
              alt="@maxleiter"
            />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://github.com/evilrabbit.png"
              alt="@evilrabbit"
            />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://github.com/evilrabbit.png"
              alt="@evilrabbit"
            />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://github.com/evilrabbi.png"
              alt="@evilrabbit"
            />
            <AvatarFallback>9+</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="#" className="flex gap-2 text-xs text-primary">
          <span>See More</span>
          <IconArrowNarrowRight className="size-4!" />
        </Link>
      </CardFooter>
    </Card>
  );
}
