import { Suspense } from "react";
import { Nav } from "@/components/pcb/Nav";
import { SiteFooter } from "@/components/pcb/SiteFooter";
import { ProjectDetail } from "@/components/pcb/ProjectDetail";

export default async function ProjectPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <Suspense>
      <div style={{ background: "var(--surface-page)", minHeight: "100vh" }}>
        <Nav />
        <ProjectDetail id={id} />
        <SiteFooter />
      </div>
    </Suspense>
  );
}
