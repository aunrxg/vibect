"use client";

import { useEffect, useState } from "react";
import Profile from "./profile";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";

export function SiteHeader() {
  const [greeting, setGreeting] = useState<
    "Good Morning" | "Good Afternoon" | "Good Evening"
  >("Good Morning");
  useEffect(() => {
    const today = new Date();
    const curHr = today.getHours();
    if (curHr < 12) {
      setGreeting("Good Morning");
    } else if (curHr < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);
  const data = {
    user: {
      name: "anurag",
      email: "a@anurag.com",
      avatar: "/avatars/anurag.jpg",
    },
  };

  return (
    <header className="">
      {/* flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) */}
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-1.5">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div>
          <h1 className="text-l font-bold">{greeting}</h1>
          <p className="text-sm">John Doe</p>
        </div>
        {/* <div className="ml-auto flex items-center gap-2">
          <Profile user={data.user} />
        </div> */}
        <div className="bg-black ml-auto flex items-center gap-2 rounded-full px-3.5 py-2">
          P
        </div>
      </div>
    </header>
  );
}
