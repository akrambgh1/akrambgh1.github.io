import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState } from "react";
import { KIND_LABEL, projects, type Kind, type Project } from "../content";
import { setHoverMouse, setHoverTarget } from "../gl/hoverStore";
import type { Environment } from "../hooks/useEnvironment";

gsap.registerPlugin(Flip, ScrollTrigger);

type Filter = "all" | Kind;
const FILTERS: Filter[] = ["all", "frontend", "fullstack", "ai"];

// The magazine rhythm: a large plate, a tall narrow one, a medium one, then a wide one
const LAYOUT = ["spread-a", "spread-b", "spread-c", "spread-d"] as const;

interface Props {
  env: Environment;
  onOpen: (slug: string) => void;
}

function Card({ project, layout, onOpen, interactive }: { project: Project; layout: string; onOpen: (slug: string) => void; interactive: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  const enter = () => frame.current && img.current && interactive && setHoverTarget({ frame: frame.current, img: img.current });
  const leave = () => interactive && setHoverTarget(null);

  return (
    <article className={`work ${layout}`} data-flip-id={project.slug} data-kind={project.kind}>
      <button
        className="work-link"
        onClick={() => onOpen(project.slug)}
        onPointerEnter={enter}
        onPointerLeave={leave}
        onPointerMove={(e) => interactive && setHoverMouse(e.clientX, e.clientY)}
        onFocus={enter}
        onBlur={leave}
        aria-label={`${project.title}: ${project.tagline} Open the case study`}
      >
        <div className="work-frame" ref={frame}>
          <img ref={img} className="work-img" src={project.image} alt="" loading="lazy" decoding="async" width={1568} height={765} style={project.focus ? { objectPosition: project.focus } : undefined} />
        </div>
        <div className="work-caption">
          <h3 className="work-title">{project.title}</h3>
          <p className="work-tagline">{project.tagline}</p>
          <p className="work-meta">
            {KIND_LABEL[project.kind]}, {project.year}
          </p>
        </div>
      </button>
    </article>
  );
}

export default function Gallery({ env, onOpen }: Props) {
  const root = useRef<HTMLElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const visible = projects.filter((p) => filter === "all" || p.kind === filter);

  // Image-mask reveals and inner parallax, set up once per filter result
  useLayoutEffect(() => {
    if (env.reducedMotion || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".work").forEach((card) => {
        const frame = card.querySelector(".work-frame");
        const image = card.querySelector(".work-img");
        gsap.fromTo(
          frame,
          { clipPath: "inset(18% 9% 18% 9%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "expo.out", duration: 1.6, scrollTrigger: { trigger: card, start: "top 88%", once: true } }
        );
        gsap.fromTo(image, { yPercent: -7, scale: 1.12 }, { yPercent: 7, scale: 1.12, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, [env.reducedMotion, filter]);

  // Flip: cards glide to their new spots when the filter changes
  useLayoutEffect(() => {
    if (!flipState.current) return;
    const state = flipState.current;
    flipState.current = null;
    if (env.reducedMotion) return;
    Flip.from(state, {
      targets: ".work",
      duration: 0.9,
      ease: "expo.inOut",
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.4 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [filter, env.reducedMotion]);

  const choose = (f: Filter) => {
    if (f === filter) return;
    if (root.current) flipState.current = Flip.getState(root.current.querySelectorAll(".work"));
    setHoverTarget(null);
    setFilter(f);
  };

  return (
    <section id="work" className="section gallery" ref={root} aria-labelledby="work-title">
      <div className="wrap">
        <header className="gallery-head">
          <h2 id="work-title" className="display-2">Selected work</h2>
          <p className="lede">
            Nine products, each designed, built, tested and deployed end to end. Open any of them for the decisions behind it.
          </p>
          <div className="filters" role="group" aria-label="Show projects by type">
            {FILTERS.map((f) => (
              <button key={f} className={`filter ${filter === f ? "is-active" : ""}`} aria-pressed={filter === f} onClick={() => choose(f)}>
                {f === "all" ? "Everything" : KIND_LABEL[f]}
                <span className="filter-count">{f === "all" ? projects.length : projects.filter((p) => p.kind === f).length}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="works">
          {visible.map((p, i) => (
            <Card key={p.slug} project={p} layout={LAYOUT[i % LAYOUT.length]} onOpen={onOpen} interactive={env.finePointer && env.webgl && !env.reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}
