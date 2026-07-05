---
name: update-market-data
description: >
  Add, edit, or remove pricing in the LA Peptides market analysis — an LA SKU, a new mg-size
  variant, a competitor price, a source, a highlight, or a coverage note. Use whenever the request
  changes a number, a product, or a size in src/App.jsx's MARKETS object. Keeps the data model
  consistent: recomputes $/mg, verifies every row carries every vendor key, and updates sources.
  Triggers on "update the price", "add SKU / size / variant", "the price for X changed", "add a
  product", "fix the $/mg", "refresh sources".
---

# Update Market Data

## What this is for

Every price, product, and size in this app is hand-maintained inside the `MARKETS` object in
`src/App.jsx`. This skill is the disciplined procedure for changing that data without breaking the
model, the math, or the factual integrity of the document. It is the single most common task in this
repo.

Read `CLAUDE.md` first if you haven't this session — the data-model rules and integrity rules there
are binding. This skill assumes them.

## Before you touch anything

1. **Know which market(s) are affected.** `us` (US-Synthesized) and `grey` (Grey-Market) are separate
   objects with different `cols`. A product often exists in both — changing "the BPC-157 price" usually
   means editing both markets unless told otherwise. State which you're editing.
2. **Have a source.** This is a factual document. A verified figure comes from a vendor's live page.
   If you don't have one, the value is `"—"` (not carried) or `"~$X"` (defensible estimate) — never a guess.
3. **Locate the exact row.** Find it by product name `n` inside the right `cat`. Products are grouped by
   category id; both markets use the same seven category ids in `CAT_ORDER`.

## Step-by-step process

1. **Read the target `cat` block** in the market you're editing so you see the surrounding rows and match
   their formatting exactly (alignment, spacing, key order).
2. **Make the edit** following the shape rules:
   - A price cell is `"$59.99"` (verified), `"~$65.00"` (estimate, leading `~`), or `"—"` (em dash, not carried).
     Never `""`, `null`, `"N/A"`, or `"$0"`.
   - **Every object in the `v` array must have a key for `la`, `ppm`, and every vendor key in that market's
     `cols`.** For `us`: `la, ppm, bio, lim, bp, vp`. For `grey`: `la, ppm, asc, swiss, pure, prime, amino, vpg`.
     A missing key renders blank and breaks the badge — add `"—"` for vendors that don't carry it.
   - Adding a **new size variant** = a new object appended to that product's `v` array. Only the *first*
     variant (`vi === 0`) renders the product name, note, and exclusive badge; later variants show only the
     size row, so keep the fullest data on the first object.
3. **Recompute `ppm` for any changed LA price.** `ppm` = LA price ÷ total mg in the vial, rounded to 2 decimals.
   - `$69.99` at `10mg` → `$7.00`. Blends divide by total peptide mg: `10mg (5+5)` → `/10`.
   - Non-mg units (`60ct`, `cream`, `spray`, `blend`) → `ppm: "—"`.
   - Show your arithmetic in your reply so it's checkable.
4. **Update the matching `sources` entry** for the market if you added/changed a competitor price — say where
   the number came from. If you did a genuine re-verification pass across the market, update the footer date
   (`Sources · verified <date>` lives in `src/App.jsx`, and `index.html`'s meta description if the scope shifted).
5. **Check the ripple:**
   - Did this make a product LA-exclusive or un-exclusive in a market? Update the `EXCL` set if the *product*
     is newly exclusive everywhere; the badge itself auto-hides per-market when a competitor carries it.
   - Does a `highlights` card quote a number you just changed? Fix or remove it — highlights must stay true.
   - New product with no sublabel? Add one to `NOTES` (keyed by the exact product name) or set `note` on the row.
6. **Verify visually.** Run `npm run dev`, open the affected market tab, scroll to the category, and confirm:
   the value renders, `$/mg` matches the price, and the `vs Market` badge points the sane direction
   (LA cheaper → green `↓`). There are no tests — this eyeball pass *is* the verification.

## Output format (what you report back)

Reply with exactly these sections:

```
### Changed
- <market> › <category> › <product> · <size>: <field> <old> → <new>
  (one bullet per cell changed)

### $/mg recomputed
- <product> <size>: $<price> ÷ <mg>mg = $<ppm>   (or "n/a — non-mg unit")

### Ripple
- Sources: <updated entry, or "no competitor prices changed">
- Highlights: <fixed card / removed / "none affected">
- EXCL / NOTES: <what changed, or "none">

### Verify
- <what you confirmed in npm run dev, e.g. "us › Injectable Singles: BPC-157 10mg renders $54.99, $/mg $5.40, badge ↓ 12%">
```

## Example of a great result

**Request:** "LA dropped BPC-157 10mg single to $54.99 in the US market."

```
### Changed
- us › Injectable Singles › BPC-157 Single · 10mg: la $59.99 → $54.99

### $/mg recomputed
- BPC-157 Single 10mg: $54.99 ÷ 10mg = $5.50  (was $6.00)

### Ripple
- Sources: LA Peptides entry unchanged (still lapeptides.net); no competitor prices touched.
- Highlights: "$6.00 /mg · BPC-157 · 10mg" card quoted the old floor — updated value to $5.50
  and the copy to "LA's value floor on the #1 single; BLL/LIM both $9.99/mg."
- EXCL / NOTES: none — competitors still carry it, no exclusivity change.

### Verify
- npm run dev › US-Synthesized › Injectable Singles: BPC-157 Single 10mg now renders $54.99,
  $/mg $5.50, vs-Market badge ↓ 32% (green). Grey market left untouched per request.
```

## Do-not

- **Do not** invent a price to fill a cell. Unknown → `"—"` or a defensible `"~$X"`.
- **Do not** change an LA price and leave the old `$/mg` — that silently lies to the reader.
- **Do not** add a size variant with only `la`/`ppm` and skip the vendor keys — every object needs the full set.
- **Do not** edit only one market when the change applies to both, unless the request scopes it to one.
- **Do not** touch the CSS, the `badge()` logic, or the scroll-spy while doing a data edit — that's out of scope.
- **Do not** leave a `highlights` card or `sources` entry contradicting the numbers you just changed.
- **Do not** claim "verified" a date you didn't actually re-check against live vendor pages.
