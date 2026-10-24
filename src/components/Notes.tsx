import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { notes, testimonials } from "../content";
import type { Environment } from "../hooks/useEnvironment";

gsap.registerPlugin(ScrollTrigger);

/**
 * Real endorsements when there are some; until then, short notes from the projects themselves.
 * On wide screens the row is pinned and moves sideways as you scroll.
 */
export default function Notes({ env }: { env: Environment }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hasEndorsements = testimonials.length > 0;
  const items = hasEndorsements
    ? testimonials.map((t) => ({ quote: t.quote, source: `${t.name}, ${t.role}` }))
    : notes;

  useLayoutEffect(() => {
    if (env.reducedMotion || !root.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - el.clientWidth;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => mm.revert();
  }, [env.reducedMotion]);

  return (
    <section className="section notes" ref={root} aria-labelledby="notes-title">
      <div className="wrap notes-head">
        <h2 id="notes-title" className="display-2">{hasEndorsements ? "What people say" : "Notes from the work"}</h2>
      </div>
      <div className="notes-track" ref={track}>
        {items.map((n) => (
          <figure key={n.quote} className="note">
            <blockquote>{n.quote}</blockquote>
            <figcaption>{n.source}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
