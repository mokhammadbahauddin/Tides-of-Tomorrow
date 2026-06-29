# 🏛️ Pacific Dataviz Challenge — Official Jury Review

## **"Tides of Tomorrow: Climate Change in the Pacific"**
**Entry by:** Mokhammad Bahauddin (NIM: 103102400080)  
**Category:** Interactive  
**URL:** https://tidesoftomorrowclimatechange.vercel.app/  
**Review Date:** 29 June 2026  
**Review Scope:** Complete source code audit — 8 chart components, 13 section/narrative files, 6 data files, app architecture

---

> **⚠️ CAUTION:** This is a **brutally honest** jury-level review. Every file in the project was read and analyzed by three independent reviewers covering: (1) Chart/Code Quality, (2) Narrative/Storytelling, and (3) Data Integrity/Scientific Credibility.

---

## I. EXECUTIVE SUMMARY

| Dimension | Score | Verdict |
|-----------|-------|---------|
| **Visual Design & Aesthetics** | 9.0/10 | Exceptional. Competition-tier editorial design. |
| **Data Storytelling & Narrative** | 7.5/10 | Strong arc, but scientific overclaims and unverifiable quotes. |
| **Technical Implementation** | 7.0/10 | Ambitious but inconsistent. Accessibility is poor. |
| **Data Integrity & Scientific Credibility** | 4.5/10 | 🔴 **Critical weakness.** 3 of 5 datasets have serious integrity issues. |
| **Interactivity & UX** | 8.0/10 | Excellent scroll-driven experience with innovative CTA simulator. |
| **OVERALL** | **7.0/10** | A visually stunning entry undermined by data credibility gaps. |

---

## II. WHAT THE JURY LOVED ✅

### 1. Visual Design is World-Class
The "Bioluminescent Data × Elegant Editorial" aesthetic is consistently executed across all 8 chart components. Specific standouts:

- **Pacific Globe** (PacificGlobe.tsx): The atoll marker design — lagoon fill → dashed reef ring → islet motu dots → breathing pulse aura — is the single best visual detail in the codebase. The DPR-aware canvas rendering is professional.
- **Balance Scale** (TaxChart.tsx): A physics-based D3 force simulation where volcanic rock boulders stack on a tilting scale. This is the most unconventional and creative chart in the competition.
- **Soil Cross-Section** (CropYieldChart.tsx): The animated SVG illustration showing taro root rot under saltwater intrusion is exceptional editorial design.
- **Color Palette**: Terracotta (#B44D36), Reef Teal (#2B7A78), Golden Hour (#D4A574), Shell White (#E8DCC8), Ocean Ink (#0B1A2E) — used consistently across all charts with `paint-order: stroke` halos for text contrast.

### 2. Narrative Arc is Well-Constructed
The 7-act structure creates a clear causal cascade:

```
Prologue → Temperature → Sea Level → Storms → Food → Tax → Synthesis → CTA
```

This builds emotional momentum effectively. The first-person Pacific Islander voice ("our ocean," "we didn't build the factories") is a bold rhetorical choice that transforms data journalism into testimony.

### 3. Data-Story Integration in Acts 2-3 is Gold Standard
The narrative text literally walks the reader through the visualization:
- *"Look at the chart on the right"*
- *"Watch the chart zoom in"*
- *"Look at the highlighted circles"*

This is what the best scrollytelling does — the text and the viz are inseparable.

### 4. The Climate Tax Angle (Act 6) is Original
Most Pacific climate stories stop at environmental impacts. Connecting to economic injustice via OECD tax data is novel:
> *"We are taxing our own people just to afford the concrete needed to keep the ocean out."*

This is the single best sentence in the entire piece.

### 5. The CTA Simulator is Innovative
The "Inaction → Net Zero" slider with dynamically updating gauges (SST Anomaly 2050, Sea Level Rise 2050) and the "Climate Debt Invoice" card make abstract policy feel tangible.

### 6. Colorblind-Safe Design
- Temperature: Diamond markers for negative anomalies (shape differentiation)
- Rainfall: Diagonal stripes vs crosshatch patterns
- Crop Yield: 4 distinct fill patterns per crop

---

## III. CRITICAL ISSUES 🔴

### ISSUE #1: Data Integrity — 3 of 5 Datasets Have Serious Problems

This is the **single biggest risk** to this entry's credibility.

#### Sea Level Data — 🔴 FABRICATED
- Individual country values snap to exact multiples of 100 (-200, -100, 0, 100, 200). **This is categorically NOT how sea level data works.**
- Real sea level is continuous measurements in mm. NOAA/NASA PO.DAAC provides values like 3.2mm/yr trends.
- In 2017: ALL 21 countries have the value 100.0 simultaneously. In 2020: ALL 21 countries are 100.0. This synchrony is scientifically impossible.
- The regional average (e.g., -19.05) is simply the arithmetic mean of the binary bins divided by 21.
- PCN (Pitcairn) equals the regional average for every single year — a copy.

#### Tax Data — 🔴 FABRICATED
- 2000–2004: ALL 22 territories have IDENTICAL values (0.03, 0.03, 0.02, 0.03, 0.03).
- From 2005 onward: Only FJI, WSM, SLB, PNG, and NRU show differentiated values. The other **17 territories are exact copies of the regional average** for every year.
- Example 2018: FJI=1.3, SLB=6.2, PNG=0.03, all others=2.46. Sixteen nations having the exact same tax rate is impossible.
- OECD doesn't have environmental tax data for Tokelau, Pitcairn, Wallis & Futuna, etc.

#### Crop Yield Data — 🔴 Heavily Padded
- In 1961: **11 of 22 territories** have values IDENTICAL to the regional average (taro: 6.59, sweetPotato: 9.67, banana: 5.31, cocoa: 0.45).
- Cocoa yields shown for EVERY Pacific territory. Most Pacific islands do not grow cocoa commercially. Tuvalu, Palau, Marshall Islands growing cocoa at 0.45 t/ha is **fiction**.
- Fiji 2024: cocoa at 2.5 t/ha would make Fiji the highest-yielding cocoa producer in the world (global average is ~0.4-0.5 t/ha).
- ~50% real FAOSTAT data for major nations, ~50% placeholder filler.

#### Temperature Data — ⚠️ Mixed
- The regional trend is plausible (matches HadCRUT/NOAA SST anomaly datasets).
- PCN (Pitcairn) is an **exact copy of the regional average** for every year since 1850.
- Small territories (TKL, WLF, ASM, NRU, MNP) show suspiciously wild swings that look like AI-generated pseudo-random noise around the regional trend.
- Providing per-country SST anomalies going back to 1850 for 21 Pacific territories is not credible — the source data doesn't exist at that resolution before ~1880.

#### Rainfall Data — ✅ Most Credible
- 1979 start date matches GPCP satellite availability.
- ENSO signals check out: 1997–1998 El Niño shows drought in western Pacific (PLW: -25.4, FSM: -39.4) and surplus in central Pacific (KIR: +40.4).
- This dataset appears legitimately derived from real GPCP data.

#### Summary Table

| Dataset | Credibility | Key Red Flag |
|---------|------------|--------------|
| Temperature | ⚠️ Mixed | PCN cloned from regional; pre-1880 implausible |
| Sea Level | 🔴 Fabricated | Binary step-function (0/±100/±200), not real measurements |
| Rainfall | ✅ Credible | ENSO signals verify correctly |
| Crop Yield | 🔴 Heavily Padded | ~50% cloned from regional average; cocoa data is fiction |
| Taxes | 🔴 Fabricated | 17/22 territories are exact copies of regional |

---

### ISSUE #2: Unsourced Financial Claims in CTA

The **"Climate Debt Invoice"** card makes massive financial claims with **NO methodology citation**:

| Country | Claimed Debt |
|---------|-------------|
| 🇺🇸 USA | $2,500 Billion |
| 🇨🇳 China | $1,400 Billion |
| 🇪🇺 EU | $1,700 Billion |
| 🇷🇺 Russia | $680 Billion |
| 🇬🇧 UK | $460 Billion |
| 🇯🇵 Japan | $400 Billion |

Where do these numbers come from? There is no paper, no formula, no source. The label says "Estimated loss & damage compensation owed to the 22 Pacific Island Nations" but the methodology is absent.

A jury would hammer this. These are extraordinary claims that require extraordinary evidence.

---

### ISSUE #3: Fabricated Projection Formulas

The CTA "what-if" slider uses hand-waved linear interpolations presented as meaningful projections:

```typescript
calcTemp2050(pledge) = 2.6 - 1.55 * (pledge / 100)
calcSea2050(pledge)  = 290 - 150 * (pledge / 100)
```

- At 0% pledge → 2.6°C warming, at 100% → 1.05°C
- These don't correspond to ANY specific IPCC scenario pathway
- They should be disclosed as "illustrative simplifications" rather than presented as scientific outputs

---

### ISSUE #4: Unverifiable Personal Quotes

Three acts use emotionally powerful quotes attributed to unnamed individuals:

| Act | Quote Source |
|-----|------------|
| Act 2 | "Local fisherman, Viti Levu, Fiji" |
| Act 3 | "Community Leader, Funafuti, Tuvalu" |
| Act 5 | "Farmer, Malaita Province, Solomon Islands" |

If these are real interviews, they need better citations (name, date, publication). If they are composite/fabricated for illustration, **that must be disclosed**. A competition jury will scrutinize this.

---

### ISSUE #5: Accessibility is Terrible

Only **2 of 8 charts** have any ARIA markup:

| Chart | role="img" | title | desc | Keyboard | Screen Reader |
|-------|:---:|:---:|:---:|:---:|:---:|
| Temperature | ✅ | ✅ | ✅ | ❌ | Partial |
| SeaLevel | ✅ | ✅ | ✅ | ❌ | Partial |
| Rainfall | ❌ | ❌ | ❌ | ❌ | ❌ |
| CropYield | ❌ | ❌ | ❌ | ❌ | ❌ |
| TaxChart | ❌ | ❌ | ❌ | ❌ | ❌ |
| CarbonLedger | ❌ | ❌ | ❌ | ❌ | ❌ |
| Synthesis | ❌ | ❌ | ❌ | ✅ (buttons) | Partial |
| Globe | ❌ | ❌ | ❌ | ❌ | ❌ |

The Canvas-based charts (Globe, Rainfall particles) are completely inaccessible. The physics simulation (TaxChart) is impossible to understand via screen reader. For a project about Pacific Island communities — many of whom face infrastructure challenges — this is ironic.

---

## IV. MODERATE ISSUES ⚠️

### Scientific Overclaims

| Claim | Problem | Fix |
|-------|---------|-----|
| *"extreme precipitation anomalies perfectly correlate with devastating landfalls"* | "Perfectly correlate" is a strong scientific claim. Annual anomalies ≠ cyclone-track data. | Change to "correspond closely with" |
| *"billions of joules of excess heat"* | Wrong by ~12 orders of magnitude. Ocean heat content is measured in zettajoules (10²¹ J). | Use "zettajoules" or remove |
| *"King Tides penetrate hundreds of meters further inland"* | Depends heavily on topography. True for flat atolls, misleading for volcanic islands. | Qualify with "on low-lying atolls" |
| *"+1.2°C threshold"* | This is the GLOBAL temp anomaly (Paris target), not Pacific-specific SST anomaly. | Say "approaching the global threshold" |
| *"4.5mm/yr in the tropical Pacific"* | On the high end. Defensible for western tropical Pacific but should specify sub-region. | Add "western" qualifier |

### Technical Debt

1. **DOM monkey-patching**: `(svg.node() as any).__scales` pattern used in 3+ charts. Fragile, un-React, untestable.
2. **SVG ID collisions**: No namespace isolation. Gradient IDs like `flood-clip`, `taro-grad` are global. Multiple chart instances on one page would break.
3. **Mixed animation paradigms**: D3 transitions, GSAP, CSS transitions, and Canvas `requestAnimationFrame` all coexist. Debugging animation conflicts is nightmarish.
4. **Pervasive `as any` casts**: Defeats the purpose of TypeScript throughout all data mapping code.
5. **Hardcoded annotation values**: SeaLevel chart hardcodes `y1993 = yScale(-19.05)` and `y2023 = yScale(104.76)` — if data changes, annotations silently break.
6. **Tooltip inconsistency**: 4 different tooltip implementations across 8 charts (shared component, inline JSX, D3-injected div, React div).

### Narrative Issues

1. **Quote fatigue**: The glass-card quote format appears 4 times with identical visual treatment. By Act 5, it feels formulaic.
2. **Voice break in Act 7**: Shifts from immersive first-person storytelling to instructional second-person ("Use the tool below"). Jarring transition.
3. **Act 4 repetition**: Steps 1 and 2 repeat the exact same cyclone names (Pam, Winston, Harold) and nearly the same bold text. Copy-paste artifact.
4. **narrative.ts partially orphaned**: Some content differs from what's inline in components, creating a dual-source-of-truth problem.

---

## V. WHAT A WINNING ENTRY WOULD FIX

### Priority 1: Data Credibility (would change score from 4.5 → 8.0)
1. Replace the sea level binary step-function data with real NASA PO.DAAC satellite altimetry data (available freely as NetCDF/CSV).
2. Remove territories without real FAOSTAT/OECD data instead of padding with regional averages. Showing 8 real countries honestly is better than showing 22 with fabricated data.
3. Add a transparent "Data Methodology" section explaining how each dataset was processed, filtered, and any limitations.
4. Disclose that PCN, TKL, WLF, ASM, etc. use regional averages as proxies (if that's the approach).

### Priority 2: Source Your Claims (would change score from 7.5 → 9.0)
1. Add a methodology citation for the Climate Debt Invoice numbers (e.g., based on cumulative historical emissions × estimated loss & damage per tonne CO₂).
2. Add a disclaimer on the CTA projection formulas: "Simplified illustration based on IPCC AR6 scenario ranges."
3. Either source the personal quotes properly (name, date, outlet) or disclose them as "representative composite voices."

### Priority 3: Accessibility (would change score from 7.0 → 8.5)
1. Add `role="img"`, `<title>`, and `<desc>` to ALL SVG charts.
2. Add `aria-hidden="true"` to decorative canvas elements.
3. Add `aria-live` regions for dynamic tooltip content.
4. Add a text summary fallback for the Canvas globe.

---

## VI. CHART-BY-CHART SCORES

| Chart | Creativity | Technical | Visual | Data Integrity | Score |
|-------|:---:|:---:|:---:|:---:|:---:|
| Pacific Globe | ★★★★★ | ★★★★☆ | ★★★★★ | N/A (TopoJSON) | **9.0** |
| Temperature | ★★★★☆ | ★★★★☆ | ★★★★★ | ⚠️ Mixed | **8.0** |
| Sea Level | ★★★★☆ | ★★★☆☆ | ★★★★☆ | 🔴 Fabricated | **5.5** |
| Rainfall | ★★★★★ | ★★★★☆ | ★★★★★ | ✅ Credible | **9.0** |
| Crop Yield | ★★★★★ | ★★★☆☆ | ★★★★★ | 🔴 Padded | **7.0** |
| Tax/Balance | ★★★★★ | ★★★☆☆ | ★★★★★ | 🔴 Fabricated | **6.5** |
| Carbon Ledger | ★★★☆☆ | ★★☆☆☆ | ★★★☆☆ | Hardcoded | **5.0** |
| Synthesis | ★★★★★ | ★★★★★ | ★★★★★ | Derived | **9.5** |

---

## VII. FINAL JURY VERDICT

> **"Tides of Tomorrow" is one of the most visually ambitious and emotionally compelling entries we've reviewed. The 7-act narrative structure, the physics-based balance scale, the soil cross-section animation, and the interactive CTA simulator demonstrate genuine innovation in data storytelling.**
>
> **However, the entry is critically undermined by data integrity issues. Three of five datasets show clear signs of fabrication or heavy padding — identical values across 17+ territories, binary step-functions masquerading as continuous measurements, and cocoa yield data for coral atolls that don't grow cocoa. The unsourced $2,500B "Climate Debt Invoice" is an extraordinary claim presented without methodology.**
>
> **The tragedy is that the storytelling framework is strong enough to carry honest, limited data. Showing 8 real countries with verified FAOSTAT/OECD data would be more powerful than showing 22 countries with fabricated padding. Scientific credibility IS the story — and this entry risks contradicting its own message about data-driven truth.**
>
> **Fix the data integrity, source the financial claims, and this becomes a top-tier competition entry. As submitted, it's a beautiful shell around a fragile foundation.**

---

*Review compiled from three independent analyses covering all source files in the repository.*  
*Reviewers: Chart/Code Technical Reviewer, Narrative/Storytelling Reviewer, Data Integrity/Scientific Credibility Reviewer*  
*Total files reviewed: 27 source files, ~350KB of code*
