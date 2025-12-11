import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/header/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import JoinInput from "@/components/join-input";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1">
          <section className="w-3/4 px-3 py-2">
            <JoinInput />
          </section>
          <section className="bg-blue-900 w-1/4 px-3 py-2">
            Lorem, ipsum dolor.
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
