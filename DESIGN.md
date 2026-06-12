# Design

## Theme

Light, clinical, pharmaceutical. White and pale cool-teal surfaces, near-black ink,
one brand teal carrying accent duty. Derived directly from lapeptides.net's live
palette and Typekit fonts. Color strategy: **Restrained** (tinted neutrals + one
accent), with the LA Peptides columns getting a faint teal wash to anchor the eye.

## Color

Sourced from lapeptides.net inline styles (verbatim hex):

| Token            | Value     | Use                                            |
|------------------|-----------|------------------------------------------------|
| `--bg`           | `#EEF3F4` | App background (pale, derived from `#e1ecee`)  |
| `--surface`      | `#FFFFFF` | Table, cards                                   |
| `--surface-2`    | `#F6FAFB` | Zebra rows, panels                             |
| `--ink`          | `#0B1A20` | Primary text / data (brand `#020202` softened) |
| `--ink-2`        | `#42555D` | Product names, secondary                       |
| `--muted`        | `#5E7178` | Notes, captions (≥4.5:1 on white)              |
| `--line`         | `#DCE6E8` | Borders                                        |
| `--line-2`       | `#EBF1F2` | Inner dividers                                 |
| `--brand`        | `#12A5BC` | Primary brand teal (accent, active state)      |
| `--brand-deep`   | `#09525E` | Petrol teal: LA price, $/mg, headers           |
| `--navy`         | `#0D2739` | Deep brand navy                                |
| `--brand-tint`   | `rgba(18,165,188,.07)` | LA column wash                    |
| `--pos`          | `#0E7C6B` | Cheaper-than-market badge                       |
| `--neg`          | `#C0202B` | Pricier-than-market badge (brand red `#d51c29`)|

Competitor vendor hues are used only as legend dots and 2px header underlines, never
on the price text, so LA stays the loudest thing on screen.

## Typography

Brand uses `bebas-neue-pro-expanded` (display) + `indivisible` (body) via Typekit.
Free substitutes loaded from Google Fonts:

- **Display:** Bebas Neue — wordmark, big metric numbers, section label. Set with
  positive tracking to echo the "expanded" cut.
- **Body / data:** Inter, `font-feature-settings: "tnum" 1, "cv05" 1` for tabular,
  aligned figures in the price columns.

Fixed rem-ish px scale (product register, not fluid). Tight ratio.

## Components

- **Header bar:** white, bottom border. LA wordmark lockup (teal mark + Bebas
  wordmark) left; vendor legend chips right.
- **Category tabs:** pill row. Active = brand teal fill, white text. Inactive =
  white, bordered, ink-2.
- **Table:** sticky header, very subtle zebra, full-width borders only (no
  side-stripes). LA price + $/mg columns share a faint teal wash. Row hover lifts to
  surface-2. Size shown as a bordered chip. Savings shown as a colored pill with
  ↓/↑ glyph + %.
- **Value summary:** white reference chips, Bebas metric number in petrol teal,
  label + one-line context. Genuinely distinct metrics, not a filler grid.
- **Footnotes:** fine print, muted but ≥4.5:1.

## Motion

150–200ms, ease-out. Tab switch crossfades + small rise on the table body. Tab
active-state and row hover transitions only. Full `prefers-reduced-motion: reduce`
fallback (instant, no transform). No page-load choreography.
