import { useEffect, useState, type MouseEvent } from "react";
import { profile } from "../content";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Nav({ onNavigate }: { onNavigate: (selector: string) => void }) {
  // Light text over the dark hero, dark text over the paper sections
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setOverHero(e.intersectionRatio > 0.08), { threshold: [0, 0.08, 0.2] });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const go = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <header className={`nav ${overHero ? "is-over-hero" : "is-solid"}`}>
      <div className="wrap nav-inner">
        <a className="nav-name" href="#top" onClick={go("body")}>
          {profile.name}
        </a>
        <nav aria-label="Sections">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={go(l.href)}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
