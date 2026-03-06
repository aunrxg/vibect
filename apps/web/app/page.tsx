import { HomeHero } from "@/components/home/home-hero";
import { ActionCards } from "@/components/home/action-cards";
import { PublicSpaces } from "@/components/home/public-spaces";
import { HomeHeader } from "@/components/home/home-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <HomeHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-12 pb-20">
          <HomeHero />
          <section className="relative z-10 -mt-20">
            <ActionCards />
          </section>
          <PublicSpaces />
        </div>
      </main>
    </div>
  );
}
