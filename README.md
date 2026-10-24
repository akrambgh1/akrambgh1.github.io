# akrambgh1, portfolio

An editorial portfolio for nine shipped projects. It's built to frame the work: warm paper and charcoal, one copper accent, large serif type, and real screenshots of every live demo.

**🔗 Live:** https://akrambgh1.github.io/

## What's inside

- **Hero**: a full-bleed WebGL shader that slowly cross-dissolves through screenshots of my own apps, toned to warm charcoal, with soft blur, drift and grain. It pauses when it's off-screen and shows a single still frame when "reduce motion" is on.
- **Selected work**: an asymmetric magazine grid (wide, tall, medium, wide) with clip-path mask reveals and inner parallax on scroll. Filters re-flow the grid with **GSAP Flip**.
- **Hover distortion**: one shared WebGL canvas draws a soft lens over the hovered thumbnail. It's clipped to the card with a scissor test, so the parallax and reveal underneath stay in sync. One WebGL context serves every card, it only renders while hovering, and it doesn't load on touch devices.
- **Case studies**: a slide-over drawer per project, with the question, the decisions, an **architecture diagram generated from data**, a real code excerpt and the results. Deep links work: `#work/flowboard`. Focus is trapped and Esc closes it.
- **Services**, **How I work** (with **live GitHub stats**: repositories, languages, last push) and **Notes from the work** (a pinned horizontal scroll).
- **Contact**: shows a form only once a real endpoint or email is configured.
- **Smooth scrolling** with Lenis, driven by GSAP's ticker so ScrollTrigger stays in sync.

## Stack

| Part | Technology |
|------|------------|
| App | Vite, React 18, TypeScript (strict) |
| Motion | GSAP 3 (ScrollTrigger, Flip), Lenis |
| WebGL | Three.js + @react-three/fiber, custom GLSL shaders |
| Icons | lucide-react |
| Type | Cormorant Garamond, Inter, JetBrains Mono (code only) |
| Hosting | GitHub Pages via GitHub Actions |

## Accessibility and performance

- Respects `prefers-reduced-motion`: no smooth scrolling, no parallax, a still hero and no hover WebGL.
- Keyboard: skip link, visible focus rings, case studies open from the keyboard, and focus is trapped inside the drawer.
- Text contrast meets WCAG AA (secondary text is #6B665E on #F7F5F1).
- Three.js is lazy-loaded in its own chunk, so the text and images render first; WebGL device pixel ratio is capped at 1.5.

## Editing

Everything you might want to change (name, headline, bio, links, projects, notes, testimonials) is in **`src/content.ts`**.

To add a project, use the Claude Code skill in [`.claude/skills/portfolio-updater/SKILL.md`](.claude/skills/portfolio-updater/SKILL.md). It covers screenshots, content rules and verification.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
```

## Projects featured

FlowBoard, Lumen AI, Chatter, Snip, NoteVault, ShopLite, Binge, Spendly and SkyCast. Each has its own repository with a live demo and README.

## License

MIT
