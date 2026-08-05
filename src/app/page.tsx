import { Nav } from "@/components/pcb/Nav";
import { Hero } from "@/components/pcb/Hero";
import { AboutSection } from "@/components/pcb/AboutSection";
import { InstagramSection } from "@/components/pcb/InstagramSection";
import { SiteFooter } from "@/components/pcb/SiteFooter";

export default function Home() {
  return (
    <div id="top" style={{ background: "var(--surface-page)", minHeight: "100vh" }}>
      <Nav />
      <main id="main" className="flex-1">
        <Hero />
        <AboutSection />
        <InstagramSection />
      </main>
      <SiteFooter />
    </div>
  );
}
