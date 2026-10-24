---
name: portfolio-updater
description: Add a new project to (or update an existing one in) the akrambgh1.github.io portfolio. Use when the user says "add my new project to the portfolio", "put X on my site", "update the portfolio", "change my bio / name / links", "feature this project", or "add a testimonial".
---

# Portfolio updater

The portfolio is a Vite + React + TypeScript site deployed to https://akrambgh1.github.io/ by GitHub Actions on every push to `main`. **All content lives in `src/content.ts`.** Layout, motion and WebGL read from that file, so adding a project never needs component changes.

## Add a new project

1. **Gather facts from the project itself, not memory.** Read its README and package.json, and run `gh repo view akrambgh1/<repo> --json name,description,homepageUrl,pushedAt`. Never invent metrics: every number in `outcomes` must come from the code or tests (e.g. count the tests with `npm test`).
2. **Screenshot the live demo** at about 1568×765, with the mouse out of frame and no personal data on screen. Save it as `public/projects/<slug>.jpg` (JPEG, ideally under 150 KB).
   - With Claude in Chrome: navigate, `hover` to the bottom-right corner, wait for loading, then `screenshot` with `save_to_disk: true` at scale 1. Copy the saved file from the tool-results folder.
3. **Add an entry to `projects` in `src/content.ts`**, following the `Project` interface:
   - `slug` (url-safe, used in `#work/<slug>`), `title`, `kind` (`"frontend" | "fullstack" | "ai"`), `year`
   - `tagline`: one sentence, sentence case, describing what it *does* for a person
   - `summary`, `problem`, `approach` (3 bullets about decisions), `outcomes` (3 short verifiable facts)
   - `stack` (max 5), `image`, an optional `focus` (CSS object-position such as `"0% 0%"` if the important part is top-left), `live`, `repo`, `hosting`, and an optional `note` (e.g. cold-start warnings)
   - `architecture`: 3–5 `nodes` with a `col` (0 = left layer) and `edges` as `[from, to, label?]`. Edges that skip a column are drawn dashed in copper (use this for direct or peer-to-peer links).
   - `code`: a real excerpt of 6–12 lines from the repo, with the `file` path. Never write new code for this.
   - Set `hero: true` only for screenshots of **our own UI** with no third-party imagery (posters, brand products). Keep 3–5 hero images.
4. **Order matters.** The gallery cycles a four-slot rhythm (wide, tall, medium, wide), so put the strongest projects first. The filter counts update automatically.
5. **Copy rules** (these are the design system): no ALL-CAPS labels, no "A · B" middle-dot strings, no "→" in buttons, sentence case, plain verbs. Stats are only things we can count.

## Other updates

- **Name, bio, headline, links**: edit `profile` in `src/content.ts`. `headline` is an array, with one string per line.
- **Contact form**: set `profile.contact.formEndpoint` (e.g. a Formspree URL) to show the form, or `profile.contact.email` for a mail link. With neither, only the links show. Never invent an email.
- **Testimonials**: add real ones to `testimonials` (`{ quote, name, role }`); the section switches from "Notes from the work" to "What people say" automatically. Never write fictional endorsements.

## Verify, then ship

```bash
npm run typecheck     # zero TypeScript errors
npm run build         # must succeed
npm run dev           # check the new card, its hover, and its case study (#work/<slug>)
```

Check at about 375px and about 1440px wide: no horizontal scroll, the image crop shows the important part, and the case-study diagram is readable. Then commit (`Portfolio: add <title>`) and push to `main`. GitHub Actions deploys in about a minute; confirm with `gh run list -R akrambgh1/akrambgh1.github.io -L 1`.
