import { useEffect, useState } from "react";

export interface GitHubStats {
  repos: number;
  stars: number;
  commits90: number | null; // pushed commits in the last 90 days (from public events)
  languages: string[];
  lastPush: string | null;
  joined: string | null;
}

const CACHE_KEY = "portfolio:gh-stats";
const TTL = 60 * 60 * 1000; // the public API allows 60 requests an hour, so cache for an hour

/** Live numbers from the public GitHub API, cached in sessionStorage. Falls back quietly. */
export function useGitHubStats(user: string) {
  const [stats, setStats] = useState<GitHubStats | null>(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const { at, data } = JSON.parse(raw);
        if (Date.now() - at < TTL) return data;
      }
    } catch {
      /* storage blocked */
    }
    return null;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (stats) return;
    let alive = true;
    const get = (path: string) =>
      fetch(`https://api.github.com${path}`, { headers: { Accept: "application/vnd.github+json" } }).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      });

    Promise.all([get(`/users/${user}`), get(`/users/${user}/repos?per_page=100&sort=pushed`), get(`/users/${user}/events/public?per_page=100`)])
      .then(([profile, repos, events]) => {
        const own = (repos as { fork: boolean; stargazers_count: number; language: string | null; pushed_at: string }[]).filter((r) => !r.fork);
        const counts: Record<string, number> = {};
        own.forEach((r) => r.language && (counts[r.language] = (counts[r.language] ?? 0) + 1));
        const since = Date.now() - 90 * 864e5;
        const pushes = (events as { type: string; created_at: string; payload: { size?: number; commits?: unknown[] } }[]).filter(
          (e) => e.type === "PushEvent" && new Date(e.created_at).getTime() > since
        );
        const data: GitHubStats = {
          repos: profile.public_repos ?? own.length,
          stars: own.reduce((s, r) => s + r.stargazers_count, 0),
          commits90: pushes.length ? pushes.reduce((s, e) => s + (e.payload.size ?? e.payload.commits?.length ?? 0), 0) : null,
          languages: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([l]) => l),
          lastPush: own[0]?.pushed_at ?? null,
          joined: profile.created_at ?? null,
        };
        if (!alive) return;
        setStats(data);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [user, stats]);

  return { stats, failed };
}
