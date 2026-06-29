# 🏛️ Pacific Dataviz Challenge — Final Jury Technical Audit

**Date:** June 29, 2026
**Review Scope:** Final inspection of the updated React/D3 implementation, Data Mapping, and Editorial constraints.

> **⚠️ VERDICT:** While the data integrity UI (Regional Fallback logic) is a strong improvement, the codebase still suffers from significant hardcoding, memory leaks, accessibility oversights, and editorial overclaims. **These must be fixed before final submission.**

---

## 1. Data Integrity & Hardcoding Failures
* **`CarbonLedgerChart.tsx`**: You completely hardcoded the `99.97%` vs `0.03%` figures. This fails the core requirement of data-driven mapping and should be dynamically loaded.
* **`PacificGlobe.tsx`**: All 14 Pacific nations, coordinates, severity levels, and impact descriptions are hardcoded in a `pictNations` array inside the component instead of a distinct dataset.
* **`SeaLevelChart.tsx`**: Critical thresholds (80mm) and historical comparisons (`1993 Level: -19.0 mm`, `2023 Level: +104.8 mm`) are hardcoded. If a user filters by Fiji, these hardcoded global/regional numbers remain on-screen, entirely contradicting the localized dataset!
* **`RainfallAnomalyChart.tsx`**: You are manually injecting `{ event: 'Cyclone Pam' }` into the year 2015 payload during component initialization rather than keeping event metadata strictly in the source JSON.
* **`TemperatureChart.tsx`**: `extremeYears = [1998, 2016]` are hardcoded into the render logic. These may not be the peak bleaching years for every individual filtered island nation.

## 2. React / D3 Architecture & Performance
* **Severe Canvas Memory Leaks (`RainfallAnomalyChart.tsx`)**: The canvas particle system uses `requestAnimationFrame` continuously. You do not pause it when the chart scrolls out of view, draining mobile batteries and throttling CPU performance.
* **Inefficient Animation Loops (`PacificGlobe.tsx`)**: You check `if (!isVisibleRef.current)` but then still call `animationId = requestAnimationFrame(render)`. You are running thousands of empty loops instead of cleanly disconnecting and resuming via the IntersectionObserver.
* **Global GSAP Selectors (`CarbonLedgerChart.tsx`)**: Using `gsap.to('.global-bar', ...)` queries the global DOM. This is extremely brittle in React. You must use `gsap.context()` for scoped component animation and cleanup.
* **DOM Pollution (`SeaLevelChart`, `RainfallAnomalyChart`, `TemperatureChart`)**: You attach variables directly to DOM nodes: `(svg.node() as any).__scales = { ... }`. This is a severe anti-pattern in React. You must use `useRef` to store mutable D3 state.

## 3. UI/UX & Accessibility Limitations
* **Tooltip Overflow (`PacificGlobe.tsx` & `TaxChart.tsx`)**: Tooltips are absolutely positioned based on mouse coordinates with zero boundary detection. If hovered near the right edge of the screen, the tooltip clips completely out of the viewport.
* **Keyboard Inaccessibility (`SynthesisExplorer.tsx`)**: Data points rely entirely on `onMouseEnter` and `onClick`. Without `tabIndex`, `onFocus`, or `onKeyDown`, screen readers and keyboard-only users are entirely locked out of exploring the data.
* **Performative Accessibility (`TemperatureChart.tsx`)**: You added a "colorblind-safe shape differentiator" (diamonds for negative anomalies), but it has `pointer-events: none` and isn't represented in any legend. A visually impaired user will have no idea what the shapes signify.

## 4. Editorial Consistency & Storytelling
* **Direct Contradiction (`Act5_FoodSecurity.tsx` vs `CropYieldChart.tsx`)**: The narrative text correctly notes that "agricultural yields are not completely collapsing... they are stagnating". Yet, the chart's glowing red banner dramatically screams: "Taro roots rot completely, collapsing food security." The chart is making a sensationalized overclaim.
* **Editorialized UI (`TaxChart.tsx`)**: The physics balance scale flashes "DRAINING FUNDS // INJUSTICE". While the economic disparity is real, embedding "// INJUSTICE" as an axis label/UI overlay crosses the line from objective data journalism into subjective editorializing. Let the data speak for itself.
* **Static Narratives for Dynamic Data (`SynthesisExplorer.tsx`)**: The preset text heavily dramatizes links (e.g., "The fundamental link..."). When a user switches to a specific country where the local statistical correlation (R-value) might be entirely different, the narrative doesn't adapt, misleading the user.
