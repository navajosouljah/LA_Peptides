import { useState } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// VENDOR PROFILES — All 4 confirmed US-synthesized (SPPS domestic)
// Colors are used only for legend dots + header underlines, never on price text,
// so LA Peptides stays the loudest thing on screen.
// ══════════════════════════════════════════════════════════════════════════════
const V = {
  la:  { name: "LA Peptides",        short: "LA",  color: "#12A5BC", tier: "MID-MARKET" },
  bio: { name: "BioLongevity Labs",  short: "BLL", color: "#7C6BC4", tier: "PREMIUM" },
  lim: { name: "Limitless Biotech",  short: "LIM", color: "#B0529E", tier: "PREMIUM" },
  bp:  { name: "Biotech Peptides",   short: "BP",  color: "#3E73B8", tier: "VALUE" },
};

// ══════════════════════════════════════════════════════════════════════════════
// PRICE DATA — Sources (all June 12 2026)
//   LA  : lapeptides.net live category pages + individual product pages
//   BLL : biolongevitylabs.com product-page meta-prices
//   LIM : limitlesslifenootropics.com product-page meta-prices
//   BP  : biotechpeptides.com product listings
//   "—" : vendor does not carry that SKU/size   "~" : estimated from catalog tier
// ══════════════════════════════════════════════════════════════════════════════
const CATS = [
  // ── 1. INJECTABLE BLENDS ────────────────────────────────────────────────────
  { id: "inj-blends", label: "Injectable Blends", rows: [
    { name: "BPC-157 / TB-500 Blend", note: "#1 recovery stack", v: [
      { sz: "10mg (5+5)",  la: "$69.99",  ppm: "$7.00", bio: "$119.97", lim: "$119.99", bp: "$115.00" },
      { sz: "20mg (10+10)", la: "$129.99", ppm: "$6.50", bio: "—",       lim: "—",       bp: "—" },
    ]},
    { name: "GLOW Blend (BPC+TB+GHK-Cu)", note: "70mg healing triple blend", v: [
      { sz: "70mg", la: "$89.99", ppm: "$1.29", bio: "$259.97", lim: "—", bp: "$305.00" },
    ]},
    { name: "KLOW Blend (BPC+TB+GHK-Cu+KPV)", note: "80mg quad healing blend", v: [
      { sz: "80mg", la: "$129.99", ppm: "$1.62", bio: "~$289.97", lim: "—", bp: "—" },
    ]},
    { name: "CJC No DAC / Ipamorelin", note: "GH secretagogue blend", v: [
      { sz: "10mg (5+5)", la: "$74.99", ppm: "$7.50", bio: "—", lim: "$109.99", bp: "$81.00" },
    ]},
    { name: "Sermorelin / Ipamorelin", note: "Alt GH secretagogue blend", v: [
      { sz: "10mg (5+5)", la: "—", ppm: "—", bio: "—", lim: "$99.99", bp: "—" },
    ]},
    { name: "CJC / Ipamorelin / GHRP-2 Triple", note: "Triple GH stack", v: [
      { sz: "9mg (3+3+3)", la: "—", ppm: "—", bio: "—", lim: "$119.99", bp: "$80.00" },
    ]},
  ]},

  // ── 2. INJECTABLE SINGLES ───────────────────────────────────────────────────
  { id: "inj-singles", label: "Injectable Singles", rows: [
    { name: "BPC-157", note: "Body protection compound", v: [
      { sz: "10mg", la: "$59.99", ppm: "$6.00", bio: "$99.97", lim: "$99.99",  bp: "$92.00" },
      { sz: "20mg", la: "—",      ppm: "—",     bio: "—",      lim: "$180.99", bp: "—" },
    ]},
    { name: "TB-500 (Thymosin Beta-4)", note: "Tissue regeneration", v: [
      { sz: "10mg", la: "$79.99", ppm: "$8.00", bio: "—", lim: "—", bp: "$124.00" },
    ]},
    { name: "GHK-Cu (Copper Tripeptide)", note: "Repair, collagen, anti-aging", v: [
      { sz: "50mg", la: "$39.99", ppm: "$0.80", bio: "$69.97", lim: "$69.99", bp: "$51.00" },
    ]},
    { name: "Epithalon / Epitalon", note: "Telomere longevity peptide", v: [
      { sz: "10mg", la: "$79.99", ppm: "$8.00", bio: "$69.97", lim: "$99.99", bp: "—" },
    ]},
    { name: "MOTS-C", note: "Mitochondrial metabolic", v: [
      { sz: "5mg", la: "$69.99", ppm: "$14.00", bio: "—", lim: "$89.99", bp: "—" },
    ]},
    { name: "Ipamorelin", note: "GH secretagogue", v: [
      { sz: "5mg", la: "$49.99", ppm: "$10.00", bio: "—", lim: "—", bp: "$46.00" },
    ]},
    { name: "Semax (injectable)", note: "Cognitive neuropeptide vial", v: [
      { sz: "10mg", la: "$39.99", ppm: "$4.00", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "Selank (injectable)", note: "Anxiolytic / cognitive vial", v: [
      { sz: "10mg", la: "$39.99", ppm: "$4.00", bio: "—", lim: "—", bp: "$46.00" },
    ]},
    { name: "KPV", note: "Anti-inflammatory tripeptide", v: [
      { sz: "10mg", la: "$59.99", ppm: "$6.00", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "Sermorelin", note: "GH-releasing factor", v: [
      { sz: "10mg", la: "$69.99", ppm: "$7.00", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "Thymosin Alpha-1", note: "Immune modulation", v: [
      { sz: "10mg", la: "$59.99", ppm: "$6.00", bio: "—", lim: "—", bp: "$130.00" },
    ]},
    { name: "PT-141 (Bremelanotide)", note: "Sexual health", v: [
      { sz: "10mg", la: "$69.99", ppm: "$7.00", bio: "—", lim: "—", bp: "$45.00" },
    ]},
    { name: "AOD-9604", note: "Fat loss fragment", v: [
      { sz: "5mg", la: "$49.99", ppm: "$10.00", bio: "—", lim: "—", bp: "$44.00" },
    ]},
    { name: "Tesamorelin", note: "GHRH analog / visceral fat", v: [
      { sz: "10mg", la: "$74.99", ppm: "$7.50", bio: "—", lim: "$99.99", bp: "$73.00" },
    ]},
    { name: "VIP (Vasoactive Intestinal Peptide)", note: "Immune / GI / neuro", v: [
      { sz: "5mg", la: "$59.99", ppm: "$12.00", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "IGF-1 LR3", note: "Insulin-like growth factor", v: [
      { sz: "1mg", la: "$59.99", ppm: "$60.00", bio: "—", lim: "~$109.99", bp: "$145.00" },
    ]},
    { name: "DSIP (Delta Sleep-Inducing Peptide)", note: "Sleep / circadian", v: [
      { sz: "5mg", la: "$29.99", ppm: "$6.00", bio: "—", lim: "—", bp: "$44.00" },
    ]},
    { name: "SLU-PP-332", note: "Exercise mimetic / AMPK", v: [
      { sz: "10mg", la: "$74.99", ppm: "$7.50", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "SNAP-8", note: "Anti-wrinkle / acetyl octapeptide", v: [
      { sz: "10mg", la: "$34.99", ppm: "$3.50", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "ARA-290", note: "Erythropoietin-derived neuroprotective", v: [
      { sz: "10mg", la: "$69.99", ppm: "$7.00", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "Cagrilintide", note: "GLP-1/amylin dual analog", v: [
      { sz: "10mg", la: "$99.99", ppm: "$10.00", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "Glutathione", note: "Master antioxidant", v: [
      { sz: "500mg", la: "$59.99", ppm: "$0.12", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "NAD+", note: "Cellular energy / DNA repair", v: [
      { sz: "500mg", la: "$74.99", ppm: "$0.15", bio: "—", lim: "—", bp: "$179.00" },
    ]},
    { name: "Melanotan 2 (MT-2)", note: "Tanning / libido", v: [
      { sz: "10mg", la: "$44.99", ppm: "$4.50", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "5-Amino 1MQ", note: "NAD+ metabolic booster", v: [
      { sz: "10mg", la: "$55.99", ppm: "$5.60", bio: "—", lim: "—", bp: "—" },
    ]},
    { name: "LA-31 (SS-31 / Elamipretide)", note: "Mitochondrial cardiolipin", v: [
      { sz: "10mg", la: "$49.99", ppm: "$5.00", bio: "—", lim: "—", bp: "—" },
    ]},
  ]},

  // ── 3. GLP / METABOLIC INJECTABLES ──────────────────────────────────────────
  { id: "inj-glp", label: "GLP / Metabolic Injectables", rows: [
    { name: "GLP-1 (S) — Semaglutide", note: "Single GLP-1 agonist • LA labels GLP-1(S)", exc: true, v: [
      { sz: "5mg",  la: "—",      ppm: "—",     bio: "—",        lim: "—",       bp: "—" },
      { sz: "10mg", la: "$64.99", ppm: "$6.50", bio: "~$99.97",  lim: "$129.99", bp: "—" },
    ]},
    { name: "GLP-2 (T) — Tirzepatide", note: "Dual GLP-1/GIP agonist • LA labels GLP-2(T)", exc: true, v: [
      { sz: "10mg", la: "$99.99",  ppm: "$10.00", bio: "~$119.97", lim: "$149.99", bp: "—" },
      { sz: "15mg", la: "$169.99", ppm: "$11.33", bio: "—",        lim: "—",       bp: "—" },
    ]},
    { name: "GLP-3 (R) — Retatrutide", note: "Triple GLP-1/GIP/glucagon agonist • LA labels GLP-3(R)", exc: true, v: [
      { sz: "10mg", la: "$94.99",  ppm: "$9.50", bio: "~$139.97", lim: "$169.99", bp: "—" },
      { sz: "20mg", la: "$169.99", ppm: "$8.50", bio: "—",        lim: "—",       bp: "—" },
      { sz: "30mg", la: "$229.99", ppm: "$7.67", bio: "—",        lim: "—",       bp: "—" },
    ]},
  ]},

  // ── 4. BIOREGULATORS (LA + LIM only) ────────────────────────────────────────
  { id: "bioregs", label: "Bioregulators", rows: [
    { name: "Cardiogen",  note: "Cardiac tissue",          v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$62.00" }] },
    { name: "Cartalax",   note: "Joint / cartilage",       v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "—" }] },
    { name: "Crystagen",  note: "Eye / vision",            v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "—" }] },
    { name: "Ovagen",     note: "Liver & ovarian",         v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "—" }] },
    { name: "Pancragen",  note: "Pancreatic",              v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "—" }] },
    { name: "Pinealon",   note: "Brain / neuro",           v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$68.00" }] },
    { name: "Testagen",   note: "Testosterone / gonadal",  v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "—" }] },
    { name: "Thymalin",   note: "Thymus / immune",         v: [{ sz: "20mg", la: "$69.99", ppm: "$3.50", bio: "—", lim: "—", bp: "—" }] },
    { name: "Vesugen",    note: "Vascular endothelial",    v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "—" }] },
    { name: "Vilon",      note: "Immune / longevity",      v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$61.00" }] },
  ]},

  // ── 5. CAPSULES ─────────────────────────────────────────────────────────────
  { id: "caps", label: "Capsules", rows: [
    { name: "BPC-157 Capsules",          note: "250mcg/cap",         v: [{ sz: "60ct", la: "$89.99",  ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "TB-500 Capsules",           note: "Oral TB-500",        v: [{ sz: "60ct", la: "$89.99",  ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "GHK-Cu Capsules",           note: "Oral copper",        v: [{ sz: "60ct", la: "$79.99",  ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "Repair & Fix (BPC+TB+GHK)", note: "Triple blend",       v: [{ sz: "60ct", la: "$149.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "5-Amino 1MQ Capsules",      note: "NAD+ metabolic",     v: [{ sz: "60ct", la: "$124.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "Dihexa Capsules",           note: "Cognitive",          v: [{ sz: "30ct", la: "$79.99",  ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "SLU-PP-332 Capsules",       note: "Exercise mimetic",   v: [{ sz: "60ct", la: "$79.99",  ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "GLP-1 Capsule (Orforglipron)", note: "Oral GLP-1 agonist", exc: true, v: [{ sz: "30ct", la: "$149.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "GLP-2 (T) Capsules",        note: "Oral tirzepatide",   exc: true, v: [{ sz: "30ct", la: "$159.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "Gut Restore (BPC+KPV+L-Gln)", note: "Gut healing blend", exc: true, v: [{ sz: "60ct", la: "$129.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
  ]},

  // ── 6. SPRAYS ───────────────────────────────────────────────────────────────
  { id: "sprays", label: "Sprays", rows: [
    { name: "BPC-157 Spray",            note: "100mcg/spray",      v: [{ sz: "6mg",       la: "$44.99", ppm: "$7.50", bio: "—", lim: "—", bp: "—" }] },
    { name: "TB-500 Spray",             note: "Thymosin beta-4",   v: [{ sz: "6mg",       la: "$44.99", ppm: "$7.50", bio: "—", lim: "—", bp: "—" }] },
    { name: "BPC/TB-500 Blend Spray",   note: "Recovery blend",    v: [{ sz: "10mg",      la: "—",      ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
    { name: "BPC-157 Acetate Spray",    note: "Acetate salt format", v: [{ sz: "6mg",     la: "—",      ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
    { name: "Semax Spray",              note: "Cognitive nasal",   v: [{ sz: "30mg/10ml", la: "$49.99", ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
    { name: "Selank Spray",             note: "Anti-anxiety",      v: [{ sz: "10mg",      la: "$49.99", ppm: "$5.00", bio: "—", lim: "—", bp: "—" }] },
    { name: "PT-141 Spray",             note: "Sexual health",     v: [{ sz: "spray",     la: "$49.99", ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
    { name: "Dihexa Spray",             note: "Nootropic nasal",   v: [{ sz: "5mg",       la: "$54.99", ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
    { name: "NAD+ Spray",               note: "Sublingual NAD+",   v: [{ sz: "spray",     la: "$54.99", ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
    { name: "PT-141 / Oxytocin Blend",  note: "Intimacy blend",    v: [{ sz: "blend",     la: "$59.99", ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
    { name: "Semax/Selank/Dihexa Blend", note: "Cognitive triple", v: [{ sz: "blend",     la: "$59.99", ppm: "—",     bio: "—", lim: "—", bp: "—" }] },
  ]},

  // ── 7. TOPICALS / CREAMS ────────────────────────────────────────────────────
  { id: "topicals", label: "Topicals / Creams", rows: [
    { name: "Repair (GHK-Cu cream)",          note: "Skin repair / anti-aging", exc: true, v: [{ sz: "cream",  la: "$59.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "Smooth (anti-aging cream)",      note: "Fine line formula",        exc: true, v: [{ sz: "cream",  la: "$59.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "Tan (MT-2 topical)",             note: "Melanotan-2 tanning",      exc: true, v: [{ sz: "cream",  la: "$59.99", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "GLOW Topical (BPC/TB/GHK)",      note: "BLL healing topical",      v: [{ sz: "70mg",  la: "—", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "KLOW Topical (BPC/TB/GHK/KPV)",  note: "BLL advanced topical",     v: [{ sz: "80mg",  la: "—", ppm: "—", bio: "—", lim: "—", bp: "—" }] },
    { name: "Argireline (Acetyl Hex-3)",      note: "Botox-like topical",       v: [{ sz: "200mg", la: "—", ppm: "—", bio: "—", lim: "—", bp: "$210.00" }] },
    { name: "AHK-Cu Topical",                 note: "Hair & skin copper",       v: [{ sz: "200mg", la: "—", ppm: "—", bio: "—", lim: "—", bp: "$192.00" }] },
  ]},
];

// Per-category coverage note for the empty competitor columns.
const COVERAGE = {
  bioregs:  "Bioregulators: LA carries all 10 SKUs; BP carries Cardiogen, Pinealon and Vilon; BLL and LIM do not field this class.",
  caps:     "Capsules: a largely LA-exclusive format among US-synthesized vendors.",
  sprays:   "Sprays: a largely LA-exclusive format among US-synthesized vendors.",
  topicals: "Topicals: LA creams are exclusive; BP carries Argireline and AHK-Cu; BLL fields GLOW/KLOW topicals only.",
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const numVal = (p) =>
  p && p !== "—" && !p.startsWith("~") ? parseFloat(p.replace(/[^0-9.]/g, "")) : null;

function badge(la, others) {
  const lv = numVal(la);
  const vs = others.map(numVal).filter(Boolean);
  if (!lv || vs.length === 0) return null;
  const avg = vs.reduce((a, b) => a + b, 0) / vs.length;
  const pct = Math.round(((avg - lv) / avg) * 100);
  if (pct > 6)  return { t: `↓ ${pct}%`,           cls: "bdg-pos" };
  if (pct < -6) return { t: `↑ ${Math.abs(pct)}%`, cls: "bdg-neg" };
  return { t: "≈ par", cls: "bdg-eq" };
}

// ══════════════════════════════════════════════════════════════════════════════
// CELLS
// ══════════════════════════════════════════════════════════════════════════════
function PCell({ val, la }) {
  const cls = "cell" + (la ? " la-col" : "");
  if (!val || val === "—")
    return <td className={cls}><span className="dash">—</span></td>;
  const approx = val.startsWith("~");
  return (
    <td className={cls}>
      <span className={la ? "price-la" : approx ? "price approx" : "price"}>{val}</span>
    </td>
  );
}

function PpmCell({ val }) {
  if (!val || val === "—")
    return <td className="cell la-col"><span className="dash">—</span></td>;
  return (
    <td className="cell la-col">
      <span className="ppm">{val}</span>
    </td>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VALUE SUMMARY DATA
// ══════════════════════════════════════════════════════════════════════════════
const HIGHLIGHTS = [
  { v: "$0.80", u: "/mg", l: "GHK-Cu · 50mg",        d: "Lowest $/mg in the catalog. BLL lists the same vial at $69.97." },
  { v: "$1.29", u: "/mg", l: "GLOW Blend · 70mg",    d: "LA $89.99 against BLL $259.97 — roughly 65% less per vial." },
  { v: "$6.00", u: "/mg", l: "BPC-157 · 10mg",       d: "LA's value floor on the #1 single among US-synth vendors." },
  { v: "$7.67", u: "/mg", l: "GLP-3 (R) · 30mg bulk", d: "Best $/mg across every GLP. A 10-week supply at one price." },
  { v: "$8.50", u: "/mg", l: "GLP-3 (R) · 20mg",     d: "11% cheaper per mg than the 10mg. No competitor carries it." },
  { v: "$3.00", u: "/mg", l: "Bioregulators · 20mg", d: "LA exclusive at this depth — 10 SKUs; LIM's shelf is thin." },
];

// ══════════════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [catId, setCatId] = useState("inj-blends");
  const cat = CATS.find((c) => c.id === catId);

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="hdr">
        <div className="hdr-inner">
          <div className="brand">
            <img className="logo" src="/la-peptides-logo.svg" alt="LA Peptides" />
            <div className="brand-txt">
              <div className="kicker">Market Analysis</div>
              <div className="tagline">
                Every SKU · every mg variant · $/mg breakdown · US-synthesized vendors only
              </div>
            </div>
          </div>

          <div className="legend">
            {Object.entries(V).map(([k, v]) => (
              <div className={"chip" + (k === "la" ? " chip-la" : "")} key={k}>
                <span className="dot" style={{ background: v.color }} />
                <span className="chip-name">{v.short}</span>
                <span className="chip-tier">{v.tier}</span>
              </div>
            ))}
          </div>
        </div>

        <nav className="tabs" aria-label="Product categories">
          {CATS.map((c) => (
            <button
              key={c.id}
              className={"tab" + (catId === c.id ? " on" : "")}
              onClick={() => setCatId(c.id)}
              aria-pressed={catId === c.id}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <main className="body">
        <section className="panel">
          <div className="panel-head">
            <h2>{cat.label}</h2>
            <span className="verified">
              <span className="tick" aria-hidden="true">✓</span>
              US SPPS synthesis confirmed · all 4 vendors
            </span>
          </div>

          <div className="scroll" key={catId}>
            <table className="grid">
              <thead>
                <tr>
                  <th className="th-name">Product</th>
                  <th className="th-c">Size</th>
                  <th className="th-c la-col" style={{ "--u": V.la.color }}>LA Peptides</th>
                  <th className="th-c la-col th-u" style={{ "--u": "#0E7C8C" }}>$/mg</th>
                  <th className="th-c th-u" style={{ "--u": V.bio.color }}>BioLongevity</th>
                  <th className="th-c th-u" style={{ "--u": V.lim.color }}>Limitless</th>
                  <th className="th-c th-u" style={{ "--u": V.bp.color }}>Biotech</th>
                  <th className="th-c th-vs">vs Market</th>
                </tr>
              </thead>
              <tbody>
                {cat.rows.map((row, ri) =>
                  row.v.map((vr, vi) => {
                    const b = badge(vr.la, [vr.bio, vr.lim, vr.bp]);
                    return (
                      <tr key={`${ri}-${vi}`} className={vi === 0 ? "row-lead" : ""}>
                        <td className="td-name">
                          {vi === 0 && (
                            <>
                              <span className="pname">
                                {row.name}
                                {row.exc && <span className="excl">LA exclusive</span>}
                              </span>
                              <span className="pnote">{row.note}</span>
                            </>
                          )}
                        </td>
                        <td className="cell"><span className="sz">{vr.sz}</span></td>
                        <PCell val={vr.la} la />
                        <PpmCell val={vr.ppm} />
                        <PCell val={vr.bio} />
                        <PCell val={vr.lim} />
                        <PCell val={vr.bp} />
                        <td className="cell">
                          {b
                            ? <span className={"bdg " + b.cls}>{b.t}</span>
                            : <span className="dash">—</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {COVERAGE[catId] && (
            <p className="coverage">{COVERAGE[catId]}</p>
          )}
        </section>

        {/* ── VALUE SUMMARY ──────────────────────────────────────────────── */}
        <section className="summary">
          <div className="sum-head">
            <h3>$/mg reference</h3>
            <span>Where LA Peptides sets the value floor</span>
          </div>
          <div className="sum-grid">
            {HIGHLIGHTS.map((h, i) => (
              <article className="metric" key={i}>
                <div className="metric-v">
                  {h.v}<span className="metric-u">{h.u}</span>
                </div>
                <div className="metric-l">{h.l}</div>
                <p className="metric-d">{h.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── FOOTNOTES ──────────────────────────────────────────────────── */}
        <footer className="notes">
          <p>
            <strong>Sources · June 12 2026.</strong>{" "}
            LA Peptides — lapeptides.net live category and product pages.
            BioLongevity Labs — biolongevitylabs.com product-page meta-prices
            (GLOW $259.97, KLOW ~$289.97). Limitless Biotech —
            limitlesslifenootropics.com. Biotech Peptides — biotechpeptides.com
            listings.
          </p>
          <p className="legend-key">
            <span><b className="k-approx">~</b> estimated from catalog tier</span>
            <span><b>—</b> not carried</span>
            <span><b className="k-excl">LA exclusive</b> no US-synthesized competitor</span>
            <span><span className="bdg bdg-pos">↓ %</span> LA cheaper than market avg</span>
            <span className="ruo">All products research use only.</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES — light, clinical, on-brand (lapeptides.net palette + Bebas/Inter)
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  :root{
    --bg:#EEF3F4; --surface:#FFFFFF; --surface-2:#F6FAFB;
    --ink:#0B1A20; --ink-2:#42555D; --muted:#5E7178;
    --line:#DCE6E8; --line-2:#EBF1F2;
    --brand:#12A5BC; --brand-deep:#09525E; --navy:#0D2739;
    --brand-tint:rgba(18,165,188,.07);
    --pos:#0E7C6B; --pos-bg:rgba(14,124,107,.12);
    --neg:#C0202B; --neg-bg:rgba(192,32,43,.10);
    --z-sticky:10;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  .app{
    font-family:'Inter',system-ui,sans-serif;
    background:var(--bg);color:var(--ink);min-height:100vh;
    font-feature-settings:"tnum" 1,"cv05" 1;
    -webkit-font-smoothing:antialiased;
  }

  /* ── HEADER ── */
  .hdr{
    background:var(--surface);border-bottom:1px solid var(--line);
    position:sticky;top:0;z-index:var(--z-sticky);
    box-shadow:0 1px 0 rgba(13,39,57,.02),0 8px 24px -20px rgba(13,39,57,.25);
  }
  .hdr-inner{
    display:flex;align-items:center;justify-content:space-between;gap:20px;
    flex-wrap:wrap;max-width:1640px;margin:0 auto;padding:22px 44px 0;
  }
  .brand{display:flex;align-items:center;gap:20px}
  .logo{height:48px;width:auto;display:block}
  .brand-txt{padding-left:20px;border-left:1px solid var(--line)}
  .kicker{
    font-family:'Bebas Neue',sans-serif;font-size:27px;line-height:1;
    letter-spacing:.05em;color:var(--brand-deep);
  }
  .tagline{font-size:13px;color:var(--muted);margin-top:6px;letter-spacing:.01em}

  .legend{display:flex;gap:8px;flex-wrap:wrap}
  .chip{
    display:flex;align-items:center;gap:8px;background:var(--surface-2);
    border:1px solid var(--line);border-radius:10px;padding:8px 13px;
  }
  .chip-la{
    background:var(--brand-tint);border-color:rgba(18,165,188,.35);
  }
  .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .chip-name{font-size:12.5px;font-weight:700;color:var(--ink)}
  .chip-la .chip-name{color:var(--brand-deep)}
  .chip-tier{font-size:9.5px;font-weight:600;letter-spacing:.07em;color:var(--muted)}

  /* ── TABS ── */
  .tabs{
    display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;
    max-width:1640px;margin:0 auto;padding:22px 44px 0;
  }
  .tabs::-webkit-scrollbar{display:none}
  .tab{
    white-space:nowrap;background:transparent;border:none;cursor:pointer;
    font-family:inherit;font-size:14.5px;font-weight:600;color:var(--ink-2);
    padding:11px 6px 15px;position:relative;
    border-bottom:2px solid transparent;transition:color .16s ease;
  }
  .tab:hover{color:var(--brand-deep)}
  .tab.on{color:var(--brand-deep);border-bottom-color:var(--brand)}
  .tab:focus-visible{outline:2px solid var(--brand);outline-offset:3px;border-radius:4px}

  /* ── BODY ── */
  .body{max-width:1640px;margin:0 auto;padding:32px 44px 48px}

  .panel{
    background:var(--surface);border:1px solid var(--line);border-radius:16px;
    overflow:hidden;box-shadow:0 1px 2px rgba(13,39,57,.04),0 24px 48px -40px rgba(13,39,57,.4);
  }
  .panel-head{
    display:flex;align-items:baseline;justify-content:space-between;gap:14px;
    flex-wrap:wrap;padding:22px 28px;border-bottom:1px solid var(--line-2);
  }
  .panel-head h2{
    font-size:19px;font-weight:700;letter-spacing:-.01em;color:var(--navy);
  }
  .verified{
    display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;
    color:var(--brand-deep);
  }
  .tick{
    display:inline-flex;align-items:center;justify-content:center;
    width:16px;height:16px;border-radius:50%;background:var(--brand-tint);
    color:var(--brand);font-size:10px;font-weight:800;
  }

  /* ── TABLE ── */
  .scroll{overflow-x:auto;animation:rise .22s cubic-bezier(.22,1,.36,1)}
  @keyframes rise{from{opacity:.4;transform:translateY(4px)}to{opacity:1;transform:none}}

  .grid{width:100%;border-collapse:collapse;min-width:980px}
  thead th{
    position:sticky;top:0;background:var(--surface);z-index:2;
    font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    color:var(--ink-2);padding:15px 18px;white-space:nowrap;
    border-bottom:1px solid var(--line);
  }
  .th-name{text-align:left;min-width:280px}
  .th-c{text-align:center}
  .th-u{position:relative}
  .th-u::after{
    content:"";position:absolute;left:18px;right:18px;bottom:-1px;height:2px;
    background:var(--u);border-radius:2px;opacity:.85;
  }
  .th-vs{text-align:center;width:112px;color:var(--muted)}

  tbody tr{transition:background .14s ease}
  .row-lead td{border-top:1px solid var(--line-2)}
  tbody tr:first-child td{border-top:none}
  tbody tr:hover{background:var(--surface-2)}

  .td-name{padding:15px 18px;vertical-align:middle}
  .pname{
    display:inline-flex;align-items:center;gap:9px;flex-wrap:wrap;
    font-size:15.5px;font-weight:600;color:var(--ink);
  }
  .pnote{display:block;font-size:12.5px;color:var(--muted);margin-top:4px;line-height:1.45}
  .excl{
    font-size:10px;font-weight:700;letter-spacing:.03em;color:var(--brand-deep);
    background:var(--brand-tint);border:1px solid rgba(18,165,188,.28);
    padding:2px 8px;border-radius:5px;text-transform:uppercase;
  }

  .cell{padding:15px 18px;text-align:center;vertical-align:middle}
  .la-col{background:var(--brand-tint)}
  tbody tr:hover .la-col{background:rgba(18,165,188,.11)}

  .sz{
    display:inline-block;font-size:12px;font-weight:600;color:var(--ink-2);
    background:var(--surface-2);border:1px solid var(--line);
    padding:4px 11px;border-radius:6px;white-space:nowrap;
  }
  .price-la{font-size:17.5px;font-weight:800;color:var(--brand-deep);letter-spacing:-.01em}
  .price{font-size:14.5px;font-weight:600;color:var(--ink-2)}
  .price.approx{color:var(--muted);font-weight:500}
  .ppm{font-size:13.5px;font-weight:700;color:#0E7C8C}
  .dash{color:#B6C6CA;font-size:14px}

  .bdg{
    display:inline-block;font-size:12px;font-weight:700;letter-spacing:.01em;
    padding:4px 10px;border-radius:7px;white-space:nowrap;
  }
  .bdg-pos{color:var(--pos);background:var(--pos-bg)}
  .bdg-neg{color:var(--neg);background:var(--neg-bg)}
  .bdg-eq{color:var(--muted);background:var(--surface-2);border:1px solid var(--line)}

  .coverage{
    font-size:12.5px;color:var(--muted);padding:15px 28px;
    border-top:1px solid var(--line-2);background:var(--surface-2);
  }

  /* ── VALUE SUMMARY ── */
  .summary{margin-top:30px}
  .sum-head{display:flex;align-items:baseline;gap:14px;margin-bottom:16px;flex-wrap:wrap}
  .sum-head h3{
    font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.05em;
    color:var(--navy);font-weight:400;
  }
  .sum-head span{font-size:13px;color:var(--muted)}
  .sum-grid{
    display:grid;gap:16px;
    grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  }
  .metric{
    background:var(--surface);border:1px solid var(--line);border-radius:14px;
    padding:22px 22px 20px;transition:transform .18s cubic-bezier(.22,1,.36,1),box-shadow .18s ease,border-color .18s ease;
  }
  .metric:hover{
    transform:translateY(-3px);border-color:rgba(18,165,188,.4);
    box-shadow:0 18px 32px -22px rgba(9,82,94,.55);
  }
  .metric-v{
    font-family:'Bebas Neue',sans-serif;font-size:48px;line-height:.92;
    color:var(--brand-deep);letter-spacing:.01em;
  }
  .metric-u{font-size:21px;color:var(--brand);margin-left:2px}
  .metric-l{
    font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
    color:var(--ink-2);margin:13px 0 8px;
  }
  .metric-d{font-size:13.5px;line-height:1.55;color:var(--muted)}

  /* ── FOOTNOTES ── */
  .notes{
    margin-top:28px;padding-top:22px;border-top:1px solid var(--line);
  }
  .notes p{font-size:12.5px;line-height:1.7;color:var(--muted);max-width:80ch}
  .notes strong{color:var(--ink-2)}
  .legend-key{
    display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:12px;align-items:center;
  }
  .legend-key b{color:var(--ink-2);font-weight:700}
  .k-approx,.k-excl{color:var(--brand-deep)}
  .legend-key .bdg{font-size:10px}
  .ruo{font-style:italic}

  /* ── RESPONSIVE ── */
  @media(max-width:1100px){
    .hdr-inner,.tabs,.body{padding-left:28px;padding-right:28px}
  }
  @media(max-width:760px){
    .hdr-inner,.tabs{padding-left:16px;padding-right:16px}
    .body{padding:18px 16px 28px}
    .legend{width:100%}
    .brand{gap:14px}
    .logo{height:38px}
    .brand-txt{padding-left:14px}
    thead th,.cell,.td-name{padding:11px 12px}
  }

  /* ── REDUCED MOTION ── */
  @media(prefers-reduced-motion:reduce){
    *{animation:none!important;transition:none!important}
    .metric:hover{transform:none}
  }
`;
