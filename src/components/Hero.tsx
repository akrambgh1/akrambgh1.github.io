import { gsap } from "gsap";
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { profile, projects } from "../content";
import type { Environment } from "../hooks/useEnvironment";

const HeroCanvas = lazy(() => import("../gl/HeroCanvas"));
const heroProjects = projects.filter((p) => p.hero);

interface Props {
  env: Environment;
  onNavigate: (selector: string) => void;
}

export default function Hero({ env, onNavigate }: Props) {
  const root = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [current, setCurrent] = useState(0);
  const onChange = useCallback((i: number) => setCurrent(i), []);
  const showing = heroProjects[current] ?? heroProjects[0];

  // Stop the WebGL loop when the hero scrolls out of view
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The one orchestrated entrance on the page: the headline rises line by line
  useLayoutEffect(() => {
    if (env.reducedMotion || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.set(".hero-line > span", { yPercent: 110 });
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-media", { opacity: 0, duration: 2.2, ease: "power2.out" })
        .to(".hero-line > span", { yPercent: 0, duration: 1.4, stagger: 0.11 }, 0.25)
        .from(".hero-foot > *", { opacity: 0, y: 14, duration: 1, stagger: 0.08 }, 0.9);
      // Gentle parallax as the hero leaves
      gsap.to(".hero-media", {
        yPercent: 18,
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [env.reducedMotion]);

  const lines = profile.headline;

  return (
    <section className="hero" ref={root} aria-label="Introduction">
      <div className="hero-media">
        {env.webgl ? (
          <Suspense fallback={<img className="hero-fallback" src={heroProjects[0].image} alt="" />}>
            <HeroCanvas images={heroProjects.map((p) => p.image)} active={inView} still={env.reducedMotion} onChange={onChange} />
          </Suspense>
        ) : (
          <img className="hero-fallback" src={heroProjects[0].image} alt="" />
        )}
      </div>

      <div className="wrap hero-content">
        <p className="hero-role">
          {profile.name}, {profile.role.toLowerCase()}
          {profile.available && <span className="available">Open to new work</span>}
        </p>
        <h1 className="hero-title">
          {lines.map((line) => (
            <span className="hero-line" key={line}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <div className="hero-foot">
          <p className="hero-intro">{profile.intro}</p>
          <div className="hero-actions">
            <a className="btn light" href="#work" onClick={(e) => { e.preventDefault(); onNavigate("#work"); }}>
              See the work
            </a>
            <a className="btn ghost-light" href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
              GitHub profile
            </a>
          </div>
          <p className="hero-caption" aria-live="polite">
            In the background: <span key={showing.slug}>{showing.title}</span>, {showing.tagline.charAt(0).toLowerCase() + showing.tagline.slice(1)}
          </p>
        </div>
      </div>
    </section>
  );
}
