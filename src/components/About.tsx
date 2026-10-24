import { profile, projects } from "../content";
import { useGitHubStats } from "../hooks/useGitHubStats";

const ago = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export default function About() {
  const { stats, failed } = useGitHubStats(profile.github);
  const live = projects.filter((p) => p.live).length;

  // Every figure is either counted from the content file or read live from GitHub
  const figures: { value: string; label: string; source: string }[] = [
    { value: String(projects.length), label: "products shipped", source: "this portfolio" },
    { value: String(live), label: "of them live right now", source: "this portfolio" },
    stats
      ? { value: String(stats.repos), label: "public repositories", source: "GitHub, live" }
      : { value: "…", label: "public repositories", source: failed ? "GitHub is unavailable right now" : "loading from GitHub" },
  ];
  if (stats?.commits90) figures.push({ value: String(stats.commits90), label: "commits pushed in the last 90 days", source: "GitHub, live" });

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="wrap about-grid">
        <div className="about-text">
          <h2 id="about-title" className="display-2">How I work</h2>
          {profile.about.map((p) => <p key={p}>{p}</p>)}
          {stats && (
            <p className="about-live">
              Mostly writing {stats.languages.join(", ")}. Last push {stats.lastPush ? ago(stats.lastPush) : "recently"}.
            </p>
          )}
        </div>
        <dl className="figures">
          {figures.map((f) => (
            <div key={f.label} className="figure">
              <dd className="figure-value">{f.value}</dd>
              <dt className="figure-label">
                {f.label}
                <span className="figure-source">{f.source}</span>
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
