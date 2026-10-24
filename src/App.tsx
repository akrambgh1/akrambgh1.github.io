import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import About from "./components/About";
import CaseStudy from "./components/CaseStudy";
import Contact from "./components/Contact";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Notes from "./components/Notes";
import Services from "./components/Services";
import { projects } from "./content";
import { useEnvironment } from "./hooks/useEnvironment";
import { scrollToTarget, useSmoothScroll } from "./hooks/useSmoothScroll";

// The hover-distortion layer is only loaded on devices that can use it
const HoverDistortion = lazy(() => import("./gl/HoverDistortion"));

const slugFromHash = () => {
  const m = window.location.hash.match(/^#work\/([\w-]+)$/);
  return m && projects.some((p) => p.slug === m[1]) ? m[1] : null;
};

export default function App() {
  const env = useEnvironment();
  const lenis = useSmoothScroll(!env.reducedMotion);
  const [open, setOpen] = useState<string | null>(slugFromHash);

  // Deep links: #work/flowboard opens that case study
  useEffect(() => {
    const onHash = () => setOpen(slugFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Freeze page scrolling behind the case study
  useEffect(() => {
    if (open) lenis.current?.stop();
    else lenis.current?.start();
    document.documentElement.classList.toggle("drawer-open", Boolean(open));
  }, [open, lenis]);

  const openProject = useCallback((slug: string) => {
    history.pushState(null, "", `#work/${slug}`);
    setOpen(slug);
  }, []);

  const closeProject = useCallback(() => {
    history.pushState(null, "", "#work");
    setOpen(null);
  }, []);

  const go = useCallback((selector: string) => scrollToTarget(lenis.current, selector), [lenis]);

  const project = projects.find((p) => p.slug === open) ?? null;

  return (
    <>
      <a className="skip" href="#work">Skip to the work</a>
      <Nav onNavigate={go} />
      <main>
        <Hero env={env} onNavigate={go} />
        <Gallery env={env} onOpen={openProject} />
        <Services />
        <About />
        <Notes env={env} />
        <Contact />
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <p>Designed and built by akrambgh1 with React, GSAP, Lenis and Three.js.</p>
          <button className="link" onClick={() => scrollToTarget(lenis.current, 0)}>Back to top</button>
        </div>
      </footer>

      <CaseStudy project={project} onClose={closeProject} onOpen={openProject} />

      {env.webgl && env.finePointer && !env.reducedMotion && (
        <Suspense fallback={null}>
          <HoverDistortion />
        </Suspense>
      )}
    </>
  );
}
