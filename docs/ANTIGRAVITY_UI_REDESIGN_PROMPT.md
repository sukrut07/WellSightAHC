# WellSight AI — Antigravity UI-Only Redesign Prompt

> Scope: frontend and visual experience only. Do not change database, backend, API contracts, business rules, ingestion, or AI orchestration.

## Mission

Redesign the existing WellSight AI frontend into a simpler, polished, approachable asset-intelligence product. Add a public-facing landing page, restrained 3D hero treatment, smooth scroll/parallax transitions, and a clearer operational dashboard. Preserve and reuse existing working functionality. Do not replace real data or wired controls with decorative mockups.

Reference UI principles from the supplied screenshots:
- The current WellSight AI UI: dark navy foundation, emerald accents, fixed left navigation, overview KPI cards, chart cards, right-side question suggestions, copilot chat, well directory, analytics, evidence, corrections and audit pages.
- The design references supplied by the user: clean logistics/industrial dashboards, editorial typography, strong whitespace, restrained modular cards, data-rich tables, clear hierarchy, high-contrast charting, precise motion and purposeful imagery.
- Inspiration links: https://www.openui.com/ , https://ui.watermelon.sh/installation , https://motion.dev/ , https://dribbble.com/shots/27816313-Logistics-and-Shipping-Website
Use these as inspiration only. Do not copy protected designs or assets verbatim.

## Absolute restrictions

1. UI/UX/front-end scope only. Do not edit or create backend services, database schemas, migrations, SQL, ingestion pipelines, server business rules, AI prompts/orchestration, API route implementations, authentication logic, or data persistence logic.
2. Before changing anything, inspect the repository and identify the actual frontend framework, routes, design system, component structure, package manager, existing APIs and current git status.
3. Treat existing API interfaces and data models as immutable contracts. Frontend adapters may map existing responses into presentation components, but must not change the contracts.
4. Do not delete working functionality to make the design easier. Do not introduce fake KPI values, fabricated wells, fake compliance rates, simulated AI answers, or false “connected”/“live” statuses. Use real existing frontend data. If data is unavailable, show an honest empty/loading/error state, clearly labelled demo fixture, or “not available.”
5. Do not overwrite unrelated work. Start by creating a dedicated branch named `ui/landing-motion-dashboard` from the current working branch, after checking for uncommitted changes. Preserve user changes.
6. Do not push automatically to the default branch. Complete local implementation, run available checks, inspect the diff, then push the feature branch and open a pull request if the GitHub CLI/authentication allows it. If those actions are unavailable, provide exact commands for the developer to execute.
7. Do not claim tests or builds passed unless you ran them and observed success.
8. Keep dependencies minimal. Inspect before installing. Reuse what is already present. Use accessible progressive enhancement and support `prefers-reduced-motion`.
9. Do not use arbitrary generated JSX or dynamic code execution. UI components must remain typed and maintainable.
10. Keep the product name “WellSight AI” and product purpose aligned with the Hacktoberfest Asset Intelligence Copilot challenge.

## Product narrative

Brand: **WellSight AI**
Descriptor: **Asset Intelligence Copilot**
Tagline: **Every well has a story. Ask the data.**

Explain the product in plain English: “Ask questions about well inspections, downtime, repairs and spill procedures. WellSight AI brings the relevant records together, explains what the evidence shows, and presents results as charts or tables.”

Do not use dense technical terms in the landing hero. Keep advanced concepts such as RAG and agent orchestration in a short “How it works” section.

## Visual system

Use a dark industrial-operations theme inspired by the existing UI:
- Main background: deep ink/navy, e.g. #070D19 / #0B1220.
- Elevated surfaces: #0F192B / #111C2E.
- Subtle borders: slate blue-gray with low contrast.
- Main accent: emerald/teal, e.g. #00D4A1 or existing project token.
- Supporting accents: sky blue for data, amber for caution, rose/red for high-severity alerts.
- Text: off-white for primary, muted slate for supporting text.
- Reserve bright alert colors for meaningful states; do not color every card differently.
- Use a consistent spacing scale, restrained radii and subtle shadows.
- Use readable sans-serif typography; monospaced type only for IDs, timestamps and technical evidence.
- Avoid excessive gradients, glassmorphism, neon glows, huge borders, cramped content, excessive cards, decorative charts and oversized labels.
- Use CSS variables/tokens for colors and spacing where compatible with the existing project.
- Provide accessible focus-visible rings, semantic headings, keyboard navigation, and responsive contrast.

## Information architecture

Create a public landing page separate from the logged-in/operational application.

Suggested routes (map to the framework that is actually present):
- `/`: public landing page.
- `/app` or the existing overview route: operations dashboard.
- Existing copilot, well directory, analytics, evidence, corrections/audit, conflict log and settings routes must remain functional and retain existing API integration.

Do not break direct links, existing navigation state, or route-specific data fetching. If changing the root route conflicts with existing routing, preserve the current app route and introduce the landing page at a safe route, then document the chosen mapping.

### Landing page layout

1. **Minimal navigation**
   - WellSight AI wordmark and simple icon.
   - Links: Product, How it works, Capabilities.
   - Primary CTA: “Open Copilot” or “Launch dashboard.”
   - Mobile menu with keyboard and screen-reader support.
   - Use a quiet translucent/solid navbar; avoid heavy decorative borders.

2. **Hero: plain-language value proposition**
   Eyebrow: “ASSET INTELLIGENCE · HACKTOBERFEST 2026”
   Heading: “Every well has a story.”
   Supporting line: “Ask the data.”
   Supporting paragraph: “Understand downtime, investigate repairs, and surface spill-compliance risks from one evidence-backed AI copilot.”
   Primary CTA: “Explore the dashboard.”
   Secondary CTA: “See how it works.”
   Include one large, carefully designed visual of a stylized oil-field/pumpjack scene or a tasteful 3D industrial asset. This should complement—not compete with—the headline.

3. **Hero 3D treatment**
   - Prefer a lightweight custom Three.js/React Three Fiber scene only if compatible with the existing stack. First check installed packages.
   - Create a minimal stylized pumpjack / industrial wellhead silhouette or abstract orbital asset visualization with subdued lighting, emerald highlights and subtle idle rotation.
   - Use the 3D element as a single focal point, not an interactive game.
   - Keep camera movement gentle, avoid rapid spinning, heavy particle counts, large textures or expensive postprocessing.
   - Lazy-load the 3D bundle. Provide a high-quality CSS/SVG/static fallback while loading, on unsupported devices, and when WebGL fails.
   - Respect `prefers-reduced-motion`, device performance and mobile constraints. Disable pointer-driven parallax on touch devices.
   - Never make the user wait for 3D loading to read or use the page.

4. **Feature summary**
   Use three or four clean editorial sections instead of a wall of cards:
   - Ask in plain English.
   - Trace answers to source records.
   - Understand downtime and operational trends.
   - Preserve corrections and surface conflicts.
   Make every claim match an implemented feature.

5. **Generative UI preview**
   Show one convincing preview made from real existing UI components: a short operator question, an answer snippet, a mini data table or chart, and a source citation row. If the screenshot uses sample presentation values, mark them clearly as illustrative; never imply they are live operational values.

6. **How it works**
   Explain in three steps:
   - Ask a question.
   - WellSight AI finds relevant records and procedures.
   - Get an evidence-backed answer with a suitable chart, table or status card.
   Use a simple horizontal sequence on wide screens and vertical sequence on mobile.

7. **Capabilities / feature sections**
   Explain:
   - Operational analytics
   - Grounded evidence
   - User-specific and shared context
   - Corrections and conflict visibility
   Use concise copy and restrained illustrations. Do not claim capabilities not wired in the app.

8. **Closing CTA and footer**
   Add “Ready to investigate a well?” and a CTA into the existing copilot/dashboard. Footer should be minimal and include the Hacktoberfest/Asset Intelligence Copilot attribution only where appropriate.

### Operational dashboard

Refine the existing overview to be understandable in five seconds. It is an operations tool, not a marketing page.

- Keep a clear page title, “Operations overview,” with a concise one-line explanation.
- Top row: only the most meaningful 3–4 metrics, using values from the existing data layer. Include labels, units, time window, and useful context.
- Do not assume “Monitored Wells,” total downtime, compliance rate, or conflict count exists. Map to current live data; use “—” plus an honest explanation where unavailable.
- Main area: one large “Downtime by well” chart next to a compact “Ask the copilot” panel containing 3–5 example questions.
- Below: recent operational alerts, top wells requiring attention, recent corrections/conflicts, and a clear empty state for missing data.
- Keep each section aligned to an 8/12-column grid. Avoid arbitrary content widths and large empty blank areas.
- Labels should be plain language. Explain what counts as downtime in a tooltip/help text.
- Add filters for relevant time window and geographic area only if the existing UI data supports them.
- Every chart must have readable axes, units, tooltip, empty state, and text/table alternative for accessibility.
- Use consistent severity semantics for alerts: informational, warning, critical. Avoid communicating severity by color alone.
- Include a link to the detailed analytics page; do not duplicate all analytics on overview.

### App shell and navigation

- Keep the left rail recognizable but simpler: Overview, AI Copilot, Well Directory, Analytics, Ground Evidence, Corrections & Audit, Conflicts, Settings.
- Use one consistent icon family and a single active-route treatment.
- Make the active nav item obvious but not glowing.
- Make the sidebar collapsible on desktop and a true drawer on mobile.
- Keep the current operator/demo-user switch if it is already functional, but explain its purpose and avoid implying it is production authentication.
- Remove the floating “N” development badge/Next indicator from the intended demo experience if it comes from the framework overlay, using the supported configuration rather than hiding app content.
- Display backend connection/provider statuses only from real status signals. Do not render hardcoded “Connected” or port numbers.

### AI Copilot page

- Keep the chat as the primary focus and preserve message submission, loading state, quick prompts, generated charts/tables, source expansion, correction submission and reset behaviour.
- Provide a centered welcome state with 3–4 example prompts in plain language.
- Make the composer sticky to the bottom of the content area without covering the last message.
- Use readable line length and distinct user/assistant messages.
- Present evidence as expandable source chips or a compact “Sources used” panel.
- Display tool activity in simple phrases only when backed by actual tool state.
- Ensure all example prompts populate and submit the existing chat flow. Never show an example as if it were an actual generated answer.
- Keep the correction action visible but secondary.
- Add smooth entrance transitions for new messages while avoiding motion on every token.

### Well directory

- Keep search and filters near the top.
- Improve table hierarchy, spacing, status badges, numeric alignment and small-screen behaviour.
- Show table rows with keyboard focus and preserve the existing profile navigation.
- Use a responsive table with a deliberate horizontal-scroll fallback on mobile, or a card/list mode when practical.
- Preserve the actual asset schema; do not invent “lift mechanism,” “target formation,” “field,” or other columns if they are not present in backend responses.
- Export functionality must continue to use the existing real data flow.

### Analytics

- Use one coherent dashboard grid with a simple area/date filter row.
- Main chart: downtime by well/area.
- Secondary chart: maintenance costs only if present in existing data.
- Heatmap: area by month with explicit units and a readable legend.
- Give each visualization a clear title, unit, date range, accessible tooltip and source/context note.
- Use consistent axes and chart colours; do not truncate values or imply comparison of unlike measurements.
- Filters must drive actual existing queries/state. Do not build fake filters that only change labels.
- Clicking a chart datum should navigate or filter only where existing routing/data support it.

### Evidence, corrections, conflicts and settings

- Evidence: searchable records, source identifiers and excerpts in a tidy reading layout; clear distinction between documents and structured records.
- Corrections audit: show original value, corrected value, reason, author, time, scope, and status using existing data. Make scope understandable in plain English.
- Conflict log: display competing claims side by side with sources and timestamps, and explain why the conflict remains unresolved.
- Settings: group model/provider status, display preferences, animation preference and demo context. Do not build forms for backend configuration unless existing APIs support them.
- Preserve all existing working flows; only polish their presentation.

## Smooth scroll, parallax and interaction

Use the existing animation library if one is already installed. Otherwise, use Motion only if compatible with the project, or CSS/IntersectionObserver for lightweight effects. Do not introduce multiple animation systems.

Implement:
- Smooth anchor scrolling for landing-page sections.
- Subtle scroll-triggered fade/translate-in for section content.
- Gentle layered parallax of background shapes and hero art, capped at a small movement range.
- Small staggered reveals for feature sections.
- Subtle hover elevation on actionable cards and CTAs.
- Light route/content transitions that never interfere with keyboard focus or page responsiveness.
- A restrained scroll progress indicator only if it adds value.

Motion constraints:
- Prefer transform and opacity; avoid continuous layout recalculation.
- Use IntersectionObserver or the existing motion library instead of a permanent high-frequency scroll handler.
- Throttle/limit scroll-linked work.
- Respect `prefers-reduced-motion: reduce`: disable parallax, autoplay, rotation and non-essential transitions.
- Avoid scroll hijacking. Native scrolling must remain in control.
- Do not animate all dashboard cards on every scroll. Restrict elaborate parallax to the landing page.
- Avoid excessive blur and large box-shadow animations.
- Test with trackpad, wheel, keyboard, touch and reduced-motion settings.

## Design reference mapping

Translate the user's reference images into principles, not copies:
- Minimal logistics dashboards: clean structure, deliberate whitespace, data hierarchy and compact KPI summaries.
- Industrial design/editorial pages: bold headline, monochrome/neutral base, one focal technical illustration and precise labels.
- Modern operational interfaces: straightforward navigation, chart/table readability, understandable statuses and responsive cards.
- Motion references: smooth, purposeful scroll reveals and subtle depth—not perpetual motion.

The result should resemble a well-designed industrial SaaS tool with an editorial landing page, not a copied Dribbble concept.

## Technical workflow

1. Inspect current git status, branch, routes, components, styles, dependencies and existing frontend/backend boundaries.
2. Create `ui/landing-motion-dashboard` branch only if the working tree can be preserved safely. Never discard local changes.
3. Create a concise UI implementation plan and map each change to existing files.
4. Implement the landing page and tokens first, then app shell, dashboard, copilot, directory, analytics and remaining pages.
5. Reuse current API clients and response models without modifying them.
6. Extract reusable components for metric cards, section headers, charts, tables, evidence rows, status badges, empty/loading/error states.
7. Add responsive behaviour and accessibility as part of each change rather than at the end.
8. Run formatter, lint, typecheck, tests and production build using commands discovered in the existing project. If a check cannot run, state why.
9. Search the diff for edits to backend/database/API/business logic. Revert any accidental out-of-scope changes without affecting pre-existing user work.
10. Inspect key routes at desktop and mobile widths. Confirm controls work, not just that they look good.
11. Summarize files changed, design decisions, commands run, test outcomes, and remaining limitations.
12. After reviewing the diff, push the feature branch and create a pull request if GitHub access is available and the user has authorized that workflow. Do not push directly to main. If GitHub access is unavailable in the local coding-agent environment, provide exact git commands.

## Acceptance criteria

- Landing page exists and is clearly distinct from the operational app.
- 3D hero is lightweight, lazy-loaded, responsive, and has a static fallback.
- Page scrolling and parallax feel smooth; reduced-motion preferences are respected.
- Dashboard has clear hierarchy, real metrics, one primary analytical chart, and a compact copilot entry point.
- The app shell is coherent and responsive across all existing sections.
- Search, filter, navigation, chat, evidence, corrections and export controls continue working wherever they worked before.
- No backend, database, API contract, AI logic, or business-rule changes were made.
- No invented live data or misleading system-status badges were introduced.
- Loading, error, empty and unavailable states are intentional and legible.
- Accessibility, keyboard support and responsive layout have been checked.
- Frontend checks are run and reported honestly.
- Changes are committed on a dedicated feature branch, with a PR rather than an unreviewed direct commit to main where supported.

Now inspect the real project and execute the redesign with these constraints. Do not stop after returning a plan or a mockup.