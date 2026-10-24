import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis momentum scrolling, driven by GSAP's ticker so ScrollTrigger
 * and Lenis always agree on the scroll position. Disabled for reduced motion.
 */
export function useSmoothScroll(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 3.2), smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}

/** Scroll to an element or the top, smoothly when Lenis is active. */
export function scrollToTarget(lenis: Lenis | null, target: string | HTMLElement | number) {
  if (lenis) {
    lenis.scrollTo(target as never, { offset: typeof target === "number" ? 0 : -8 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target });
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
}
