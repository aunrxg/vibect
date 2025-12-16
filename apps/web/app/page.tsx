import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/header/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import JoinInput from "@/components/join-input";
import SocialNav from "@/components/sidebar/social-nav";
import RecentNav from "@/components/sidebar/recent-nav";
import Promotion from "@/components/sidebar/promotion-nav";
import PopularCard from "@/components/popular-card";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="md:flex md:flex-1">
          <section className="md:w-4/5 px-3 py-2 flex flex-col gap-3">
            <JoinInput />
            <PopularCard />
          </section>
          <section className="md:w-1/5 px-3 py-2 flex flex-col gap-3">
            <SocialNav />
            <RecentNav />
            <Promotion />
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
