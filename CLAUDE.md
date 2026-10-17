# CLAUDE.md — LA Peptides Market Analysis

Read this before touching anything. It is the contract for how this project is built.
When a request conflicts with a rule here, stop and flag it — don't silently override.

## What this is

A single-screen competitive **price-comparison table** for LA Peptides, a US-synthesized
(domestic SPPS) peptide vendor. It catalogs every LA Peptides SKU and mg variant across
seven categories, shows the per-mg breakdown, places competitors side by side, and flags
where LA wins on price. The audience is a sales/strategy review — a buyer or partner scans
one category and immediately sees the value story without reading prose.

There are two markets, toggled by a segmented control:
- **US-Synthesized** (`us`) — the primary comparison, other domestic SPPS vendors.
- **Grey-Market** (`grey`) — Chinese-API-sourced vendors, competitive intel only, carries a risk banner.

Intent lives in two files — treat them as source of truth for *why*, not just *what*:
- `PRODUCT.md` — audience, purpose, brand personality, anti-references, accessibility floor.
- `DESIGN.md` — theme, exact color tokens, typography, components, motion.

## The single most important rule

**LA Peptides stays the loudest thing on screen.** Every visual decision serves this.
LA's price and `$/mg` columns get a faint teal wash (`--brand-tint`) and the heaviest type
(`.price-la`, 800 weight, `--brand-deep`). Competitors are quiet reference points — their
brand colors appear ONLY as legend dots and 2px header underlines, NEVER on price text.
If a change makes a competitor column compete for attention with LA, it is wrong.

## Architecture (know this before editing)

Everything is in **`src/App.jsx`** — one ~975-line file, no component library, no CSS files.

- **Data and presentation are the same file.** The `MARKETS` object (~line 113) holds all
  pricing. `VENDORS` (~line 8), `EXCL` (~line 26), and `NOTES` (~line 36) are lookup tables.
  The `CSS` template string at the bottom (~line 754) is the entire stylesheet, injected via
  `<style>{CSS}</style>`.
- **Styling is CSS custom properties + a `<style>` block.** No Tailwind, no CSS modules, no
  inline styles except the few dynamic ones (`--u` underline color, `--hdr-h`, `scrollMarginTop`).
- **No routing, no state management, no data fetching.** Prices are hardcoded, verified
  by hand against vendor sites on a dated snapshot. State is three `useState` hooks in `App`.
- **Two `useEffect` hooks** drive the sticky-header measurement and the scroll-spy that lights
  the active jump-nav tab. Don't refactor these casually — the `rootMargin` math is load-bearing.

### The data model (memorize the shape)

```
MARKETS[marketId] = {
  id, label, sub,
  intro: { kind: "ok" | "warn", text },
  cols: [ { k: "<vendorKey>", tier: "<label>" }, ... ],   // competitor columns, left→right
  laTier: "<LA's tier label>",
  cats: [ { id, label, rows: [
    { n: "<product name>", note?: "<override sublabel>", v: [
      { sz: "<size>", la: "$X", ppm: "$Y", <vendorKey>: "$Z", ... },   // one object per size variant
    ]}
  ]}],
  coverage: { "<catId>": "<prose note under the table>" },
  highlights: [ { v, u, l, d }, ... ],   // the value-summary metric cards
  sources: [ ["<vendor name>", "<verification detail>"], ... ],
}
```

Rules that keep the model consistent:
- **Every price cell string** is either a real price (`"$59.99"`), an estimate (`"~$65.00"`,
  leading `~`), or not-carried (`"—"`, an em dash — never empty string, never `null`, never `"N/A"`).
- **Every object in a row's `v` array must carry a key for `la`, `ppm`, and every vendor key in
  that market's `cols`.** A missing key renders blank instead of a dash and breaks the badge math.
- **`ppm` is LA's price ÷ total mg in the vial, rounded to 2 decimals** (`$69.99 / 10mg = $7.00`).
  For blends, use total peptide mg (`10mg (5+5)` → divide by 10). For non-mg units (capsules `60ct`,
  `cream`, `spray`), `ppm` is `"—"`.
- **`cats` are keyed by id and rendered in `CAT_ORDER`** (`inj-blends`, `inj-singles`, `inj-glp`,
  `bioregs`, `caps`, `sprays`, `topicals`). Both markets share these seven ids.
- **`EXCL`** lists products that show an "LA exclusive" badge — but only when no competitor in the
  *active* market carries the SKU (the code checks `others.every(x => !x || x === "—")`).
- The **`vs Market` badge** is computed, not stored: `↓ N%` if LA is >6% below the average of
  real (non-`~`, non-`—`) competitor prices, `↑ N%` if >6% above, `≈ par` otherwise.

## Design system — hard constraints

Use the CSS custom properties. **Never hardcode a raw hex that duplicates a token**; if you need a
color, it almost certainly already exists in `:root`. The palette is derived verbatim from
lapeptides.net — see `DESIGN.md` for the full table. Load-bearing tokens:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#EEF3F4` | app background |
| `--surface` | `#FFFFFF` | table, cards |
| `--ink` | `#0B1A20` | primary text/data |
| `--muted` | `#5E7178` | notes, captions (≥4.5:1 on white) |
| `--brand` | `#12A5BC` | accent, active state |
| `--brand-deep` | `#09525E` | LA price, $/mg, headers |
| `--brand-tint` | `rgba(18,165,188,.07)` | LA column wash |
| `--pos` | `#0E7C6B` | cheaper-than-market badge |
| `--neg` | `#C0202B` | pricier-than-market / warning |

- **Typography:** Bebas Neue (display — wordmark, big metric numbers, `.sum-head h3`) + Inter
  (body/data, with `font-feature-settings:"tnum" 1` for tabular figures so price columns align).
  Both load from Google Fonts in `index.html`. Don't add font weights that aren't already imported.
- **Accessibility is a floor, not a nice-to-have (WCAG AA):** body/data text ≥4.5:1; the savings
  badge is legible by **shape + text** (`↓`/`↑` glyph + `%`), not color alone; every interactive
  element keeps its `:focus-visible` outline; the full `@media(prefers-reduced-motion:reduce)` block
  at the bottom of `CSS` must keep working. Never remove a glyph and leave only color.
- **Motion:** 150–200ms ease-out, tab/hover transitions and the table `rise` keyframe only. No
  page-load choreography, no parallax, no scroll-jacking beyond the existing smooth jump-nav.
- **Anti-references (what this must never drift toward):** generic dark AI-SaaS dashboard,
  supplement/nootropic DTC hype, crypto/fintech terminal. If a change smells like any of these,
  it's wrong. This should read like a lab certificate you'd hand to an attorney.

## Data integrity — the thing that actually matters here

This is a factual document. A wrong price is worse than an ugly one.

- **Never invent or guess a price.** If you don't have a verified figure, use `"—"` (not carried)
  or `"~$X"` (estimated from catalog tier) — and if you use `~`, the value must be defensible from
  an actual source, not fabricated to fill a cell.
- **When you change any LA price, recompute its `ppm`** by hand and update it in the same edit.
  Stale `$/mg` silently lies.
- **Keep `sources` honest.** If you add or change a competitor price, update the matching entry in
  that market's `sources` array with where it came from. The footer says "verified <date>" — if you
  do a real re-verification pass, update that date; if you're just editing structure, leave it.
- **`highlights` must stay true to the table.** Each metric card quotes specific numbers ("LA $89.99
  against BLL $259.97"). If you change the underlying prices, fix the highlight or remove it.

## Dev workflow

```bash
npm install       # once
npm run dev       # Vite dev server, hot reload
npm run build      # production build → dist/  (Vercel deploys this)
npm run preview   # preview the built output
```

There are **no tests, no linter, no typechecker** configured. Verification is manual: run
`npm run dev`, open both market tabs, and eyeball the category you touched. Before calling a
data change done, confirm the numbers render, the badge points the right way, and `$/mg` matches
the price. Deployment is Vercel (`vercel.json`, Vite framework preset, output `dist/`); `preview`
and `main`/default branches deploy independently.

## Do-not list

- **Do not** add dependencies, a CSS framework, TypeScript, or a component library to "clean this up."
  The single-file, zero-runtime-deps approach is deliberate. Propose it first if you truly think it's needed.
- **Do not** put competitor brand color on price text, or otherwise let a competitor column out-shout LA.
- **Do not** hardcode a hex that already exists as a `--token`.
- **Do not** fabricate prices, sources, or dates. Unknown → `"—"` or a defensible `"~"`.
- **Do not** ship a data edit without recomputing the affected `$/mg`.
- **Do not** remove or weaken the `prefers-reduced-motion` block, focus outlines, or the glyph on the badge.
- **Do not** reorder `CAT_ORDER` or rename category ids without checking `coverage`, `EXCL`, and both markets.
- **Do not** commit to `main` or `preview` without explicit instruction — feature work goes on the
  designated branch.
