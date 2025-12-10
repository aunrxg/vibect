"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "../ui/input";
import Profile from "./profile";

export function SiteHeader() {
  const data = {
    user: {
      name: "anurag",
      email: "a@anurag.com",
      avatar: "/avatars/anurag.jpg",
    },
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-1.5">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Input
          className="w-1/3"
          placeholder="Search People, Songs and spaces..."
        />
        <div className="ml-auto flex items-center gap-2">
          <Profile user={data.user} />
        </div>
      </div>
    </header>
  );
}
