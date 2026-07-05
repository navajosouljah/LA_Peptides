---
name: add-competitor
description: >
  Add (or remove) an entire competitor vendor column in the LA Peptides market analysis. This is the
  structural change that update-market-data is NOT: it touches the VENDORS registry, a market's cols
  array, and every single row's v objects across all seven categories. Use when the request is "add
  vendor X to the comparison", "put <competitor> in the grey market", "we're dropping <vendor>", or
  "add a new column for <company>". For changing prices in existing columns, use update-market-data.
---

# Add / Remove a Competitor Column

## What this is for

A vendor column isn't one edit — it's a column that cuts through every row in a market. Adding one
means registering the vendor, declaring its column, and giving it a price cell in **every size variant
of every product** in that market (seven categories). Miss one row and that cell renders blank and the
`vs Market` badge math is thrown off. This skill makes that sweep systematic so nothing is skipped.

Read `CLAUDE.md` for the data model before starting. The "LA stays the loudest" rule is the hard
constraint this skill most often threatens — a new competitor must stay a quiet reference point.

## The three places a vendor lives

1. **`VENDORS` registry** (~line 8 of `src/App.jsx`) — the identity: `{ name, short, head, color, warn? }`.
   Keyed by a short lowercase string (`bio`, `swiss`, ...). `color` is used ONLY for the legend dot and the
   2px header underline — never price text. `warn: true` flags a vendor with a risk marker (⚠️).
2. **`MARKETS[id].cols`** — the ordered list of `{ k, tier }` that decides which columns appear, left→right,
   and each column's tier label (`"PREMIUM ▲"`, `"VALUE ▼"`, `"BUDGET ⚠️"`, ...).
3. **Every `v` object in that market's `cats`** — each needs a `<key>: "<price>"` entry, `"—"` where the
   vendor doesn't carry the product.

## Step-by-step process

1. **Pick the vendor key.** Short, lowercase, unique, memorable (`asc`, `swiss`). Confirm it's not already in
   `VENDORS`. Note: a vendor can appear in both markets under the *same or different* keys — Verified Peptides
   is `vp` in `us` and `vpg` in `grey`. Follow that precedent if the vendor spans both.
2. **Register it in `VENDORS`:** `name` (full), `short` (2–4 char tag for the legend), `head` (column header
   label, kept short so the table doesn't wrap), `color` (a distinct hue — pull from the existing palette range,
   muted, never near LA's teal), and `warn: true` only if there's a genuine risk flag.
3. **Add it to the target market's `cols`** in the position the tier implies (premium/value ordering follows the
   existing columns). Give it a `tier` label consistent with the others in that market.
4. **Sweep every category.** Go category by category through `MARKETS[id].cats` and add the new key to **every
   object in every product's `v` array.** Use a real price where you have a verified one, `"~$X"` for a defensible
   estimate, `"—"` everywhere the vendor doesn't carry the SKU. This is the step that gets skipped — do it
   exhaustively. There is no schema enforcement; a missing key fails silently.
5. **Add a `sources` entry** for the vendor: `["<Vendor Name>", "<domain> — <key prices confirmed>"]`.
6. **Update prose if warranted:** the market `intro.text` if it enumerates vendors, and any `coverage` note that
   lists who fields a category.
7. **Verify visually.** `npm run dev` → the market tab. Confirm: the new legend chip appears with its dot and tier;
   the column header shows with its colored underline; the column is populated in every category with no blank
   cells; LA's column is still visually dominant; the `vs Market` badge now includes the new vendor in its average.

To **remove** a vendor, reverse all of the above: delete the `VENDORS` entry, remove it from `cols`, delete its key
from every `v` object, drop its `sources` line, and de-list it from any prose. Leaving a stray key in `v` objects
after removing the column is harmless but messy — clean it.

## Output format

```
### Vendor
- key: <k> · name: <full> · short: <tag> · color: <hex> · warn: <yes/no> · market(s): <us/grey/both>

### Registered in
- VENDORS: <yes>
- cols[<market>]: inserted at position <n> with tier "<tier>"

### Coverage sweep (rows given a cell)
- Injectable Blends: <n> products
- Injectable Singles: <n> products
- GLP / Metabolic: <n> products
- Bioregulators: <n> products
- Capsules: <n> products
- Sprays: <n> products
- Topicals / Creams: <n> products
- Cells with a real price: <n> · estimates (~): <n> · not-carried (—): <n>

### Prose / sources
- sources entry: <added>
- intro / coverage: <edited or "n/a">

### Verify
- <what you confirmed in npm run dev — legend chip, header underline, no blank cells, LA still dominant>
```

## Example of a great result

**Request:** "Add Core Peptides to the US-synthesized market — they carry the recovery blends and singles."

```
### Vendor
- key: core · name: Core Peptides · short: CP · color: #5E8C7A · warn: no · market(s): us

### Registered in
- VENDORS: yes — { name:"Core Peptides", short:"CP", head:"Core", color:"#5E8C7A" }
- cols[us]: inserted after vp with tier "VALUE ▼"

### Coverage sweep (rows given a cell)
- Injectable Blends: 8 products
- Injectable Singles: 24 products
- GLP / Metabolic: 3 products
- Bioregulators: 10 products
- Capsules: 10 products
- Sprays: 11 products
- Topicals / Creams: 7 products
- Cells with a real price: 19 · estimates (~): 6 · not-carried (—): 48

### Prose / sources
- sources entry: added ["Core Peptides", "corepeptides.com — BPC/TB blend $99, singles $55–65 confirmed"]
- intro / coverage: intro left as-is (doesn't enumerate every vendor); no coverage note claimed exclusivity that changed.

### Verify
- npm run dev › US-Synthesized: CP chip shows in legend with sage dot + VALUE tier; "Core" header
  carries its underline; every category has a CP cell (no blanks); LA column still the heaviest, teal-washed,
  loudest on screen. vs-Market badges recomputed to include CP.
```

## Do-not

- **Do not** stop after `cols` and forget the row sweep — an unpopulated column is the failure mode here.
- **Do not** give the new vendor a color near LA's teal (`#12A5BC` / `#09525E`), or ever put its color on price text.
- **Do not** let the new column's type weight or styling rival LA's — it's a reference point, period.
- **Do not** invent prices to fill the column. Verified → `"$X"`, defensible estimate → `"~$X"`, otherwise → `"—"`.
- **Do not** reuse an existing vendor key or collide `short` tags.
- **Do not** add the vendor to `EXCL` logic or highlights unless the change genuinely flips an exclusivity claim.
