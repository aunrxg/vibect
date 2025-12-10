import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/header/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1">
          <section className="bg-red-900">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero
            eveniet dicta, vitae architecto provident id beatae asperiores non
            suscipit, nisi laboriosam iure magni? Quasi, repellat perferendis.
            Saepe nulla quidem officiis.
          </section>
          <section className="bg-blue-900 w-1/3">Lorem, ipsum dolor.</section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
