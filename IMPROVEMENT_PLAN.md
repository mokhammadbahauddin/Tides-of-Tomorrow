# 🛠️ Pacific Dataviz 2026 — Improvement Plan

Based on the jury review and our locked-in decisions, this document outlines the exact implementation plan for the final submission.

---

## 📋 Action Items & Task Assignments

### 1. 📊 Q1: Real Country-Specific Data Pipeline
* **Status**: Critical (Fabricated multipliers must be replaced with real station-level/country-specific datasets).
* **Target Files**:
  * `public/data/temperature.json`
  * `public/data/sealevel.json`
  * `public/data/rainfall.json`
  * `public/data/cropyield.json`
  * `public/data/taxes.json`
  * Chart files: TemperatureChart.tsx, SeaLevelChart.tsx, RainfallAnomalyChart.tsx, CropYieldChart.tsx, TaxChart.tsx.
* **Action**:
  * Extract/generate authentic, station-level data for the 22 PICTs from raw records or actual climatology profiles.
  * Remove the fabricated scale multiplier mappings (COUNTRY_CONFIG / MULTIPLIERS) inside the chart components and adapt the data loading logic to read the genuine country-specific JSON keys.

---

### 2. 📹 Q2: Video Compression & Lazy Loading
* **Status**: Critical (Reduce 75.3MB payload to exclude network loading bottlenecks in the Pacific).
* **Target Files**:
  * src/components/sections/VideoDivider.tsx
  * src/pages/Home.tsx
* **Action**:
  * Compress MP4 videos to low-bitrate WebM/VP9 at 720p, targeting < 2MB per clip.
  * Ensure poster images act as instant, high-quality, CSS-visible visual placeholders.
  * Set preload="none" and lazy-load videos only when they intersect the viewport.

---

### 3. ♿ Q3: WCAG 2.1 AA Accessibility Pass
* **Status**: Critical (Add screen reader and keyboard support project-wide).
* **Target Files**: All Acts, Navigation, Minimap, CTA, and Charts.
* **Action**:
  * Add semantic HTML wrappers (section, article, header, blockquote).
  * Add appropriate aria-label, aria-expanded, aria-haspopup, role="listbox", and role="region" attributes.
  * Map full keyboard navigation (focus traps, escape hooks, arrow controls) for the custom country dropdown in the Navigation header and the Call-to-Action slide controls.
  * Wrap all animations in `@media (prefers-reduced-motion: no-preference)` checks or respect the system flag inside GSAP.

---

### 4. 🛡️ Q4: Chart Error Handling
* **Status**: High (Prevent charts from hanging in loading states indefinitely if a fetch fails).
* **Target Files**: All charts (Temperature, SeaLevel, Rainfall, CropYield, Tax, CarbonLedger, Globe).
* **Action**:
  * Attach .catch() blocks to all d3.json()/fetch() operations.
  * Add a React hasError state and render a clean, user-friendly fallback overlay: "Data temporarily unavailable — please refresh or try again" matching the design style.

---

### 5. 🎨 Q6: Colorblind-Safe Visual Differentiators
* **Status**: Medium (Enable the 8% of male users with color vision deficiency to read graphs).
* **Target Files**: All line and bar chart SVGs.
* **Action**:
  * Implement distinct stroke patterns (dashed, dotted, solid) to differentiate line data.
  * Use varied marker shapes (circles, squares, diamonds, triangles) on scatter plots and key data junctions.
  * Apply subtle SVG pattern fills (stripes, hatchings) on bar charts instead of relying solely on solid color gradients.

---

### 6. 🧹 Q7: Call-to-Action Refactoring & Clean Up
* **Status**: Medium (Reduce CTA bloat, separate concerns, fix non-blank link).
* **Target Files**:
  * src/components/sections/CallToAction.tsx
* **Action**:
  * Move sub-components Gauge and MiniChart to their own files in /components/charts/ or /components/sections/cta/.
  * Move hardcoded countryData and datasets to a separate configuration module.
  * Move the inline keyframe style blocks into src/index.css.
  * Fix the Port Vila fossil fuel treaty external link to use target="_blank" so it doesn't navigate users away from the experience.

---

### 7. 🏷️ Q8: Dynamic Act Citations
* **Status**: Medium (Keep data annotations factually correct when a country is selected).
* **Target Files**: Acts 2–6 section containers.
* **Action**:
  * Create a country-to-station mapping configuration object.
  * Replace the static location strings with dynamic, state-aware readouts based on the selectedCountry prop.

---

## 🚀 Execution Strategy

To execute this plan quickly and safely:
1. **Developer Subagent 1 (Data & Citations)**: Implements dynamic citations, chart error handling, and builds/updates real per-country JSON files.
2. **Developer Subagent 2 (Accessibility & Colorblind Differentiators)**: Adds ARIA landmarks, keyboard nav, prefers-reduced-motion checks, and line/bar shape patterns.
3. **Developer Subagent 3 (CTA & Performance cleanup)**: Splitting CallToAction, shifting inline CSS, setting up lazy WebM video overrides.
