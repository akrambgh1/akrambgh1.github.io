// ✏️ All portfolio content lives here. The /portfolio-updater skill edits this file.

export type Kind = "frontend" | "fullstack" | "ai";

export interface ArchNode {
  id: string;
  label: string;
  note?: string;
  col: number; // left-to-right layer in the diagram
}

export interface Project {
  slug: string;
  title: string;
  kind: Kind;
  year: number;
  tagline: string; // one line, shown on the card
  summary: string; // a short paragraph for the case study
  problem: string;
  approach: string[];
  outcomes: string[];
  stack: string[];
  image: string;
  focus?: string; // CSS object-position for the crop, e.g. "0% 0%" to keep the top-left in view
  hero?: boolean; // used in the hero image sequence (only our own UI, no third-party imagery)
  live: string;
  repo: string;
  hosting: string;
  note?: string;
  architecture: { nodes: ArchNode[]; edges: [string, string, string?][] };
  code: { file: string; lang: string; snippet: string };
}

export const profile = {
  name: "akrambgh1",
  role: "Full-stack engineer",
  github: "akrambgh1",
  headline: ["I build calm, fast", "software for the web."], // one entry per line
  intro:
    "Interfaces in React, APIs in Node.js, real-time systems and machine learning that runs in the browser. Every project here is shipped, tested and live.",
  about: [
    "I learn by shipping. Each project in this portfolio started as a question (how does a WebRTC mesh negotiate, how do you count unique visitors without storing an IP) and ended as a working product with a README that explains the decisions.",
    "I care about the parts people feel but rarely name: undo after a delete, an honest error message, a page that works on a slow phone, a test that catches the bug before a user does.",
  ],
  available: true,
  contact: {
    // Add an email to show a "write to me" link, or a form endpoint (e.g. Formspree) to show the form.
    email: "",
    formEndpoint: "",
    links: [{ label: "GitHub", href: "https://github.com/akrambgh1" }],
  },
};

export const services = [
  {
    title: "Product frontends",
    body: "Interfaces that feel considered: keyboard-first interactions, drag and drop, optimistic updates and motion that explains what changed.",
    items: ["React and TypeScript", "Design systems with CSS custom properties", "Accessibility and responsive layouts", "GSAP, Web Audio and WebGL where they earn their place"],
  },
  {
    title: "APIs and data",
    body: "Backends that are boring in the best way: validated input, clear status codes, scoped queries and integration tests that run with one command.",
    items: ["Node.js and Express", "Postgres and SQLite with one query layer", "JWT auth, bcrypt and rate limiting", "Serverless on Vercel, services on Render"],
  },
  {
    title: "Real-time and on-device",
    body: "Software that responds as you act: live chat and voice between browsers, and machine-learning models that run privately on your own device.",
    items: ["WebSockets with Socket.io", "WebRTC voice in a peer-to-peer mesh", "Transformers.js and Web Workers", "Privacy-friendly analytics"],
  },
];

// Your own working principles. Real endorsements go in `testimonials` below; that section only appears when it has entries.
export const notes = [
  { quote: "If a person can undo it, they will try it. Undo is the cheapest confidence you can ship.", source: "On FlowBoard" },
  { quote: "The fastest server is the one you don't need. Four AI models run in the browser, and nobody's text leaves their laptop.", source: "On Lumen" },
  { quote: "Count people, not addresses. A daily salted hash answers the analytics question without keeping anything personal.", source: "On Snip" },
  { quote: "Write the query once and test it twice. The same suite runs on SQLite and on Postgres, so production holds no surprises.", source: "On NoteVault" },
];

export const testimonials: { quote: string; name: string; role: string }[] = [];

export const projects: Project[] = [
  {
    slug: "flowboard",
    title: "FlowBoard",
    kind: "frontend",
    year: 2026,
    tagline: "A Notion-style workspace: pages, boards, tables and a calendar for the same tasks.",
    summary:
      "A task workspace with a sidebar of pages, where each page shows its tasks as a board, a table or a month calendar. Tasks open in a side panel with tags, checklists and notes, and Ctrl+K searches everything.",
    problem:
      "Kanban demos usually stop at three columns and a drag. I wanted the depth of a real tool: several views of one dataset, keyboard support and recovery from mistakes.",
    approach: [
      "One reducer owns pages, groups and tasks, so every view reads the same flat task list.",
      "dnd-kit sensors for mouse, touch and keyboard; the calendar uses native drag and drop to reschedule.",
      "Undo after delete, JSON import/export with validation, and a command palette over every page.",
    ],
    outcomes: ["3 synchronized views", "Keyboard, touch and mouse drag", "Zero backend: state persists locally"],
    stack: ["React", "dnd-kit", "useReducer", "Vite"],
    image: "/projects/flowboard.jpg",
    focus: "0% 0%",
    hero: true,
    live: "https://akrambgh1.github.io/kanban-board/",
    repo: "https://github.com/akrambgh1/kanban-board",
    hosting: "GitHub Pages",
    architecture: {
      nodes: [
        { id: "ui", label: "Board, table, calendar", note: "three views", col: 0 },
        { id: "palette", label: "Command palette", note: "Ctrl+K", col: 0 },
        { id: "store", label: "Workspace reducer", note: "pages → groups → tasks", col: 1 },
        { id: "storage", label: "localStorage", note: "persist + import/export", col: 2 },
      ],
      edges: [["ui", "store", "dispatch"], ["palette", "store", "actions"], ["store", "storage", "save"]],
    },
    code: {
      file: "src/components/BoardView.jsx",
      lang: "js",
      snippet: `// Move the card into another column while it is dragged over it
const handleDragOver = ({ active, over }) => {
  const task = all.find((t) => t.id === active.id);
  const target = statusOf(over.id);
  if (!task || !target || task.status === target) return;
  const next = all.filter((t) => t.id !== active.id);
  const at = next.findIndex((t) => t.id === over.id);
  next.splice(at < 0 ? next.length : at, 0, { ...task, status: target });
  setTasks(next);
};`,
    },
  },
  {
    slug: "lumen",
    title: "Lumen AI",
    kind: "ai",
    year: 2026,
    tagline: "Four machine-learning models running privately in the browser.",
    summary:
      "Sentiment analysis, zero-shot topic classification, summarization and image recognition, all running on the visitor's device with Transformers.js. No server, no API key, and no text or image leaves the browser.",
    problem:
      "AI demos usually mean an API key and a bill. I wanted to show that useful models can run on-device, fast enough to feel instant after the first download.",
    approach: [
      "Models load in a Web Worker with live download progress, so the interface never freezes.",
      "Requests are matched by id, so replies can't get mixed up when tools are used quickly.",
      "After testing, I replaced a weak zero-shot model with DeBERTa-v3: accuracy went from wrong to 83–93% on the samples.",
    ],
    outcomes: ["0.2–0.4 s text inference", "4 models, cached after first use", "Works offline after loading"],
    stack: ["Transformers.js", "ONNX Runtime Web", "Web Worker", "React"],
    image: "/projects/lumen.jpg",
    hero: true,
    live: "https://akrambgh1.github.io/ai-toolkit/",
    repo: "https://github.com/akrambgh1/ai-toolkit",
    hosting: "GitHub Pages",
    architecture: {
      nodes: [
        { id: "ui", label: "React tools", note: "4 panels", col: 0 },
        { id: "worker", label: "Web Worker", note: "pipelines + progress", col: 1 },
        { id: "onnx", label: "ONNX Runtime", note: "WebAssembly", col: 2 },
        { id: "hub", label: "Hugging Face Hub", note: "downloaded once, cached", col: 2 },
      ],
      edges: [["ui", "worker", "postMessage"], ["worker", "onnx", "run"], ["worker", "hub", "first load"]],
    },
    code: {
      file: "src/worker.js",
      lang: "js",
      snippet: `self.addEventListener("message", async ({ data }) => {
  const { id, tool, input } = data;
  try {
    await load(tool); // time only the model run, not the download
    const started = performance.now();
    const result = await run(tool, input);
    self.postMessage({ type: "result", id, result, ms: Math.round(performance.now() - started) });
  } catch (err) {
    self.postMessage({ type: "error", id, message: err.message });
  }
});`,
    },
  },
  {
    slug: "chatter",
    title: "Chatter",
    kind: "fullstack",
    year: 2026,
    tagline: "Real-time chat with Discord-style voice channels.",
    summary:
      "Text rooms with typing indicators and history, plus voice channels you simply click to join. Audio flows directly between browsers over WebRTC, with green speaking rings, mute and deafen.",
    problem:
      "Most chat demos stop at messages. Voice is where real-time gets interesting: negotiation, NAT traversal and keeping many peers in sync.",
    approach: [
      "Socket.io carries chat and the WebRTC signaling; the server never touches audio.",
      "Only the newcomer sends offers, so two peers never call each other at the same moment.",
      "Signals are validated and relayed only between members of the same channel.",
    ],
    outcomes: ["Peer-to-peer voice mesh (up to 8)", "Live speaking detection", "6 Socket.io integration tests"],
    stack: ["Socket.io", "WebRTC", "Node.js", "Web Audio API"],
    image: "/projects/chatter.jpg",
    live: "https://chatter-realtime-chat.onrender.com/",
    repo: "https://github.com/akrambgh1/realtime-chat",
    hosting: "Render",
    note: "Free hosting: the first visit can take about 30 seconds to wake the server.",
    architecture: {
      nodes: [
        { id: "a", label: "Browser A", note: "mic + chat", col: 0 },
        { id: "server", label: "Socket.io server", note: "rooms + signaling", col: 1 },
        { id: "b", label: "Browser B", note: "mic + chat", col: 2 },
        { id: "stun", label: "STUN", note: "public address lookup", col: 1 },
      ],
      edges: [["a", "server", "offer / ICE"], ["server", "b", "relay"], ["a", "b", "audio (P2P)"], ["a", "stun"]],
    },
    code: {
      file: "src/chat.js",
      lang: "js",
      snippet: `socket.on("voice:signal", ({ to, ...data } = {}) => {
  const user = users.get(socket.id);
  const peer = users.get(to);
  const signal = cleanSignal(data);
  // Relay only between two people in the same voice channel
  if (!user?.voice || !peer || peer.voice !== user.voice || !signal) return;
  io.to(to).emit("voice:signal", { from: socket.id, ...signal });
});`,
    },
  },
  {
    slug: "snip",
    title: "Snip",
    kind: "fullstack",
    year: 2026,
    tagline: "Short links, QR codes and honest click analytics.",
    summary:
      "A URL shortener with custom aliases, QR codes and a dashboard of clicks by day, referrer, browser and device. Bots are ignored and unique visitors are counted without storing anyone's IP.",
    problem:
      "Link analytics tend to collect more than they need. The question was how little data still answers 'who clicked, from where, on what'.",
    approach: [
      "Unique visitors use a daily salted hash of IP and browser; the raw IP is never stored.",
      "One query layer runs on SQLite locally and Postgres (Neon) in production.",
      "Days without clicks are filled in so the chart never lies with gaps.",
    ],
    outcomes: ["16 tests on SQLite + Postgres", "Bot and crawler filtering", "Serverless on Vercel"],
    stack: ["Node.js", "Express", "Postgres", "Chart.js"],
    image: "/projects/snip.jpg",
    live: "https://link-shortener-alpha-orpin.vercel.app/",
    repo: "https://github.com/akrambgh1/link-shortener",
    hosting: "Vercel + Neon",
    architecture: {
      nodes: [
        { id: "visitor", label: "Visitor", note: "opens /my-link", col: 0 },
        { id: "fn", label: "Vercel function", note: "Express app", col: 1 },
        { id: "db", label: "Neon Postgres", note: "links + clicks", col: 2 },
        { id: "dash", label: "Dashboard", note: "Chart.js", col: 0 },
      ],
      edges: [["visitor", "fn", "302 redirect"], ["fn", "db", "record click"], ["dash", "fn", "stats API"]],
    },
    code: {
      file: "src/app.js",
      lang: "js",
      snippet: `if (!info.bot) {
  // Privacy-friendly unique visitors: a daily hash of IP + browser, never the raw IP
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256")
    .update(\`\${salt}|\${day}|\${req.ip}|\${ua}\`)
    .digest("hex").slice(0, 16);
  await req.db.all(SQL.addClick, [link.id, now(), referrer, info.browser, info.os, info.device, visitor]);
}
res.set("Cache-Control", "no-store").redirect(302, link.url);`,
    },
  },
  {
    slug: "notevault",
    title: "NoteVault",
    kind: "fullstack",
    year: 2026,
    tagline: "A notes app on a tested REST API with JWT login.",
    summary:
      "Sign up, log in and keep notes with tags, colors and pins. The REST API hashes passwords with bcrypt, issues JWTs, scopes every query to its owner and is covered by integration tests on two databases.",
    problem: "Authentication is where small mistakes become real problems, so I wanted an API whose security choices are visible and tested.",
    approach: [
      "The same message for wrong email and wrong password, so accounts can't be probed.",
      "Every note query includes the owner's id; other users get a 404, not a 403.",
      "Rate-limited auth, security headers and a strict content security policy.",
    ],
    outcomes: ["18 tests on SQLite + Postgres", "bcrypt + JWT", "Serverless on Vercel"],
    stack: ["Node.js", "Express", "Postgres", "JWT"],
    image: "/projects/notevault.jpg",
    live: "https://notes-api-omega-tawny.vercel.app/",
    repo: "https://github.com/akrambgh1/notes-api",
    hosting: "Vercel + Neon",
    architecture: {
      nodes: [
        { id: "client", label: "Browser", note: "vanilla JS", col: 0 },
        { id: "auth", label: "Auth middleware", note: "JWT verify", col: 1 },
        { id: "api", label: "Notes routes", note: "validated, scoped", col: 1 },
        { id: "db", label: "Postgres", note: "users + notes", col: 2 },
      ],
      edges: [["client", "auth", "Bearer token"], ["auth", "api"], ["api", "db", "owner-scoped SQL"]],
    },
    code: {
      file: "src/app.js",
      lang: "js",
      snippet: `const user = await req.db.get(SQL.userByEmail, [email]);
// Same message for wrong email and wrong password,
// so attackers can't tell which accounts exist
if (!user || !(await bcrypt.compare(password, user.password_hash))) {
  throw new HttpError(401, "Wrong email or password");
}
res.json({ token: sign(user), user: toUser(user) });`,
    },
  },
  {
    slug: "shoplite",
    title: "ShopLite",
    kind: "frontend",
    year: 2026,
    tagline: "An online store with filters, cart, promo codes and checkout.",
    summary:
      "194 products with search, filters and sorting, product pages with galleries and reviews, a slide-out cart with a free-shipping meter, promo codes and a validated checkout that ends in an order history.",
    problem: "Store demos often fake the hard part. Cart rules (stock limits, promo minimums, shipping thresholds, tax) are where the bugs live.",
    approach: [
      "Totals are a pure function of cart, promo and shipping, so every rule is easy to test.",
      "Filters and sorting compose in one memoized pass over the catalog.",
      "Checkout asks only for shipping details; no payment data is ever collected.",
    ],
    outcomes: ["194 products, 24 categories", "Promo, shipping and tax rules", "Order history"],
    stack: ["React", "REST API", "Vite"],
    image: "/projects/shoplite.jpg",
    focus: "30% 0%",
    live: "https://akrambgh1.github.io/ecommerce-store/",
    repo: "https://github.com/akrambgh1/ecommerce-store",
    hosting: "GitHub Pages",
    architecture: {
      nodes: [
        { id: "catalog", label: "Catalog + filters", col: 0 },
        { id: "cart", label: "Cart rules", note: "pure functions", col: 1 },
        { id: "api", label: "DummyJSON API", note: "cached", col: 2 },
        { id: "store", label: "localStorage", note: "cart and orders", col: 2 },
      ],
      edges: [["catalog", "api", "fetch"], ["catalog", "cart", "add"], ["cart", "store", "persist"]],
    },
    code: {
      file: "src/lib.js",
      lang: "js",
      snippet: `export function cartTotals(items, { promo, shipping = "standard" } = {}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deal = promo ? PROMOS[promo] : null;
  const dealOk = deal && (!deal.minimum || subtotal >= deal.minimum);
  const discount = dealOk && deal.percent ? subtotal * (deal.percent / 100) : 0;
  const free = (dealOk && deal.freeShipping) || subtotal - discount >= 50;
  const tax = (subtotal - discount) * TAX_RATE;
  return { subtotal, discount, shipping: free ? 0 : SHIPPING[shipping].price, tax };
}`,
    },
  },
  {
    slug: "binge",
    title: "Binge",
    kind: "frontend",
    year: 2026,
    tagline: "Search TV shows, browse cast and episodes, keep a watchlist.",
    summary:
      "A media browser on the TVMaze API: live search synced to the URL, a top-rated discover page with genre filters, and show pages with cast and episodes by season.",
    problem: "Media apps live or die on perceived speed: skeletons, caching and never showing a stale result over a fresh one.",
    approach: [
      "Search is debounced and written to the URL, so results can be shared and the back button works.",
      "Requests are cached in memory and a late response can't overwrite a newer one.",
      "Episode lists load only when a season is chosen.",
    ],
    outcomes: ["Hash router written from scratch", "Request caching", "Skeleton loading states"],
    stack: ["React", "TVMaze API", "Custom hooks"],
    image: "/projects/binge.jpg",
    focus: "50% 0%",
    live: "https://akrambgh1.github.io/tv-show-explorer/",
    repo: "https://github.com/akrambgh1/tv-show-explorer",
    hosting: "GitHub Pages",
    architecture: {
      nodes: [
        { id: "router", label: "Hash router", col: 0 },
        { id: "hooks", label: "useAsync, useDebounced", col: 1 },
        { id: "api", label: "TVMaze API", note: "in-memory cache", col: 2 },
      ],
      edges: [["router", "hooks"], ["hooks", "api", "fetch once"]],
    },
    code: {
      file: "src/hooks.js",
      lang: "js",
      snippet: `export function useAsync(loader, deps) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  useEffect(() => {
    let alive = true; // ignore answers that arrive after a newer request
    loader()
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((error) => alive && setState({ loading: false, error, data: null }));
    return () => { alive = false; };
  }, deps);
  return state;
}`,
    },
  },
  {
    slug: "spendly",
    title: "Spendly",
    kind: "frontend",
    year: 2026,
    tagline: "A personal finance dashboard with budgets and charts.",
    summary:
      "Income and expenses by category, month navigation, a spending doughnut and a six-month trend, budgets that warn at 80%, nine currencies and CSV export.",
    problem: "Finance dashboards need numbers people trust: correct rounding, honest comparisons and charts that follow the theme.",
    approach: [
      "Every figure is derived with useMemo from raw transactions, never stored twice.",
      "Money is formatted with Intl.NumberFormat for each currency.",
      "Demo data comes from a seeded generator, so it's the same on every first visit.",
    ],
    outcomes: ["Doughnut + bar charts", "Budget alerts", "CSV export"],
    stack: ["React", "Chart.js", "Intl API"],
    image: "/projects/spendly.jpg",
    focus: "50% 0%",
    hero: true,
    live: "https://akrambgh1.github.io/expense-tracker/",
    repo: "https://github.com/akrambgh1/expense-tracker",
    hosting: "GitHub Pages",
    architecture: {
      nodes: [
        { id: "tx", label: "Transactions", note: "localStorage", col: 0 },
        { id: "derive", label: "Derived totals", note: "useMemo", col: 1 },
        { id: "charts", label: "Charts + budgets", col: 2 },
      ],
      edges: [["tx", "derive"], ["derive", "charts", "render"]],
    },
    code: {
      file: "src/App.jsx",
      lang: "js",
      snippet: `const spentByCategory = useMemo(() => {
  const map = {};
  for (const t of monthTx) {
    if (t.type === "expense") map[t.category] = (map[t.category] ?? 0) + t.amount;
  }
  return map;
}, [monthTx]);`,
    },
  },
  {
    slug: "skycast",
    title: "SkyCast",
    kind: "frontend",
    year: 2026,
    tagline: "A weather app in plain JavaScript, no framework.",
    summary:
      "City search with suggestions, geolocation, current conditions, a 24-hour strip and a 7-day forecast, with backgrounds that change with the weather and the time of day.",
    problem: "A reminder that a framework is optional: what does a polished app look like with only the platform?",
    approach: [
      "Debounced search with stale-response protection.",
      "WMO weather codes mapped to icons, descriptions and day/night themes.",
      "An hourly slider with arrows, drag, wheel and edge fades instead of a default scrollbar.",
    ],
    outcomes: ["No framework, no build step", "Geolocation", "Fully responsive"],
    stack: ["JavaScript", "Open-Meteo API", "CSS"],
    image: "/projects/skycast.jpg",
    hero: true,
    live: "https://akrambgh1.github.io/weather-app/",
    repo: "https://github.com/akrambgh1/weather-app",
    hosting: "GitHub Pages",
    architecture: {
      nodes: [
        { id: "search", label: "Search + geolocation", col: 0 },
        { id: "api", label: "Open-Meteo", note: "geocoding + forecast", col: 1 },
        { id: "render", label: "DOM render", note: "themes by weather", col: 2 },
      ],
      edges: [["search", "api", "fetch"], ["api", "render"]],
    },
    code: {
      file: "app.js",
      lang: "js",
      snippet: `debounceTimer = setTimeout(async () => {
  latestQuery = query;
  const results = await searchCities(query);
  if (query !== latestQuery) return; // a newer search is in flight
  state.suggestions = results;
  renderSuggestions();
}, 300);`,
    },
  },
];

export const KIND_LABEL: Record<Kind, string> = { frontend: "Frontend", fullstack: "Full-stack", ai: "AI" };
