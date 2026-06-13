import { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// VENDOR REGISTRY
// Colors are used only for legend dots + header underlines, never on price text,
// so LA Peptides stays the loudest thing on screen.
// ══════════════════════════════════════════════════════════════════════════════
const VENDORS = {
  la:    { name: "LA Peptides",        short: "LA",  head: "LA Peptides",  color: "#12A5BC" },
  // US-synthesized set
  bio:   { name: "BioLongevity Labs",  short: "BLL", head: "BioLongevity", color: "#7C6BC4" },
  lim:   { name: "Limitless Biotech",  short: "LIM", head: "Limitless",    color: "#B0529E" },
  bp:    { name: "Biotech Peptides",   short: "BP",  head: "Biotech",      color: "#3E73B8" },
  vp:    { name: "Verified Peptides",  short: "VP",  head: "Verified",     color: "#4E9E6F" },
  // Grey-market set
  asc:   { name: "Ascension Peptides", short: "ASC", head: "Ascension",    color: "#C97B3C" },
  swiss: { name: "Swiss Chems",        short: "SWC", head: "Swiss Chems",  color: "#3E73B8" },
  pure:  { name: "Pure Rawz",          short: "PR",  head: "Pure Rawz",    color: "#7C6BC4" },
  prime: { name: "Prime Peptides",     short: "PP",  head: "Prime",        color: "#C2557A" },
  amino: { name: "Amino Asylum",       short: "AA",  head: "Amino",        color: "#C0202B", warn: true },
  vpg:   { name: "Verified Peptides",  short: "VP",  head: "Verified",     color: "#4E9E6F" },
};

// Products LA Peptides flags as exclusive (badge shows only when no competitor
// in the active market carries the SKU).
const EXCL = new Set([
  "GLP-1 Capsule (Orforglipron)",
  "GLP-2 (T) Capsules",
  "Gut Restore (BPC+KPV+L-Gln)",
  "Repair (GHK-Cu cream)",
  "Smooth (anti-aging cream)",
  "Tan (MT-2 topical)",
]);

// Shared product sublabels.
const NOTES = {
  "BPC-157 / TB-500 Blend": "#1 recovery stack",
  "BPC-157 Single": "Body protection compound",
  "BPC-157": "Body protection compound",
  "TB-500 Single": "Tissue regeneration",
  "TB-500 (Thymosin Beta-4)": "Tissue regeneration",
  "GLOW Blend (BPC+TB+GHK-Cu)": "Healing triple blend",
  "KLOW Blend (BPC+TB+GHK-Cu+KPV)": "Quad healing blend",
  "CJC No DAC / Ipamorelin": "GH secretagogue blend",
  "Sermorelin / Ipamorelin": "Alt GH secretagogue blend",
  "CJC / Ipamorelin / GHRP-2 Triple": "Triple GH stack",
  "GHK-Cu (Copper Tripeptide)": "Repair, collagen, anti-aging",
  "Epithalon / Epitalon": "Telomere longevity peptide",
  "MOTS-C": "Mitochondrial metabolic",
  "Ipamorelin": "GH secretagogue",
  "Semax (injectable)": "Cognitive neuropeptide vial",
  "Selank (injectable)": "Anxiolytic / cognitive vial",
  "KPV": "Anti-inflammatory tripeptide",
  "Sermorelin": "GH-releasing factor",
  "Thymosin Alpha-1": "Immune modulation",
  "PT-141 (Bremelanotide)": "Sexual health",
  "AOD-9604": "Fat-loss fragment",
  "Tesamorelin": "GHRH analog / visceral fat",
  "VIP (Vasoactive Intestinal Peptide)": "Immune / GI / neuro",
  "IGF-1 LR3": "Insulin-like growth factor",
  "DSIP": "Sleep / circadian",
  "SLU-PP-332": "Exercise mimetic / AMPK",
  "SNAP-8 (Acetyl Octapeptide-3)": "Anti-wrinkle octapeptide",
  "ARA-290": "Neuroprotective / EPO-derived",
  "Cagrilinitide": "GLP-1 / amylin dual analog",
  "Glutathione": "Master antioxidant",
  "NAD+": "Cellular energy / DNA repair",
  "Melanotan 2 (MT-2)": "Tanning / libido",
  "5-Amino 1MQ": "NAD+ metabolic booster",
  "LA-31 (SS-31 / Elamipretide)": "Mitochondrial cardiolipin",
  "GLP-1 (S) — Semaglutide": "Single GLP-1 agonist • LA GLP-1(S)",
  "GLP-2 (T) — Tirzepatide": "Dual GLP-1/GIP • LA GLP-2(T)",
  "GLP-3 (R) — Retatrutide": "Triple GLP-1/GIP/glucagon • LA GLP-3(R)",
  "BPC-157 Capsules": "Oral BPC-157",
  "TB-500 Capsules": "Oral TB-500",
  "GHK-Cu Capsules": "Oral copper tripeptide",
  "Repair & Fix (BPC+TB+GHK)": "Triple blend caps",
  "5-Amino 1MQ Capsules": "NAD+ metabolic",
  "Dihexa Capsules": "Cognitive",
  "SLU-PP-332 Capsules": "Exercise mimetic",
  "GLP-1 Capsule (Orforglipron)": "Oral GLP-1 agonist",
  "GLP-2 (T) Capsules": "Oral tirzepatide",
  "Gut Restore (BPC+KPV+L-Gln)": "Gut-healing blend",
  "BPC-157 Spray": "Intranasal BPC-157",
  "TB-500 Spray": "Intranasal TB-500",
  "BPC/TB Blend Spray": "Recovery blend nasal",
  "BPC-157 Acetate Spray": "Acetate salt format",
  "Semax Spray": "Cognitive nasal",
  "Selank Spray": "Anti-anxiety nasal",
  "PT-141 Spray": "Sexual health nasal",
  "Dihexa Spray": "Nootropic nasal",
  "NAD+ Spray": "Sublingual NAD+",
  "NAD+ / Glutathione Spray": "Sublingual antioxidant",
  "PT-141 / Oxytocin Blend": "Intimacy blend",
  "Semax/Selank/Dihexa Blend": "Cognitive triple",
  "Healing Blend Spray (BPC/TB/GHK)": "Recovery blend spray",
  "Repair (GHK-Cu cream)": "Skin repair / anti-aging",
  "Smooth (anti-aging cream)": "Fine-line formula",
  "Tan (MT-2 topical)": "Melanotan-2 tanning",
  "GLOW Topical": "Healing topical",
  "KLOW Topical": "Advanced topical",
  "Argireline (Acetyl Hex-3)": "Botox-like topical",
  "AHK-Cu Topical": "Hair & skin copper",
  "GHK-Cu Powder (DIY serum/cream)": "Raw powder for DIY prep",
  "Argireline (Acetyl Hex-3) Powder": "Raw powder for DIY prep",
  "Matrixyl / Pal-Pentapeptide Powder": "Raw powder for DIY prep",
};

// ══════════════════════════════════════════════════════════════════════════════
// MARKET DATA — verbatim from lapeptides-market-analysis.vercel.app (June 12 2026)
// Tab 1: US-Synthesized   Tab 2: Grey-Market
// ══════════════════════════════════════════════════════════════════════════════
const MARKETS = {
  us: {
    id: "us",
    label: "US-Synthesized",
    sub: "US SPPS synthesis confirmed · all vendors",
    intro: {
      kind: "ok",
      text: "US SPPS synthesis confirmed for every vendor — BioLongevity Labs (GMP, triple 3P-tested), Limitless Biotech (FL LLC, BBB-accredited), Biotech Peptides (US SPPS + lyophilization), Verified Peptides (US synthesis, 3P-tested).",
    },
    cols: [
      { k: "bio",   tier: "PREMIUM ▲" },
      { k: "lim",   tier: "PREMIUM ▲" },
      { k: "bp",    tier: "VALUE ▼" },
      { k: "vp",    tier: "VALUE ▼" },
    ],
    laTier: "MID-MARKET",
    cats: [
      { id: "inj-blends", label: "Injectable Blends", rows: [
        { n: "BPC-157 / TB-500 Blend", v: [
          { sz: "10mg (5+5)",  la: "$69.99",  ppm: "$7.00", bio: "$119.97", lim: "$119.99", bp: "$115.00", vp: "$107.00" },
          { sz: "20mg (10+10)", la: "$129.99", ppm: "$6.50", bio: "—", lim: "—", bp: "—", vp: "—" },
        ]},
        { n: "BPC-157 Single", v: [
          { sz: "10mg", la: "$59.99", ppm: "$6.00", bio: "$99.97", lim: "$99.99",  bp: "$92.00", vp: "~$65.00" },
          { sz: "20mg", la: "—",      ppm: "—",     bio: "—",      lim: "$180.99", bp: "—",      vp: "—" },
        ]},
        { n: "TB-500 Single", v: [
          { sz: "10mg", la: "$79.99", ppm: "$8.00", bio: "—", lim: "—", bp: "$70.00", vp: "~$65.00" },
        ]},
        { n: "GLOW Blend (BPC+TB+GHK-Cu)", v: [
          { sz: "70mg", la: "$89.99", ppm: "$1.29", bio: "$259.97", lim: "—", bp: "$305.00", vp: "—" },
        ]},
        { n: "KLOW Blend (BPC+TB+GHK-Cu+KPV)", v: [
          { sz: "80mg", la: "$129.99", ppm: "$1.62", bio: "~$289.97", lim: "—", bp: "—", vp: "—" },
        ]},
        { n: "CJC No DAC / Ipamorelin", v: [
          { sz: "10mg (5+5)", la: "$74.99", ppm: "$7.50", bio: "—", lim: "$109.99", bp: "$81.00", vp: "~$75.00" },
        ]},
        { n: "Sermorelin / Ipamorelin", v: [
          { sz: "10mg (5+5)", la: "—", ppm: "—", bio: "—", lim: "$99.99", bp: "$81.00", vp: "~$70.00" },
        ]},
        { n: "CJC / Ipamorelin / GHRP-2 Triple", v: [
          { sz: "9mg (3+3+3)", la: "—", ppm: "—", bio: "—", lim: "$119.99", bp: "$80.00", vp: "—" },
        ]},
      ]},

      { id: "inj-singles", label: "Injectable Singles", rows: [
        { n: "GHK-Cu (Copper Tripeptide)", v: [{ sz: "50mg", la: "$39.99", ppm: "$0.80", bio: "$69.97", lim: "$69.99", bp: "—", vp: "~$55.00" }] },
        { n: "Epithalon / Epitalon", v: [{ sz: "10mg", la: "$79.99", ppm: "$8.00", bio: "$69.97", lim: "$99.99", bp: "—", vp: "~$50.00" }] },
        { n: "MOTS-C", v: [{ sz: "5mg", la: "$69.99", ppm: "$14.00", bio: "—", lim: "$89.99", bp: "—", vp: "~$75.00" }] },
        { n: "Ipamorelin", v: [{ sz: "5mg", la: "$49.99", ppm: "$10.00", bio: "—", lim: "—", bp: "$28.00", vp: "~$35.00" }] },
        { n: "Semax (injectable)", v: [{ sz: "10mg", la: "$39.99", ppm: "$4.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Selank (injectable)", v: [{ sz: "10mg", la: "$39.99", ppm: "$4.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "KPV", v: [{ sz: "10mg", la: "$59.99", ppm: "$6.00", bio: "—", lim: "—", bp: "—", vp: "~$55.00" }] },
        { n: "Sermorelin", v: [{ sz: "10mg", la: "$69.99", ppm: "$7.00", bio: "—", lim: "—", bp: "$43.00", vp: "~$55.00" }] },
        { n: "Thymosin Alpha-1", v: [{ sz: "10mg", la: "$59.99", ppm: "$6.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "PT-141 (Bremelanotide)", v: [{ sz: "10mg", la: "$69.99", ppm: "$7.00", bio: "—", lim: "—", bp: "$45.00", vp: "~$50.00" }] },
        { n: "AOD-9604", v: [{ sz: "5mg", la: "$49.99", ppm: "$10.00", bio: "—", lim: "—", bp: "$44.00", vp: "—" }] },
        { n: "Tesamorelin", v: [{ sz: "10mg", la: "$74.99", ppm: "$7.50", bio: "—", lim: "$99.99", bp: "$73.00", vp: "~$65.00" }] },
        { n: "VIP (Vasoactive Intestinal Peptide)", v: [{ sz: "5mg", la: "$59.99", ppm: "$12.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "IGF-1 LR3", v: [{ sz: "1mg", la: "$59.99", ppm: "$60.00", bio: "—", lim: "~$109.99", bp: "$58.00", vp: "~$55.00" }] },
        { n: "DSIP", v: [{ sz: "5mg", la: "$29.99", ppm: "$6.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "SLU-PP-332", v: [{ sz: "10mg", la: "$74.99", ppm: "$7.50", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "SNAP-8 (Acetyl Octapeptide-3)", v: [{ sz: "10mg", la: "$34.99", ppm: "$3.50", bio: "—", lim: "—", bp: "—", vp: "~$30.00" }] },
        { n: "ARA-290", v: [{ sz: "10mg", la: "$69.99", ppm: "$7.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Cagrilinitide", v: [{ sz: "10mg", la: "$99.99", ppm: "$10.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Glutathione", v: [{ sz: "500mg", la: "$59.99", ppm: "$0.12", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "NAD+", v: [{ sz: "500mg", la: "$74.99", ppm: "$0.15", bio: "—", lim: "—", bp: "—", vp: "~$85.00" }] },
        { n: "Melanotan 2 (MT-2)", v: [{ sz: "10mg", la: "$44.99", ppm: "$4.50", bio: "—", lim: "—", bp: "$37.00", vp: "—" }] },
        { n: "5-Amino 1MQ", v: [{ sz: "10mg", la: "$55.99", ppm: "$5.60", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "LA-31 (SS-31 / Elamipretide)", v: [
          { sz: "10mg", la: "$49.99", ppm: "$5.00", bio: "—", lim: "—", bp: "—", vp: "~$65.00" },
          { sz: "50mg", la: "$150.00", ppm: "$3.00", bio: "—", lim: "—", bp: "—", vp: "—" },
        ]},
      ]},

      { id: "inj-glp", label: "GLP / Metabolic", rows: [
        { n: "GLP-1 (S) — Semaglutide", v: [
          { sz: "10mg", la: "$64.99", ppm: "$6.50", bio: "~$99.97", lim: "$129.99", bp: "—", vp: "—" },
        ]},
        { n: "GLP-2 (T) — Tirzepatide", v: [
          { sz: "10mg", la: "$99.99",  ppm: "$10.00", bio: "~$119.97", lim: "$149.99", bp: "—", vp: "—" },
          { sz: "15mg", la: "$169.99", ppm: "$11.33", bio: "—", lim: "—", bp: "—", vp: "—" },
        ]},
        { n: "GLP-3 (R) — Retatrutide", v: [
          { sz: "10mg", la: "$94.99",  ppm: "$9.50", bio: "~$139.97", lim: "$169.99", bp: "—", vp: "—" },
          { sz: "20mg", la: "$169.99", ppm: "$8.50", bio: "—", lim: "—", bp: "—", vp: "—" },
          { sz: "30mg", la: "$229.99", ppm: "$7.67", bio: "—", lim: "—", bp: "—", vp: "—" },
        ]},
      ]},

      { id: "bioregs", label: "Bioregulators", rows: [
        { n: "Cardiogen", note: "Cardiac tissue", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "$79.99", bp: "$62.00", vp: "$55.00" }] },
        { n: "Cartalax",  note: "Joint / cartilage", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "$79.99", bp: "$62.00", vp: "$55.00" }] },
        { n: "Crystagen", note: "Eye / vision", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "$79.99", bp: "$62.00", vp: "$55.00" }] },
        { n: "Ovagen",    note: "Liver & ovarian", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$62.00", vp: "$55.00" }] },
        { n: "Pancragen", note: "Pancreatic", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$62.00", vp: "$55.00" }] },
        { n: "Pinealon",  note: "Brain / neuro", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$62.00", vp: "$55.00" }] },
        { n: "Testagen",  note: "Testosterone / gonadal", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$62.00", vp: "$55.00" }] },
        { n: "Thymalin",  note: "Thymus / immune", v: [{ sz: "20mg", la: "$69.99", ppm: "$3.50", bio: "—", lim: "—", bp: "$65.00", vp: "$60.00" }] },
        { n: "Vesugen",   note: "Vascular endothelial", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$62.00", vp: "$55.00" }] },
        { n: "Vilon",     note: "Immune / longevity", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", bio: "—", lim: "—", bp: "$62.00", vp: "$60.00" }] },
      ]},

      { id: "caps", label: "Capsules", rows: [
        { n: "BPC-157 Capsules", v: [{ sz: "60ct", la: "$89.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "TB-500 Capsules", v: [{ sz: "60ct", la: "$89.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "GHK-Cu Capsules", v: [{ sz: "60ct", la: "$79.99", ppm: "—", bio: "—", lim: "$99.99", bp: "—", vp: "—" }] },
        { n: "Repair & Fix (BPC+TB+GHK)", v: [{ sz: "60ct", la: "$149.99", ppm: "—", bio: "—", lim: "$149.99", bp: "—", vp: "—" }] },
        { n: "5-Amino 1MQ Capsules", v: [{ sz: "60ct", la: "$124.99", ppm: "—", bio: "—", lim: "$209.99", bp: "—", vp: "—" }] },
        { n: "Dihexa Capsules", v: [{ sz: "30ct", la: "$79.99", ppm: "—", bio: "—", lim: "$119.99", bp: "—", vp: "—" }] },
        { n: "SLU-PP-332 Capsules", v: [{ sz: "60ct", la: "$79.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "GLP-1 Capsule (Orforglipron)", v: [{ sz: "30ct", la: "$229.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "GLP-2 (T) Capsules", v: [{ sz: "30ct", la: "$159.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Gut Restore (BPC+KPV+L-Gln)", v: [{ sz: "60ct", la: "$139.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
      ]},

      { id: "sprays", label: "Sprays", rows: [
        { n: "BPC-157 Spray", v: [{ sz: "6mg", la: "$44.99", ppm: "$7.50", bio: "—", lim: "$102.99", bp: "—", vp: "—" }] },
        { n: "TB-500 Spray", v: [{ sz: "6mg", la: "$44.99", ppm: "$7.50", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "BPC/TB Blend Spray", v: [{ sz: "10mg", la: "—", ppm: "—", bio: "—", lim: "$129.99", bp: "—", vp: "—" }] },
        { n: "BPC-157 Acetate Spray", v: [{ sz: "6mg", la: "—", ppm: "—", bio: "—", lim: "$102.99", bp: "—", vp: "—" }] },
        { n: "Semax Spray", v: [{ sz: "30mg/10ml", la: "$49.99", ppm: "$1.67", bio: "—", lim: "$76.99", bp: "—", vp: "—" }] },
        { n: "Selank Spray", v: [{ sz: "10mg", la: "$49.99", ppm: "$5.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "PT-141 Spray", v: [{ sz: "spray", la: "$49.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Dihexa Spray", v: [{ sz: "5mg", la: "$54.99", ppm: "$11.00", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "NAD+ Spray", v: [{ sz: "spray", la: "$54.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "PT-141 / Oxytocin Blend", v: [{ sz: "blend", la: "$59.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Semax/Selank/Dihexa Blend", v: [{ sz: "blend", la: "$59.99", ppm: "—", bio: "—", lim: "$131.99", bp: "—", vp: "—" }] },
      ]},

      { id: "topicals", label: "Topicals / Creams", rows: [
        { n: "Repair (GHK-Cu cream)", v: [{ sz: "cream", la: "$149.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Smooth (anti-aging cream)", v: [{ sz: "cream", la: "$169.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "Tan (MT-2 topical)", v: [{ sz: "cream", la: "$129.99", ppm: "—", bio: "—", lim: "—", bp: "—", vp: "—" }] },
        { n: "GLOW Topical", v: [{ sz: "70mg", la: "—", ppm: "—", bio: "$89.97", lim: "—", bp: "—", vp: "—" }] },
        { n: "KLOW Topical", v: [{ sz: "80mg", la: "—", ppm: "—", bio: "$109.97", lim: "—", bp: "—", vp: "—" }] },
        { n: "Argireline (Acetyl Hex-3)", v: [{ sz: "200mg", la: "—", ppm: "—", bio: "—", lim: "—", bp: "$210.00", vp: "~$30.00" }] },
        { n: "AHK-Cu Topical", v: [{ sz: "200mg", la: "—", ppm: "—", bio: "—", lim: "—", bp: "$192.00", vp: "~$30.00" }] },
      ]},
    ],
    coverage: {
      bioregs:  "Bioregulators: LA carries all 10 SKUs. BP fields the full line; VP covers all 10; Limitless carries only Cardiogen / Cartalax / Crystagen; BLL does not field this class.",
      caps:     "Capsules: a largely LA-exclusive format among US-synthesized vendors; Limitless overlaps on a handful.",
      sprays:   "Sprays: among US-synth vendors only LA and Limitless field this format.",
      topicals: "Topicals: LA finished creams are exclusive. BP carries Argireline and AHK-Cu; BLL fields GLOW / KLOW topicals only.",
    },
    highlights: [
      { v: "$0.80", u: "/mg", l: "GHK-Cu · 50mg",       d: "Lowest $/mg in the catalog. BLL & Limitless both list the vial near $69.97." },
      { v: "$1.29", u: "/mg", l: "GLOW Blend · 70mg",   d: "LA $89.99 against BLL $259.97 — roughly 65% less per vial. Biotech sits at $305." },
      { v: "$6.00", u: "/mg", l: "BPC-157 · 10mg",      d: "LA's value floor on the #1 single; BLL/LIM both $9.99/mg, BP $9.20/mg, VP ~$6.50/mg." },
      { v: "$7.67", u: "/mg", l: "GLP-3(R) · 30mg bulk", d: "Best $/mg across every GLP. LA is the only US-synth vendor carrying 30mg." },
      { v: "$8.50", u: "/mg", l: "GLP-3(R) · 20mg",     d: "LA-exclusive size — no US-synthesized competitor carries 20mg retatrutide." },
      { v: "$3.00", u: "/mg", l: "Bioregulators · 20mg", d: "LA $59.99 vs BP $62 vs VP $55; Limitless carries only three of the ten SKUs." },
    ],
    sources: [
      ["LA Peptides", "lapeptides.net — all prices confirmed; GLP-3(R) 20mg = $169.99 confirmed."],
      ["BioLongevity Labs", "biolongevitylabs.com — GLOW = $259.97 live confirmed."],
      ["Limitless Biotech", "limitlesslifenootropics.com — product-page meta-prices."],
      ["Biotech Peptides", "biotechpeptides.com — Cardiogen = $62.00; full bioregulator line confirmed."],
      ["Verified Peptides", "verifiedpeptides.com — full bioregulator line $55–$60; BPC/TB blend = $107."],
    ],
  },

  grey: {
    id: "grey",
    label: "Grey-Market",
    sub: "Chinese API-sourced · competitive intel only",
    intro: {
      kind: "warn",
      text: "Grey-Market / Non-US-Synthesized — these vendors source peptide API primarily from Chinese manufacturers. Purity is self-reported or Janoshik-verified (a single European lab). Synthesis provenance, sterility, and endotoxin standards differ significantly from US-SPPS vendors. Amino Asylum was subject to FDA enforcement action in 2025–2026. This comparison is for competitive intelligence only.",
    },
    cols: [
      { k: "asc",   tier: "VALUE" },
      { k: "swiss", tier: "MID" },
      { k: "pure",  tier: "MID" },
      { k: "prime", tier: "VALUE" },
      { k: "amino", tier: "BUDGET ⚠️" },
      { k: "vpg",   tier: "VALUE" },
    ],
    laTier: "US-SYNTH",
    cats: [
      { id: "inj-blends", label: "Injectable Blends", rows: [
        { n: "BPC-157 / TB-500 Blend", v: [
          { sz: "10mg (5+5)",  la: "$69.99",  ppm: "$7.00", asc: "$130.00", swiss: "$132.95", pure: "~$89.99", prime: "—", amino: "~$45.00", vpg: "$107.00" },
          { sz: "20mg (10+10)", la: "$129.99", ppm: "$6.50", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
        ]},
        { n: "GLOW Blend (BPC+TB+GHK-Cu)", v: [
          { sz: "70mg", la: "$89.99", ppm: "$1.29", asc: "$130.00", swiss: "—", pure: "—", prime: "$105.00", amino: "—", vpg: "—" },
        ]},
        { n: "KLOW Blend (BPC+TB+GHK-Cu+KPV)", v: [
          { sz: "80mg", la: "$129.99", ppm: "$1.62", asc: "$135.00", swiss: "—", pure: "—", prime: "$140.00", amino: "—", vpg: "—" },
        ]},
        { n: "CJC No DAC / Ipamorelin", v: [
          { sz: "10mg (5+5)", la: "$74.99", ppm: "$7.50", asc: "$80.00", swiss: "—", pure: "~$69.99", prime: "$75.00", amino: "~$45.00", vpg: "~$70.00" },
        ]},
        { n: "Sermorelin / Ipamorelin", v: [
          { sz: "10mg (5+5)", la: "—", ppm: "—", asc: "—", swiss: "—", pure: "~$59.99", prime: "—", amino: "—", vpg: "~$65.00" },
        ]},
      ]},

      { id: "inj-singles", label: "Injectable Singles", rows: [
        { n: "BPC-157", v: [
          { sz: "5mg",  la: "—",      ppm: "—",     asc: "$59.99", swiss: "~$37.00", pure: "~$39.99", prime: "—", amino: "$23.00", vpg: "~$40.00" },
          { sz: "10mg", la: "$59.99", ppm: "$6.00", asc: "$60.00", swiss: "$49.99",  pure: "$54.99",  prime: "$60.00", amino: "~$40.00", vpg: "~$65.00" },
        ]},
        { n: "TB-500 (Thymosin Beta-4)", v: [
          { sz: "5mg",  la: "—",      ppm: "—",     asc: "$45.00", swiss: "~$37.95", pure: "~$44.99", prime: "—", amino: "$27.00", vpg: "—" },
          { sz: "10mg", la: "$79.99", ppm: "$8.00", asc: "—", swiss: "—", pure: "~$64.99", prime: "$75.00", amino: "—", vpg: "~$65.00" },
        ]},
        { n: "GHK-Cu (Copper Tripeptide)", v: [
          { sz: "50mg",  la: "$39.99", ppm: "$0.80", asc: "—", swiss: "$68.95", pure: "$64.99", prime: "$65.00", amino: "~$35.00", vpg: "~$55.00" },
          { sz: "100mg", la: "—", ppm: "—", asc: "$50.00", swiss: "~$99.95", pure: "~$89.99", prime: "—", amino: "—", vpg: "—" },
        ]},
        { n: "Epithalon / Epitalon", v: [{ sz: "10mg", la: "$79.99", ppm: "$8.00", asc: "—", swiss: "$23.16", pure: "~$34.99", prime: "—", amino: "~$25.00", vpg: "~$45.00" }] },
        { n: "MOTS-C", v: [{ sz: "5mg", la: "$69.99", ppm: "$14.00", asc: "—", swiss: "—", pure: "—", prime: "$55.00", amino: "—", vpg: "~$75.00" }] },
        { n: "Ipamorelin", v: [{ sz: "5mg", la: "$49.99", ppm: "$10.00", asc: "~$35.00", swiss: "—", pure: "~$34.99", prime: "$55.00", amino: "—", vpg: "~$35.00" }] },
        { n: "Semax (injectable)", v: [{ sz: "10mg", la: "$39.99", ppm: "$4.00", asc: "~$40.00", swiss: "—", pure: "—", prime: "$50.00", amino: "—", vpg: "—" }] },
        { n: "Selank (injectable)", v: [
          { sz: "5mg",  la: "—",      ppm: "—",     asc: "—", swiss: "$25.95", pure: "—", prime: "~$35.00", amino: "—", vpg: "—" },
          { sz: "10mg", la: "$39.99", ppm: "$4.00", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
        ]},
        { n: "Sermorelin", v: [{ sz: "10mg", la: "$69.99", ppm: "$7.00", asc: "—", swiss: "—", pure: "~$59.99", prime: "$65.00", amino: "—", vpg: "~$55.00" }] },
        { n: "PT-141 (Bremelanotide)", v: [{ sz: "10mg", la: "$69.99", ppm: "$7.00", asc: "$55.00", swiss: "$49.99", pure: "~$49.99", prime: "—", amino: "—", vpg: "~$50.00" }] },
        { n: "AOD-9604", v: [{ sz: "5mg", la: "$49.99", ppm: "$10.00", asc: "—", swiss: "—", pure: "~$44.99", prime: "$50.00", amino: "—", vpg: "—" }] },
        { n: "Tesamorelin", v: [{ sz: "10mg", la: "$74.99", ppm: "$7.50", asc: "—", swiss: "—", pure: "~$64.99", prime: "$70.00", amino: "—", vpg: "~$65.00" }] },
        { n: "Thymosin Alpha-1", v: [
          { sz: "5mg",  la: "—",      ppm: "—",     asc: "—", swiss: "$63.99", pure: "~$64.99", prime: "—", amino: "—", vpg: "—" },
          { sz: "10mg", la: "$59.99", ppm: "$6.00", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
        ]},
        { n: "IGF-1 LR3", v: [{ sz: "1mg", la: "$59.99", ppm: "$60.00", asc: "—", swiss: "$59.96", pure: "~$54.99", prime: "—", amino: "—", vpg: "~$55.00" }] },
        { n: "Melanotan 2 (MT-2)", v: [{ sz: "10mg", la: "$44.99", ppm: "$4.50", asc: "—", swiss: "$34.95", pure: "~$34.99", prime: "$40.00", amino: "~$20.00", vpg: "—" }] },
        { n: "5-Amino 1MQ", v: [{ sz: "10mg", la: "$55.99", ppm: "$5.60", asc: "—", swiss: "—", pure: "~$49.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "Glutathione", v: [{ sz: "500–600mg", la: "$59.99", ppm: "$0.12", asc: "—", swiss: "$29.95", pure: "~$34.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "NAD+", v: [
          { sz: "100mg", la: "—",      ppm: "—",     asc: "—", swiss: "$47.95", pure: "—", prime: "—", amino: "—", vpg: "—" },
          { sz: "500mg", la: "$74.99", ppm: "$0.15", asc: "—", swiss: "—", pure: "—", prime: "$125.00", amino: "—", vpg: "~$85.00" },
        ]},
        { n: "LA-31 (SS-31 / Elamipretide)", v: [
          { sz: "10mg", la: "$49.99", ppm: "$5.00", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "~$65.00" },
          { sz: "50mg", la: "$150.00", ppm: "$3.00", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
        ]},
        { n: "Cagrilinitide", v: [{ sz: "10mg", la: "$99.99", ppm: "$10.00", asc: "$110.00", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
      ]},

      { id: "inj-glp", label: "GLP / Metabolic", rows: [
        { n: "GLP-1 (S) — Semaglutide", v: [
          { sz: "5mg",  la: "—",      ppm: "—",     asc: "$44.00", swiss: "—", pure: "~$54.99", prime: "$80.00", amino: "~$65.00", vpg: "—" },
          { sz: "10mg", la: "$64.99", ppm: "$6.50", asc: "—", swiss: "—", pure: "~$69.99", prime: "—", amino: "—", vpg: "—" },
        ]},
        { n: "GLP-2 (T) — Tirzepatide", v: [
          { sz: "10mg", la: "$99.99",  ppm: "$10.00", asc: "$70.00", swiss: "—", pure: "~$89.99", prime: "$115.00", amino: "—", vpg: "—" },
          { sz: "15mg", la: "$169.99", ppm: "$11.33", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
          { sz: "30mg", la: "—",       ppm: "—",      asc: "$135.00", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
        ]},
        { n: "GLP-3 (R) — Retatrutide", v: [
          { sz: "10mg", la: "$94.99",  ppm: "$9.50", asc: "$70.00", swiss: "—", pure: "~$89.99", prime: "$120.00", amino: "~$80.00", vpg: "—" },
          { sz: "20mg", la: "$169.99", ppm: "$8.50", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
          { sz: "30mg", la: "$229.99", ppm: "$7.67", asc: "$180.00", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" },
        ]},
      ]},

      { id: "bioregs", label: "Bioregulators", rows: [
        { n: "Cardiogen", note: "Cardiac tissue", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Cartalax",  note: "Joint / cartilage", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Crystagen", note: "Eye / vision", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Ovagen",    note: "Liver & ovarian", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Pancragen", note: "Pancreatic", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Pinealon",  note: "Brain / neuro", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Testagen",  note: "Testosterone / gonadal", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Thymalin",  note: "Thymus / immune", v: [{ sz: "20mg", la: "$69.99", ppm: "$3.50", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$60.00" }] },
        { n: "Vesugen",   note: "Vascular endothelial", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$55.00" }] },
        { n: "Vilon",     note: "Immune / longevity", v: [{ sz: "20mg", la: "$59.99", ppm: "$3.00", asc: "—", swiss: "~$63.95", pure: "—", prime: "—", amino: "—", vpg: "$60.00" }] },
      ]},

      { id: "caps", label: "Capsules", rows: [
        { n: "BPC-157 Capsules", v: [{ sz: "60ct", la: "$89.99", ppm: "—", asc: "—", swiss: "$85.95", pure: "~$79.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "TB-500 Capsules", v: [{ sz: "60ct", la: "$89.99", ppm: "—", asc: "—", swiss: "$254.95", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
        { n: "GHK-Cu Capsules", v: [{ sz: "60ct", la: "$79.99", ppm: "—", asc: "—", swiss: "—", pure: "~$69.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "5-Amino 1MQ Capsules", v: [{ sz: "60ct", la: "$124.99", ppm: "—", asc: "—", swiss: "$119.99", pure: "~$109.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "Dihexa Capsules", v: [{ sz: "30ct", la: "$79.99", ppm: "—", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
        { n: "SLU-PP-332 Capsules", v: [{ sz: "60ct", la: "$79.99", ppm: "—", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
        { n: "GLP-1 Capsule (Orforglipron)", v: [{ sz: "90ct", la: "$229.99", ppm: "—", asc: "—", swiss: "$198.95", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
        { n: "GLP-2 (T) Capsules", v: [{ sz: "30ct", la: "$159.99", ppm: "—", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
        { n: "Gut Restore (BPC+KPV+L-Gln)", v: [{ sz: "60ct", la: "$139.99", ppm: "—", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
      ]},

      { id: "sprays", label: "Sprays", rows: [
        { n: "BPC-157 Spray", v: [{ sz: "6mg", la: "$44.99", ppm: "$7.50", asc: "—", swiss: "—", pure: "$49.99", prime: "—", amino: "~$35.00", vpg: "—" }] },
        { n: "TB-500 Spray", v: [{ sz: "6mg", la: "$44.99", ppm: "$7.50", asc: "—", swiss: "—", pure: "~$54.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "Semax Spray", v: [{ sz: "30mg/10ml", la: "$49.99", ppm: "$1.67", asc: "—", swiss: "—", pure: "$55.00", prime: "$50.00", amino: "—", vpg: "—" }] },
        { n: "Selank Spray", v: [{ sz: "10mg", la: "$49.99", ppm: "$5.00", asc: "—", swiss: "—", pure: "$55.00", prime: "—", amino: "—", vpg: "—" }] },
        { n: "PT-141 Spray", v: [{ sz: "spray", la: "$49.99", ppm: "—", asc: "—", swiss: "—", pure: "~$54.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "Dihexa Spray", v: [{ sz: "5mg", la: "$54.99", ppm: "$11.00", asc: "—", swiss: "—", pure: "~$59.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "NAD+ / Glutathione Spray", v: [{ sz: "spray", la: "$54.99", ppm: "—", asc: "—", swiss: "—", pure: "$59.99", prime: "—", amino: "~$45.00", vpg: "—" }] },
        { n: "Healing Blend Spray (BPC/TB/GHK)", v: [{ sz: "blend", la: "$59.99", ppm: "—", asc: "—", swiss: "—", pure: "$37.99", prime: "—", amino: "—", vpg: "—" }] },
      ]},

      { id: "topicals", label: "Topicals / Creams", rows: [
        { n: "Repair (GHK-Cu cream)", v: [{ sz: "cream", la: "$149.99", ppm: "—", asc: "—", swiss: "~$39.90", pure: "~$64.99", prime: "—", amino: "—", vpg: "—" }] },
        { n: "Smooth (anti-aging cream)", v: [{ sz: "cream", la: "$169.99", ppm: "—", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
        { n: "Tan (MT-2 topical)", v: [{ sz: "cream", la: "$129.99", ppm: "—", asc: "—", swiss: "—", pure: "—", prime: "—", amino: "—", vpg: "—" }] },
        { n: "GHK-Cu Powder (DIY serum/cream)", v: [{ sz: "1000mg", la: "—", ppm: "—", asc: "—", swiss: "~$99.95", pure: "~$89.99", prime: "—", amino: "—", vpg: "~$95.00" }] },
        { n: "Argireline (Acetyl Hex-3) Powder", v: [{ sz: "200mg", la: "—", ppm: "—", asc: "—", swiss: "—", pure: "~$45.00", prime: "—", amino: "—", vpg: "~$30.00" }] },
        { n: "Matrixyl / Pal-Pentapeptide Powder", v: [{ sz: "200mg", la: "—", ppm: "—", asc: "—", swiss: "—", pure: "~$40.00", prime: "—", amino: "—", vpg: "~$30.00" }] },
      ]},
    ],
    coverage: {
      bioregs:  "Bioregulators: LA carries all 10 SKUs. Swiss Chems mirrors the line (~$63.95) and Verified Peptides covers all 10 ($55–$60); other grey vendors do not field this class.",
      caps:     "Capsules: Swiss Chems and Pure Rawz overlap on a few; the rest of the format remains LA-led.",
      topicals: "Finished creams remain a near-exclusive LA category — grey-market vendors mostly sell raw GHK-Cu / Argireline / Matrixyl powders for DIY prep, not finished pharmaceutical-grade creams.",
    },
    highlights: [
      { v: "20mg",  u: "",      l: "GLP-3(R) exclusive size", d: "Ascension has 10mg ($70) and 30mg ($180) — but no 20mg. LA is the only vendor at this vial across both markets." },
      { v: "$0.80", u: "/mg",   l: "GHK-Cu · 50mg",          d: "LA cheapest at $39.99 — beats every grey-market vendor by 40%+ per mg." },
      { v: "$89.99", u: "",     l: "GLOW Blend · 70mg",      d: "Undercuts Ascension ($130) by $40 and sits 31% below Prime ($105)." },
      { v: "US", u: "-synth",   l: "Provenance premium",     d: "Ascension undercuts 10mg retatrutide ($70 vs $94.99) — but with no US synthesis provenance." },
      { v: "EXCL", u: "",       l: "Finished creams",        d: "Near-exclusive LA category; grey market sells DIY GHK-Cu / Argireline powders only." },
      { v: "⚠️", u: "",         l: "Amino Asylum",           d: "Budget pricing, but subject to FDA enforcement action 2025–2026; operational status uncertain." },
    ],
    sources: [
      ["Ascension Peptides", "ascensionpeptides.com — R-10 $70, R-30 $180, S-5 $44, T-10 $70, T-30 $135, BPC-157 10mg $60, Wolverine $130, KLOW $135, GHK-Cu 100mg $50, Cagrilinitide $110."],
      ["Swiss Chems", "swisschems.is — BPC-157 $49.99, caps $85.95, GHK-Cu 50mg $68.95, Epitalon $23.16, MT-2 $34.95, PT-141 $49.99, IGF-1 LR3 $59.96, Orforglipron $198.95, Cardiogen $63.95."],
      ["Pure Rawz", "purerawz.co — BPC-157 nasal $49.99, Semax/Selank nasal $55, healing-blend spray $37.99, NAD+/Glutathione spray $59.99."],
      ["Prime Peptides", "primepeptides.co — all live prices."],
      ["Amino Asylum", "aminoasylum.shop — budget estimates. ⚠️ Subject to FDA enforcement action 2025–2026; operational status uncertain."],
      ["Verified Peptides", "verifiedpeptides.com — full bioregulator line $55–$60."],
    ],
  },
};

const CAT_ORDER = ["inj-blends", "inj-singles", "inj-glp", "bioregs", "caps", "sprays", "topicals"];

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const numVal = (p) =>
  p && p !== "—" && !p.startsWith("~") ? parseFloat(p.replace(/[^0-9.]/g, "")) : null;

function badge(la, others) {
  const lv = numVal(la);
  const vs = others.map(numVal).filter((x) => x != null);
  if (!lv || vs.length === 0) return null;
  const avg = vs.reduce((a, b) => a + b, 0) / vs.length;
  const pct = Math.round(((avg - lv) / avg) * 100);
  if (pct > 6)  return { t: `↓ ${pct}%`,           cls: "bdg-pos" };
  if (pct < -6) return { t: `↑ ${Math.abs(pct)}%`, cls: "bdg-neg" };
  return { t: "≈ par", cls: "bdg-eq" };
}

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
  return <td className="cell la-col"><span className="ppm">{val}</span></td>;
}

// ══════════════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [marketId, setMarketId] = useState("us");
  const [visible, setVisible] = useState(() => new Set());
  const [hdrH, setHdrH] = useState(0);

  const hdrRef = useRef(null);
  const sectionRefs = useRef({});

  const market = MARKETS[marketId];
  const cats = CAT_ORDER.map((id) => market.cats.find((c) => c.id === id)).filter(Boolean);
  const colKeys = market.cols.map((c) => c.k);
  // The active jump-nav tab = topmost category currently under the sticky header.
  const activeCat = CAT_ORDER.find((id) => visible.has(id)) || cats[0]?.id;

  // Measure the sticky header so jump-scroll can clear it (via scroll-margin).
  useEffect(() => {
    const el = hdrRef.current;
    if (!el) return;
    const update = () => setHdrH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Scroll-spy: a section counts as "active" once it crosses just below the header.
  useEffect(() => {
    if (!hdrH) return;
    const obs = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          const next = new Set(prev);
          for (const e of entries) {
            const id = e.target.dataset.cat;
            if (e.isIntersecting) next.add(id);
            else next.delete(id);
          }
          return next;
        });
      },
      { rootMargin: `-${hdrH + 4}px 0px -55% 0px`, threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [hdrH, marketId]);

  const selectMarket = (id) => {
    if (id === marketId) return;
    setMarketId(id);
    setVisible(new Set());
    window.scrollTo({ top: 0 });
  };

  const jumpTo = (id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="app" style={{ "--hdr-h": hdrH ? `${hdrH}px` : "0px" }}>
      <style>{CSS}</style>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="hdr" ref={hdrRef}>
        <div className="hdr-inner">
          <div className="brand">
            <img className="logo" src="/la-peptides-logo.svg" alt="LA Peptides" />
            <div className="brand-txt">
              <div className="kicker">Market Analysis</div>
              <div className="tagline">
                Every SKU · every mg variant · $/mg breakdown
              </div>
            </div>
          </div>

          {/* Primary market toggle */}
          <div className="seg" role="tablist" aria-label="Market">
            {Object.values(MARKETS).map((m) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={marketId === m.id}
                className={"seg-btn" + (marketId === m.id ? " on" : "") + (m.id === "grey" ? " seg-warn" : "")}
                onClick={() => selectMarket(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hdr-inner legend-row">
          <div className="legend">
            <div className="chip chip-la">
              <span className="dot" style={{ background: VENDORS.la.color }} />
              <span className="chip-name">{VENDORS.la.short}</span>
              <span className="chip-tier">{market.laTier}</span>
            </div>
            {market.cols.map((c) => {
              const v = VENDORS[c.k];
              return (
                <div className={"chip" + (v.warn ? " chip-warn" : "")} key={c.k}>
                  <span className="dot" style={{ background: v.color }} />
                  <span className="chip-name">{v.short}</span>
                  <span className="chip-tier">{c.tier}</span>
                </div>
              );
            })}
          </div>
        </div>

        <nav className="tabs" aria-label="Jump to category">
          {cats.map((c) => (
            <button
              key={c.id}
              className={"tab" + (activeCat === c.id ? " on" : "")}
              onClick={() => jumpTo(c.id)}
              aria-current={activeCat === c.id ? "true" : undefined}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <main className="body">
        {/* Market intro / risk banner */}
        <div className={"intro " + (market.intro.kind === "warn" ? "intro-warn" : "intro-ok")}>
          <span className="intro-ic" aria-hidden="true">
            {market.intro.kind === "warn" ? "⚠️" : "✓"}
          </span>
          <p>{market.intro.text}</p>
        </div>

        {/* All categories stacked — scroll straight down; the jump-nav scrolls here */}
        <div className="stack" key={marketId}>
          {cats.map((cat) => (
            <section
              className="panel"
              key={cat.id}
              id={`cat-${cat.id}`}
              data-cat={cat.id}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              style={{ scrollMarginTop: hdrH + 16 }}
            >
              <div className="panel-head">
                <h2>{cat.label}</h2>
                <span className="verified">{cat.rows.length} products</span>
              </div>

              <div className="scroll">
                <table className="grid">
                  <thead>
                    <tr>
                      <th className="th-name">Product</th>
                      <th className="th-c">Size</th>
                      <th className="th-c la-col" style={{ "--u": VENDORS.la.color }}>LA Peptides</th>
                      <th className="th-c la-col th-u" style={{ "--u": "#0E7C8C" }}>$/mg</th>
                      {market.cols.map((c) => {
                        const v = VENDORS[c.k];
                        return (
                          <th className="th-c th-u" key={c.k} style={{ "--u": v.color }}>
                            {v.head}{v.warn && <span className="th-warn"> ⚠️</span>}
                          </th>
                        );
                      })}
                      <th className="th-c th-vs">vs Market</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.rows.map((row, ri) =>
                      row.v.map((vr, vi) => {
                        const others = colKeys.map((k) => vr[k]);
                        const b = badge(vr.la, others);
                        const isExcl =
                          vi === 0 &&
                          EXCL.has(row.n) &&
                          others.every((x) => !x || x === "—");
                        const note = row.note || NOTES[row.n] || "";
                        return (
                          <tr key={`${ri}-${vi}`} className={vi === 0 ? "row-lead" : ""}>
                            <td className="td-name">
                              {vi === 0 && (
                                <>
                                  <span className="pname">
                                    {row.n}
                                    {isExcl && <span className="excl">LA exclusive</span>}
                                  </span>
                                  {note && <span className="pnote">{note}</span>}
                                </>
                              )}
                            </td>
                            <td className="cell"><span className="sz">{vr.sz}</span></td>
                            <PCell val={vr.la} la />
                            <PpmCell val={vr.ppm} />
                            {colKeys.map((k) => <PCell val={vr[k]} key={k} />)}
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

              {market.coverage[cat.id] && (
                <p className="coverage">{market.coverage[cat.id]}</p>
              )}
            </section>
          ))}
        </div>

        {/* ── VALUE SUMMARY ──────────────────────────────────────────────── */}
        <section className="summary">
          <div className="sum-head">
            <h3>{marketId === "grey" ? "Competitive read" : "$/mg reference"}</h3>
            <span>
              {marketId === "grey"
                ? "Where LA holds its ground against the grey market"
                : "Where LA Peptides sets the value floor"}
            </span>
          </div>
          <div className="sum-grid">
            {market.highlights.map((h, i) => (
              <article className="metric" key={i}>
                <div className="metric-v">
                  {h.v}{h.u && <span className="metric-u">{h.u}</span>}
                </div>
                <div className="metric-l">{h.l}</div>
                <p className="metric-d">{h.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── SOURCES / FOOTNOTES ────────────────────────────────────────── */}
        <footer className="notes">
          <div className="src-head">Sources · verified June 12 2026</div>
          <ul className="src-list">
            {market.sources.map(([name, detail], i) => (
              <li key={i}><b>{name}</b> — {detail}</li>
            ))}
          </ul>
          <p className="legend-key">
            <span><b className="k-approx">~</b> estimated from catalog tier</span>
            <span><b>—</b> not carried</span>
            <span><b className="k-excl">LA exclusive</b> no competitor in this market</span>
            <span><span className="bdg bdg-pos">↓ %</span> LA cheaper than market avg</span>
            <span className="ruo">All products research use only (RUO).</span>
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
    --warn:#B4540A; --warn-bg:rgba(201,123,60,.10); --warn-line:rgba(201,123,60,.35);
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
  .legend-row{padding-top:16px;padding-bottom:2px}
  .brand{display:flex;align-items:center;gap:20px}
  .logo{height:48px;width:auto;display:block}
  .brand-txt{padding-left:20px;border-left:1px solid var(--line)}
  .kicker{
    font-family:'Bebas Neue',sans-serif;font-size:27px;line-height:1;
    letter-spacing:.05em;color:var(--brand-deep);
  }
  .tagline{font-size:13px;color:var(--muted);margin-top:6px;letter-spacing:.01em}

  /* ── MARKET SEGMENTED CONTROL ── */
  .seg{
    display:inline-flex;background:var(--surface-2);border:1px solid var(--line);
    border-radius:12px;padding:4px;gap:4px;
  }
  .seg-btn{
    font-family:inherit;font-size:13.5px;font-weight:700;letter-spacing:.01em;
    color:var(--ink-2);background:transparent;border:none;cursor:pointer;
    padding:9px 18px;border-radius:9px;transition:all .16s ease;white-space:nowrap;
  }
  .seg-btn:hover{color:var(--brand-deep)}
  .seg-btn.on{background:var(--surface);color:var(--brand-deep);
    box-shadow:0 1px 2px rgba(13,39,57,.10),0 6px 14px -10px rgba(9,82,94,.5);}
  .seg-btn.seg-warn.on{color:var(--warn);box-shadow:0 1px 2px rgba(13,39,57,.10),0 6px 14px -10px rgba(180,84,10,.5);}
  .seg-btn:focus-visible{outline:2px solid var(--brand);outline-offset:2px}

  /* ── LEGEND ── */
  .legend{display:flex;gap:8px;flex-wrap:wrap}
  .chip{
    display:flex;align-items:center;gap:8px;background:var(--surface-2);
    border:1px solid var(--line);border-radius:10px;padding:7px 12px;
  }
  .chip-la{background:var(--brand-tint);border-color:rgba(18,165,188,.35)}
  .chip-warn{background:var(--neg-bg);border-color:rgba(192,32,43,.28)}
  .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .chip-name{font-size:12.5px;font-weight:700;color:var(--ink)}
  .chip-la .chip-name{color:var(--brand-deep)}
  .chip-tier{font-size:9.5px;font-weight:600;letter-spacing:.07em;color:var(--muted)}

  /* ── TABS ── */
  .tabs{
    display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;
    max-width:1640px;margin:0 auto;padding:18px 44px 0;
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
  .body{max-width:1640px;margin:0 auto;padding:28px 44px 48px}

  /* ── INTRO / RISK BANNER ── */
  .intro{
    display:flex;gap:13px;align-items:flex-start;border-radius:13px;
    padding:15px 20px;margin-bottom:22px;border:1px solid;
  }
  .intro p{font-size:13px;line-height:1.6}
  .intro-ic{font-size:15px;line-height:1.4;flex-shrink:0}
  .intro-ok{background:var(--brand-tint);border-color:rgba(18,165,188,.25);color:var(--brand-deep)}
  .intro-ok .intro-ic{color:var(--brand)}
  .intro-warn{background:var(--neg-bg);border-color:rgba(192,32,43,.28);color:#8E1A22}

  .stack{display:flex;flex-direction:column;gap:22px}
  .panel{
    background:var(--surface);border:1px solid var(--line);border-radius:16px;
    overflow:hidden;box-shadow:0 1px 2px rgba(13,39,57,.04),0 24px 48px -40px rgba(13,39,57,.4);
  }
  .panel-head{
    display:flex;align-items:baseline;justify-content:space-between;gap:14px;
    flex-wrap:wrap;padding:22px 28px;border-bottom:1px solid var(--line-2);
  }
  .panel-head h2{font-size:19px;font-weight:700;letter-spacing:-.01em;color:var(--navy)}
  .verified{font-size:12.5px;font-weight:600;color:var(--brand-deep)}

  /* ── TABLE ── */
  .scroll{overflow-x:auto;animation:rise .22s cubic-bezier(.22,1,.36,1)}
  @keyframes rise{from{opacity:.4;transform:translateY(4px)}to{opacity:1;transform:none}}

  .grid{width:100%;border-collapse:collapse;min-width:980px}
  thead th{
    position:sticky;top:0;background:var(--surface);z-index:2;
    font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    color:var(--ink-2);padding:15px 16px;white-space:nowrap;
    border-bottom:1px solid var(--line);
  }
  .th-name{text-align:left;min-width:260px}
  .th-c{text-align:center}
  .th-u{position:relative}
  .th-u::after{
    content:"";position:absolute;left:16px;right:16px;bottom:-1px;height:2px;
    background:var(--u);border-radius:2px;opacity:.85;
  }
  .th-warn{color:var(--neg)}
  .th-vs{text-align:center;width:108px;color:var(--muted)}

  tbody tr{transition:background .14s ease}
  .row-lead td{border-top:1px solid var(--line-2)}
  tbody tr:first-child td{border-top:none}
  tbody tr:hover{background:var(--surface-2)}

  .td-name{padding:14px 16px;vertical-align:middle}
  .pname{display:inline-flex;align-items:center;gap:9px;flex-wrap:wrap;
    font-size:15px;font-weight:600;color:var(--ink)}
  .pnote{display:block;font-size:12px;color:var(--muted);margin-top:4px;line-height:1.45}
  .excl{
    font-size:10px;font-weight:700;letter-spacing:.03em;color:var(--brand-deep);
    background:var(--brand-tint);border:1px solid rgba(18,165,188,.28);
    padding:2px 8px;border-radius:5px;text-transform:uppercase;
  }

  .cell{padding:14px 16px;text-align:center;vertical-align:middle}
  .la-col{background:var(--brand-tint)}
  tbody tr:hover .la-col{background:rgba(18,165,188,.11)}

  .sz{display:inline-block;font-size:12px;font-weight:600;color:var(--ink-2);
    background:var(--surface-2);border:1px solid var(--line);
    padding:4px 11px;border-radius:6px;white-space:nowrap}
  .price-la{font-size:17px;font-weight:800;color:var(--brand-deep);letter-spacing:-.01em}
  .price{font-size:14.5px;font-weight:600;color:var(--ink-2)}
  .price.approx{color:var(--muted);font-weight:500}
  .ppm{font-size:13.5px;font-weight:700;color:#0E7C8C}
  .dash{color:#B6C6CA;font-size:14px}

  .bdg{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.01em;
    padding:4px 10px;border-radius:7px;white-space:nowrap}
  .bdg-pos{color:var(--pos);background:var(--pos-bg)}
  .bdg-neg{color:var(--neg);background:var(--neg-bg)}
  .bdg-eq{color:var(--muted);background:var(--surface-2);border:1px solid var(--line)}

  .coverage{font-size:12.5px;color:var(--muted);padding:15px 28px;
    border-top:1px solid var(--line-2);background:var(--surface-2)}

  /* ── VALUE SUMMARY ── */
  .summary{margin-top:30px}
  .sum-head{display:flex;align-items:baseline;gap:14px;margin-bottom:16px;flex-wrap:wrap}
  .sum-head h3{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.05em;
    color:var(--navy);font-weight:400}
  .sum-head span{font-size:13px;color:var(--muted)}
  .sum-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  .metric{background:var(--surface);border:1px solid var(--line);border-radius:14px;
    padding:22px 22px 20px;
    transition:transform .18s cubic-bezier(.22,1,.36,1),box-shadow .18s ease,border-color .18s ease}
  .metric:hover{transform:translateY(-3px);border-color:rgba(18,165,188,.4);
    box-shadow:0 18px 32px -22px rgba(9,82,94,.55)}
  .metric-v{font-family:'Bebas Neue',sans-serif;font-size:46px;line-height:.92;
    color:var(--brand-deep);letter-spacing:.01em}
  .metric-u{font-size:20px;color:var(--brand);margin-left:2px}
  .metric-l{font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
    color:var(--ink-2);margin:13px 0 8px}
  .metric-d{font-size:13.5px;line-height:1.55;color:var(--muted)}

  /* ── SOURCES / FOOTNOTES ── */
  .notes{margin-top:28px;padding-top:22px;border-top:1px solid var(--line)}
  .src-head{font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    color:var(--ink-2);margin-bottom:10px}
  .src-list{list-style:none;display:grid;gap:6px;max-width:96ch}
  .src-list li{font-size:12.5px;line-height:1.6;color:var(--muted)}
  .src-list b{color:var(--ink-2);font-weight:700}
  .legend-key{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:16px;align-items:center}
  .legend-key span{font-size:12px;color:var(--muted)}
  .legend-key b{color:var(--ink-2);font-weight:700}
  .k-approx,.k-excl{color:var(--brand-deep)}
  .legend-key .bdg{font-size:10px}
  .ruo{font-style:italic}

  /* ── RESPONSIVE ── */
  @media(max-width:1100px){.hdr-inner,.tabs,.body{padding-left:28px;padding-right:28px}}
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
