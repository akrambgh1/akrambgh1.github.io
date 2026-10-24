import { gsap } from "gsap";
import { ExternalLink, Github, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { KIND_LABEL, projects, type Project } from "../content";
import ArchDiagram from "./ArchDiagram";

interface Props {
  project: Project | null;
  onClose: () => void;
  onOpen: (slug: string) => void;
}

/** Slide-over with the story, architecture and code behind a project. */
export default function CaseStudy({ project, onClose, onOpen }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const isOpen = useRef(false);
  // Keep the last project rendered while the panel animates out
  const last = useRef<Project | null>(project);
  if (project) last.current = project;
  const [, rerender] = useState(0);
  const shown = last.current;

  useLayoutEffect(() => {
    const p = panel.current;
    const s = scrim.current;
    if (!p || !s) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf([p, s]); // reopening mid-close must not let the old close finish
    if (project) {
      p.scrollTop = 0;
      if (!isOpen.current) {
        // Opening from closed: start off-screen. Going to the next project keeps the panel where it is.
        lastFocus.current = document.activeElement as HTMLElement;
        gsap.set([p, s], { visibility: "visible" });
        gsap.set(p, { x: 0, xPercent: reduce ? 0 : 100 });
        isOpen.current = true;
      }
      // Always tween *to* open, so running this twice (React StrictMode) can't leave it halfway
      gsap.to(s, { opacity: 1, duration: reduce ? 0 : 0.5, ease: "power2.out" });
      gsap.to(p, { x: 0, xPercent: 0, duration: reduce ? 0 : 0.9, ease: "expo.out" });
      if (!reduce) gsap.fromTo(p.querySelectorAll(".cs-reveal"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, delay: 0.25, ease: "expo.out" });
      closeBtn.current?.focus({ preventScroll: true });
    } else if (shown) {
      isOpen.current = false;
      gsap.to(s, { opacity: 0, duration: reduce ? 0 : 0.4 });
      gsap.to(p, {
        xPercent: reduce ? 0 : 100,
        duration: reduce ? 0 : 0.6,
        ease: "expo.in",
        onComplete: () => {
          gsap.set([p, s], { visibility: "hidden" });
          last.current = null;
          rerender((n) => n + 1);
          lastFocus.current?.focus?.({ preventScroll: true });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.slug]);

  // Escape closes; Tab stays inside the panel while it is open
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  const p = shown;
  const index = p ? projects.findIndex((x) => x.slug === p.slug) : -1;
  const next = index >= 0 ? projects[(index + 1) % projects.length] : null;

  return (
    <>
      <div className="cs-scrim" ref={scrim} onClick={onClose} aria-hidden />
      <div
        className="cs-panel"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-title"
        aria-hidden={!project}
        data-lenis-prevent
      >
        {p && (
          <article className="cs">
            <header className="cs-bar">
              <span className="cs-kind">{KIND_LABEL[p.kind]} case study</span>
              <button ref={closeBtn} className="icon-btn" onClick={onClose} aria-label="Close the case study">
                <X size={20} strokeWidth={1.5} />
              </button>
            </header>

            <div className="cs-intro cs-reveal">
              <h2 id="cs-title" className="cs-title">{p.title}</h2>
              <p className="cs-tagline">{p.tagline}</p>
              <div className="cs-links">
                <a className="btn dark" href={p.live} target="_blank" rel="noopener noreferrer">
                  Open the live demo <ExternalLink size={15} strokeWidth={1.6} aria-hidden />
                </a>
                <a className="btn outline" href={p.repo} target="_blank" rel="noopener noreferrer">
                  <Github size={15} strokeWidth={1.6} aria-hidden /> Read the code
                </a>
              </div>
              {p.note && <p className="cs-note">{p.note}</p>}
            </div>

            <figure className="cs-plate cs-reveal">
              <img src={p.image} alt={`Screenshot of ${p.title}`} width={1568} height={765} />
            </figure>

            <dl className="cs-facts cs-reveal">
              <div><dt>Role</dt><dd>Design and engineering</dd></div>
              <div><dt>Year</dt><dd>{p.year}</dd></div>
              <div><dt>Hosting</dt><dd>{p.hosting}</dd></div>
              <div><dt>Stack</dt><dd>{p.stack.join(", ")}</dd></div>
            </dl>

            <section className="cs-block cs-reveal">
              <h3>What it is</h3>
              <p>{p.summary}</p>
            </section>

            <section className="cs-block cs-reveal">
              <h3>The question</h3>
              <p>{p.problem}</p>
            </section>

            <section className="cs-block cs-reveal">
              <h3>How it works</h3>
              <ul className="cs-list">
                {p.approach.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </section>

            <section className="cs-block cs-reveal">
              <h3>Architecture</h3>
              <ArchDiagram project={p} />
            </section>

            <section className="cs-block cs-reveal">
              <h3>A piece of the code</h3>
              <figure className="code">
                <figcaption>{p.code.file}</figcaption>
                <pre><code>{p.code.snippet}</code></pre>
              </figure>
            </section>

            <section className="cs-block cs-reveal">
              <h3>Results</h3>
              <ul className="cs-outcomes">
                {p.outcomes.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </section>

            {next && (
              <button className="cs-next" onClick={() => onOpen(next.slug)}>
                <span className="cs-next-label">Next project</span>
                <span className="cs-next-title">{next.title}</span>
              </button>
            )}
          </article>
        )}
      </div>
    </>
  );
}
