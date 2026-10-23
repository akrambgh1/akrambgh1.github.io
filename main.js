// Renders the portfolio from data.js. All text is inserted with textContent.
const P = window.PORTFOLIO;
const $ = (id) => document.getElementById(id);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(href, className, text, external = true) {
  const a = el("a", className, text);
  a.href = href;
  if (external) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  return a;
}

const TYPE_LABEL = { frontend: "Frontend", fullstack: "Full-stack", ai: "AI" };
const repoUrl = (repo) => `https://github.com/${P.github}/${repo}`;

// ---------- hero ----------
document.title = `${P.name} — ${P.role} Portfolio`;
$("navName").textContent = P.name;
$("heroName").textContent = P.name;
$("heroRole").textContent = P.role;
$("tagline").textContent = P.tagline;
$("footName").textContent = P.name;
$("avatar").src = `https://github.com/${P.github}.png?size=224`;
$("githubBtn").href = `https://github.com/${P.github}`;
$("available").hidden = !P.available;

const liveCount = P.projects.filter((p) => p.live).length;
const techCount = new Set([...Object.values(P.skills).flat(), ...P.projects.flatMap((p) => p.tech)]).size;
const stats = [
  [P.projects.length, "projects shipped"],
  [liveCount, "live demos"],
  [techCount, "skills & tools"],
  ["100%", "open source"],
];
$("stats").replaceChildren(
  ...stats.map(([value, label]) => {
    const d = el("div", "stat");
    d.append(el("dt", "", label), el("dd", "", String(value)));
    return d;
  })
);

// ---------- project cards ----------
function cover(p, big = false) {
  const c = el("div", `cover ${big ? "big" : ""}`);
  c.style.setProperty("--c1", p.colors[0]);
  c.style.setProperty("--c2", p.colors[1]);
  const win = el("div", "window");
  const bar = el("div", "window-bar");
  bar.append(el("i"), el("i"), el("i"), el("span", "window-url", p.live ? p.live.replace("https://", "") : `github.com/${P.github}/${p.repo}`));
  win.append(bar, el("div", "window-emoji", p.emoji));
  c.append(win);
  return c;
}

function actions(p) {
  const row = el("div", "card-actions");
  if (p.live) row.append(link(p.live, "btn primary sm", "Live demo ↗"));
  row.append(link(repoUrl(p.repo), `btn ${p.live ? "ghost" : "primary"} sm`, "Source code"));
  if (!p.live) row.append(el("span", "note", "Needs a server · run locally or deploy free"));
  return row;
}

function tags(list) {
  const t = el("ul", "tags");
  list.forEach((x) => t.append(el("li", "", x)));
  return t;
}

function featuredCard(p, i) {
  const card = el("article", `feature ${i % 2 ? "flip" : ""}`);
  const body = el("div", "feature-body");
  const kicker = el("div", "kicker");
  kicker.append(el("span", `type ${p.type}`, TYPE_LABEL[p.type]), el("span", "repo-meta", ""));
  kicker.lastChild.dataset.repo = p.repo;
  const h = el("h3", "", `${p.title}`);
  const ul = el("ul", "highlights");
  p.highlights.forEach((x) => ul.append(el("li", "", x)));
  body.append(kicker, h, el("p", "desc", p.description), ul, tags(p.tech), actions(p));
  card.append(cover(p, true), body);
  return card;
}

function gridCard(p) {
  const card = el("article", "card");
  card.dataset.type = p.type;
  const body = el("div", "card-body");
  const head = el("div", "card-head");
  head.append(el("h3", "", p.title), el("span", `type ${p.type}`, TYPE_LABEL[p.type]));
  const meta = el("span", "repo-meta", "");
  meta.dataset.repo = p.repo;
  body.append(head, el("p", "desc", p.description), tags(p.tech), meta, actions(p));
  card.append(cover(p), body);
  return card;
}

$("featured").replaceChildren(...P.projects.filter((p) => p.featured).map(featuredCard));
$("grid").replaceChildren(...P.projects.map(gridCard));

document.querySelectorAll(".filter").forEach((btn) =>
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".card").forEach((c) => (c.hidden = f !== "all" && c.dataset.type !== f));
  })
);

// ---------- skills ----------
const SKILL_ICONS = { Frontend: "🎨", Backend: "🛠️", Tools: "🧰", AI: "🧠" };
$("skillGroups").replaceChildren(
  ...Object.entries(P.skills).map(([group, items]) => {
    const g = el("div", "skill-group");
    g.append(el("h3", "", `${SKILL_ICONS[group] ?? "•"} ${group}`), tags(items));
    return g;
  })
);

// ---------- about & contact ----------
$("aboutText").replaceChildren(...P.about.map((t) => el("p", "", t)));

const contact = [[`https://github.com/${P.github}`, "🐙 GitHub"]];
if (P.links.linkedin) contact.push([P.links.linkedin, "💼 LinkedIn"]);
if (P.links.twitter) contact.push([P.links.twitter, "🐦 Twitter / X"]);
if (P.links.email) contact.unshift([`mailto:${P.links.email}`, "✉️ Email me"]);
$("contactLinks").replaceChildren(...contact.map(([href, text], i) => link(href, `btn ${i === 0 ? "primary" : "ghost"}`, text, !href.startsWith("mailto:"))));

// ---------- live GitHub data (optional, fails quietly) ----------
fetch(`https://api.github.com/users/${P.github}/repos?per_page=100&sort=updated`)
  .then((r) => (r.ok ? r.json() : []))
  .then((repos) => {
    const byName = Object.fromEntries(repos.map((r) => [r.name, r]));
    document.querySelectorAll(".repo-meta").forEach((m) => {
      const r = byName[m.dataset.repo];
      if (!r) return;
      const updated = new Date(r.pushed_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      m.textContent = `${r.stargazers_count ? `★ ${r.stargazers_count} · ` : ""}updated ${updated}`;
    });
  })
  .catch(() => {});

// ---------- theme ----------
const themeBtn = $("themeBtn");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const currentTheme = () => document.documentElement.dataset.theme ?? (systemDark.matches ? "dark" : "light");
const syncIcon = () => (themeBtn.textContent = currentTheme() === "dark" ? "☀️" : "🌙");
themeBtn.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("portfolio:theme", next); } catch { /* ignore */ }
  syncIcon();
});
systemDark.addEventListener("change", syncIcon);
syncIcon();

// ---------- reveal on scroll ----------
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.12 })
  : null;
document.querySelectorAll(".feature, .card, .skill-group, .principles li").forEach((n) => {
  if (io && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    n.classList.add("reveal");
    io.observe(n);
  }
});
