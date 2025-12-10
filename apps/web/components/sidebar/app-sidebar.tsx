"use client";
import {
  IconSearch,
  IconReport,
  IconHome,
  IconPlaylistAdd,
  IconCirclePlus,
  IconCreditCard,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { MenuNav } from "./menu-nav";
import { ActionNav } from "./action-nav";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  menu: [
    {
      title: "Home",
      url: "#",
      icon: IconHome,
    },
    {
      title: "Explore",
      url: "#",
      icon: IconSearch,
    },
    {
      title: "Library",
      url: "#",
      icon: IconPlaylistAdd,
    },
    {
      title: "Upgrade",
      url: "#",
      icon: IconCreditCard,
    },
  ],
  action: [
    {
      title: "Create",
      url: "#",
      icon: IconCirclePlus,
    },
    {
      title: "Join",
      url: "#",
      icon: IconReport,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Vibect</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MenuNav items={data.menu} />
        <ActionNav items={data.action} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
