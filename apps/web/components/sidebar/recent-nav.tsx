import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import Image from "next/image";

export default function RecentNav() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Joined</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Space />
        <Space />
        <Space />
      </CardContent>
      <CardFooter>
        <Link href="#" className="flex gap-2 text-xs text-primary">
          <span>See More</span>
          <IconArrowNarrowRight className="size-5!" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function Space() {
  return (
    <div className="flex gap-3 border px-3 py-2">
      <Image
        src="/globe.svg"
        width={50}
        height={50}
        className="border rounded-full"
        alt="space-icon"
      />
      <div className="">
        <div>Title</div>
        <p className="text-sm">description</p>
        <small className="text-xs">Created by</small>
      </div>
    </div>
  );
}
