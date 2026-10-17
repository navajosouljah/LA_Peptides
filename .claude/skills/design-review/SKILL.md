---
name: design-review
description: >
  Audit a visual or structural change to the LA Peptides market analysis against DESIGN.md, PRODUCT.md,
  and the WCAG AA accessibility floor before it ships. Use after any edit that touches the CSS block,
  layout, color, typography, motion, or component structure in src/App.jsx — or when the request is
  "does this stay on-brand", "check the design", "review this against the brand", "is this accessible".
  This is a quality gate, not a data task; for price/SKU edits use update-market-data.
---

# Design Review

## What this is for

The look of this app is a brand asset, defined precisely in `DESIGN.md` and `PRODUCT.md`. It's easy to
make a change that works but quietly drifts off-brand — a raw hex instead of a token, a competitor color
creeping onto price text, a motion flourish, a contrast dip. This skill is the checklist that catches that
drift before it ships. Run it against the diff, not from memory.

## Inputs

- The change you're reviewing (working diff, or a described edit).
- `DESIGN.md` — the color table, typography, component specs, motion rules.
- `PRODUCT.md` — brand personality, design principles, anti-references, the accessibility section.
- The `CSS` block and JSX in `src/App.jsx` for how it's actually implemented.

## The checklist (run every item, in order)

**1. The loudest-thing rule.** LA's price and `$/mg` columns must remain the visual center of gravity —
teal wash (`--brand-tint`), heaviest weight (`.price-la`, 800). Did anything give a competitor column
more visual weight, put a competitor's brand color on its price text, or dim LA's? Competitor color is
allowed ONLY on legend dots and the 2px header underline (`.th-u::after`).

**2. Color tokens.** Every color must come from a `:root` custom property. Scan for raw hex/rgb literals
introduced in the change. Flag any that duplicate an existing token (e.g. a literal `#12A5BC` instead of
`var(--brand)`). New semantic color is allowed only if it's a genuinely new role and gets a named token.

**3. Contrast (WCAG AA).** Body and data text ≥4.5:1 against its background; large display text ≥3:1.
`--muted` (`#5E7178`) is the lightest text permitted on white/`--surface`. Flag any text lighter than that
on a light surface. The `--brand-tint` wash under LA columns must not drop the text below 4.5:1.

**4. Badge legibility by shape + text, not color alone.** The `vs Market` badge and any status marker must
carry a glyph and/or text (`↓ 12%`, `↑ 8%`, `≈ par`, `⚠️`), not rely on red/green to convey meaning. Flag
any change that strips the glyph or the `%`.

**5. Typography.** Display type is Bebas Neue (wordmark, big metric numbers, `.sum-head h3`); body/data is
Inter with tabular figures (`font-feature-settings:"tnum" 1`) so price columns align. Flag: a new font,
a weight not imported in `index.html` (Inter 400/500/600/700/800 + Bebas 400), or price/number text that
lost its tabular alignment.

**6. Motion.** 150–200ms ease-out; only tab/hover transitions and the table `rise` keyframe. Flag: new
animation on load, durations outside the range, transform-heavy effects, scroll-jacking. Confirm the
`@media(prefers-reduced-motion:reduce)` block still neutralizes anything you added.

**7. Focus & keyboard.** Every interactive element keeps a visible `:focus-visible` outline
(`2px solid var(--brand)`). Flag any control that lost it.

**8. Responsive.** The table scrolls horizontally on narrow screens (`.scroll{overflow-x:auto}`, `min-width`
on `.grid`) rather than reflowing/wrapping data. Flag any change that makes data reflow or the body scroll
horizontally on mobile. Check the `max-width:760px` and `1100px` breakpoints still hold.

**9. Anti-references.** Step back: does the result drift toward any of PRODUCT.md's explicit anti-references —
dark AI-SaaS dashboard, supplement/nootropic DTC hype, crypto/fintech terminal? It should read like a lab
certificate. Flag a vibe shift even if every individual rule passes.

## Output format

Report as a pass/flag checklist — every item gets a verdict, never silent:

```
### Design review — <one-line description of the change>

| # | Check | Verdict | Note |
|---|-------|---------|------|
| 1 | Loudest-thing (LA dominant) | ✅ / ⚠️ / ❌ | <only if not ✅> |
| 2 | Color tokens (no raw hex) | ... | ... |
| 3 | Contrast (AA ≥4.5:1) | ... | ... |
| 4 | Badge shape+text | ... | ... |
| 5 | Typography | ... | ... |
| 6 | Motion + reduced-motion | ... | ... |
| 7 | Focus / keyboard | ... | ... |
| 8 | Responsive (table scroll) | ... | ... |
| 9 | Anti-references / vibe | ... | ... |

### Must-fix
- <each ❌, with the file:line and the exact fix — or "none">

### Consider
- <each ⚠️, optional improvement — or "none">

### Verdict: SHIP / FIX FIRST
```

## Example of a great result

**Request:** "Review this change — I made the competitor 'not carried' dashes darker and added a subtle
lift animation to the price cells on hover."

```
### Design review — darker dashes + price-cell hover lift

| # | Check | Verdict | Note |
|---|-------|---------|------|
| 1 | Loudest-thing (LA dominant) | ⚠️ | Hover-lift on ALL price cells gives competitor cells motion parity with LA |
| 2 | Color tokens (no raw hex) | ❌ | Dash restyled to literal #7A8A8E instead of a token |
| 3 | Contrast (AA ≥4.5:1) | ✅ | #7A8A8E on white = 4.6:1, passes — but see #2 |
| 4 | Badge shape+text | ✅ | Untouched |
| 5 | Typography | ✅ | Untouched |
| 6 | Motion + reduced-motion | ❌ | New transform:translateY hover not covered; reduced-motion block doesn't neutralize it |
| 7 | Focus / keyboard | ✅ | Untouched |
| 8 | Responsive (table scroll) | ✅ | Untouched |
| 9 | Anti-references / vibe | ⚠️ | Cell-lift reads faintly "SaaS dashboard"; the table should feel like a static lab report |

### Must-fix
- src/App.jsx CSS `.dash`: replace #7A8A8E with a token — add `--dash:#7A8A8E` to :root (the existing
  dash color is #B6C6CA; if you want it darker, name it) and use var(--dash).
- src/App.jsx CSS: the hover-lift adds motion the reduced-motion block misses. Either drop it, or add
  the selector to `@media(prefers-reduced-motion:reduce){ ... transform:none }`.

### Consider
- Scope any hover emphasis to LA's cells only, so competitors don't gain motion parity (check #1/#9).

### Verdict: FIX FIRST
```

## Do-not

- **Do not** pass an item silently — every one of the nine gets an explicit verdict.
- **Do not** approve a change that puts competitor color on price text or lets a competitor column rival LA.
- **Do not** wave through a raw hex that duplicates an existing token.
- **Do not** approve new motion without confirming the reduced-motion block neutralizes it.
- **Do not** rewrite the code yourself here — this skill reviews and prescribes fixes; apply them separately
  (or hand back to the requester) so the review stays an independent gate.
- **Do not** treat "it looks fine" as a pass on contrast or reduced-motion — those are measured, not eyeballed.
