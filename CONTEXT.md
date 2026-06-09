# Glossary

## Core Architecture
- **Story Backbone**: The sequence of narrative sections dictating the user's scrolling journey. Derived from the DataViz 2026 project.
- **Visual Layer**: The immersive 3D background (IslandScene) and interactive data charts. Derived from the Strategy project, embedded within the Story Backbone.

## Narrative Section Map (The Five-Act Architecture)
The application flows through a strict five-act scrollytelling journey, integrating exactly five datasets:
1. **Act I: The Pristine Facade and the Carbon Ledger** (Prolog): Narrative only, no heavy data charts. Focuses on the minimal carbon footprint of Pacific nations.
2. **Act II: The Thermal Engine** (Ocean Warming & Bleaching): Uses Dataset 1 (`Mean sea surface temperature anomalies`).
3. **Act III: The Encroaching Waters** (The Loss of Sovereignty): Uses Dataset 2 (`Sea level anomalies`).
4. **Act IV: The Atmospheric Fracture** (Droughts and Deluges): Uses Dataset 3 (`Rainfall anomalies`).
5. **Act V: The Human Toll - Food Security**: Uses Dataset 4 (`Crop yield - disaggregated`).
6. **Act VI: The Unpaid Debt**: Uses Dataset 5 (`Environmental taxes`).
7. **Act VII: Interactive Synthesis Explorer**: A dedicated interactive tool that overlays any two official datasets into a **Scatterplot** (removing time from the primary axes and plotting Metric A vs Metric B). This explicitly illustrates direct data correlation with an automatic regression line, avoiding the false-correlation risks of dual Y-axis line charts. A timeline brush remains at the bottom to filter the years shown.

## Official Datasets & The Scope
- **22 Nations at Risk**: Refers to the 22 Pacific Island Countries and Territories (PICTs) officially recognized by the Pacific Community (SPC), which form the scope of the interactive sections.
- **The Five-Dataset Model**: A strict data architecture limitation. To prevent cognitive overload, the application uses exactly five official datasets from the Pacific Data Hub (PDH.Stat), mapping directly to the Acts above to demonstrate a chain of causality.
- **Academic Citation Strategy**: The application uses a strict **Footnotes System**. Specific claims in the narrative are marked with superscript numbers (e.g., ¹, ²), which reference a formal, rigorous "Daftar Pustaka / References" section in the application's Footer. Inline hyperlinks are banned to preserve the cinematic aesthetic.
- All D3 charts explicitly credit their respective official data sources (e.g., Pacific Data Hub, WMO, IPCC AR6) using inline `Source: [Official Source]` labels below each chart in the UI.

## Glossary
- **Climate Debt / Carbon Debt**: The tragic irony and financial obligation where major global polluters owe vulnerable nations (like Pacific Islands). Calculated by comparing the vulnerable nation's tiny historical carbon emissions against their massive estimated adaptation costs (environmental taxes).

## Technical Implementation
- **Component Naming Convention**: To enforce the strict narrative architecture, all major narrative section components must be named exactly after their corresponding Act (e.g., `Act1_CarbonLedger.tsx`, `Act2_ThermalEngine.tsx`). Generic names (like `WarmingWaters.tsx`) are deprecated to prevent structural drift.
- **Scroll State Management**: A hybrid approach. A global `scrollProgress` (0 to 1) drives the 3D IslandScene camera timeline for smooth, continuous background motion. Simultaneously, the DataViz "snap-to-section" logic is retained so the user lands perfectly on each narrative chapter.
- **Styling & Design Language**: The application adopts the **Strategy** project's dark cinematic theme (e.g., `--ocean-abyss`, `--teal`) as the primary palette. However, for the D3.js charts, we strictly use **Academic Color Scales (e.g., Viridis, Inferno, Magma)**. This hybrid approach ensures the cinematic feel is maintained in the UI, while the data visualisations retain maximum scientific precision and readability.
- **Branding & Attribution**: The primary application title is "Tides of Tomorrow". All references to "Pacific Dataviz Challenge 2026" are strictly removed from the Hero and introductory sections to maintain immersion. However, the attribution is deliberately preserved in the final Call To Action / Footer section as a credit to the project's origin.
- **Execution Strategy**: Systematic selective porting. The application is built fresh in the current `app` directory. Components, hooks, and data files are manually ported one-by-one from the source folders to carefully resolve styling and dependency conflicts.
- **Scroll-Driven Data State**: Narrative text is broken into distinct "Trigger Blocks". As these blocks enter the viewport, GSAP dispatches a state update to the corresponding D3 charts, forcing the charts to automatically zoom, highlight, or annotate the specific data points being discussed in the text.
- **Pinned Scrollytelling Layout**: Narrative sections strictly enforce a split layout. The visual container (charts/maps) uses `position: sticky` or GSAP `pin` to remain locked in the viewport, while the textual Trigger Blocks scroll past in the adjacent column.
- **Reactive Update Loop**: D3 chart components split their logic. The initial structural render runs once. A separate reactive `useEffect` listens for `activeStep` state changes.
- **Animation Motion Strategy (Interrupts)**: To prevent jittery or overlapping animations during fast scrolling, all D3 charts explicitly call `svg.selectAll('*').interrupt()` before dispatching new `.transition()` updates. This ensures snappy responsiveness and guarantees that delayed annotations never fire in the wrong narrative step.
- **Layered Sticky Mobile Layout**: On mobile viewports (`< 768px`), visual containers are pinned as background layers (`z-index: 0`). Textual Trigger Blocks scroll directly over the top of the charts using strong glass-morphism to maintain readability without obscuring chart animations.
- **Mobile Data Interaction (Tap-to-Focus)**: To avoid the "Scroll Trap" (where users get stuck dragging charts on mobile instead of scrolling the page), `touch-action: none` is strictly avoided on chart SVGs. Instead, mobile users interact via native pointer events by tapping on data points. A single tap registers a `pointermove`, displaying the tooltip and hover lines, while native touch dragging is permitted to scroll the page uninterrupted.
- **Responsive Vector Scaling (`viewBox`)**: To avoid jittery layout shifts and dropped frames during window resizes or device rotations, all D3 charts use an internal coordinate system (`viewBox`) combined with CSS `width: 100%; height: auto`. This delegates scaling directly to the browser's GPU rendering engine with zero JavaScript overhead, completely eliminating the need for `ResizeObserver` and structural DOM teardowns.

## Presentation Strategy
- **Prototype Fidelity**: Mid-Fidelity Wireframe. The `index.html` prototype used for the initial "Responsi" explicitly hides advanced code (React, GSAP, Three.js) and presents the narrative structure with static placeholder charts to prove conceptual maturity without looking "AI-generated".
- **Category Rationale (Interactive vs Static)**: The interactive (scrollytelling) format is chosen specifically to demonstrate *causality*. Static posters cannot effectively convey a chain reaction. The interactive format forces the user to experience the sequence of events (Warming -> Floods -> Crop Failure). Secondly, the interactive Synthesis Explorer allows users to build personal empathy by exploring the correlations themselves.
- **Dataset Selection Rationale**: The 5 specific datasets were chosen for two reasons. Technically, they share clean, synchronous time-series constraints from PDH.Stat, making them perfect for synthesis. Narratively, they form a complete "Chain of Destruction": 3 ecological causes (Temp, Sea, Rain) triggering 2 grounded human impacts (Food/Crops, Financial/Taxes).
- **Title & Storyline Philosophy**: The title "Tides of Tomorrow" operates through the lens of *Climate Injustice*. It serves as a stark warning rather than a hopeful promise. The storyline explicitly highlights the tragic irony: Pacific nations produce negligible emissions yet pay the ultimate price—losing their land, crops, and economy to pay an environmental debt incurred by industrialized global superpowers.
