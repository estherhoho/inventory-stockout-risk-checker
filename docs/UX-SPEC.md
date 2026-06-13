# UX Specification — Inventory Stockout Risk Checker

**Version:** 0.2 (post Domain Feasibility Review — [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260))
**Tool URL:** `/toolkit/inventory-stockout-risk-checker`
**Author:** Dock to AI Product Build Squad
**Date:** 2026-06-06
**Status:** Awaiting Esther approval. After approval, UX Product Designer to produce the 5-option Interface Playground before Developer begins implementation (per Agent Identity playground gate).

---

## 1. Target User & Jobs To Be Done

### 1.1 Primary User Segments

| Segment | Role | Context |
|---|---|---|
| Shopify / DTC Operator | Founder, ops lead, inventory planner | Exports inventory and sales data manually, needs to know which SKUs need action this week |
| Spreadsheet-Heavy SMB Merchant | Small team managing 50-2,000 SKUs | Does not trust black-box forecasting, but wants a fast, credible reorder signal |
| Ecommerce Consultant | Fractional ops or supply chain consultant | Needs a quick first-pass analysis to show a client before deeper advisory work |

### 1.2 Core Jobs To Be Done

1. "Which SKUs need action this week?"
2. "How many days of cover do I actually have?"
3. "Should I reorder, expedite, markdown, hold, or clean up the data?"
4. "Which deadstock items are tying up cash?"
5. "What should I say to the supplier right now?"

### 1.3 Non-Goals (v0)

- not a full forecasting dashboard
- not a Shopify app install flow
- not a raw-export cleanup assistant
- not a PO creator
- not an automated email sender

---

## 2. UX Direction

This should explicitly follow the successful container checker pattern:

- tool-first page, not brand-first page
- mobile-first interaction
- deterministic result first
- explanation and next action second
- one clear working path using sample data

The page should feel like:

```text
upload CSV -> see weekly actions -> inspect tables -> copy supplier draft
```

not:

```text
marketing page -> big charts -> vague AI summary
```

---

## 3. Recommended User Flow

### 3a. Happy Path — Mobile First Run

1. User lands on `/toolkit/inventory-stockout-risk-checker`.
2. Above the fold, they see:
   - tool name
   - one-line promise
   - privacy note: "CSV is processed locally in your browser"
   - primary button: `Try Sample CSV`
   - secondary path: `Upload CSV`
3. User taps `Try Sample CSV`.
4. A lightweight loading state appears: `Loading sample inventory...`
5. Results appear directly below the upload block.
6. The first result section answers: `Which SKUs need action this week?`
7. User sees summary cards:
   - SKUs analyzed
   - high stockout risk
   - deadstock count
   - cash tied up
8. User scrolls into the top action table.
9. Tapping a SKU row opens a detail panel or inline expansion showing:
   - days of cover
   - lead time
   - reorder quantity
   - recommended action
   - supplier draft
10. User copies the supplier draft.

### 3b. Happy Path — Mobile User Upload

1. User taps `Upload CSV`.
2. File picker opens.
3. After file selection, show parsing state: `Checking your CSV...`
4. If validation passes, result screen replaces the empty state.
5. The tool keeps the upload controls visible above results so the user can re-upload quickly.

### 3c. Happy Path — Desktop

1. Page loads in a two-zone layout:
   - left/top: tool intro, upload area, sample button
   - right/below: result area or empty instructional state
2. User uploads CSV or loads sample data.
3. Results render in-place without taking over the whole screen.
4. The first table is visible without needing charts or tabs.

### 3d. Validation Error Path

1. User uploads a CSV missing a required column or containing invalid numeric values.
2. Parsing stops.
3. The UI shows an error summary block:
   - `We couldn't analyze this CSV yet`
   - list of concrete issues
4. The block also shows:
   - required columns list
   - a button to try sample CSV
   - a button to upload a corrected file

### 3e. No Action / Calm Path

1. User uploads a valid file with mostly healthy SKUs.
2. The top summary still appears.
3. Headline reads something like:
   - `Most SKUs look stable this week`
4. The tool still shows:
   - a watchlist for medium-risk SKUs
   - deadstock section if applicable
   - formulas and caveats

---

## 4. Screen Structure

### 4.1 Header / Tool Intro

Content:

- H1: `Inventory Stockout Risk Checker`
- one-sentence subhead
- privacy note
- small note that formulas are deterministic and transparent

### 4.2 Upload Block

Elements:

- drag/drop or browse target
- `Upload CSV` button
- `Try Sample CSV` button
- collapsed helper block:
  - required columns
  - optional columns
  - note that v0 supports one normalized schema only

### 4.3 Empty State

Before upload:

- short explanation of what the tool returns
- sample CSV shortcut emphasized
- no fake dashboard

### 4.4 Results Area

Priority order (SME-updated, mobile-first):

1. weekly action summary
2. **Data Quality panel** (which optional fields were used vs missing, plus row-level warnings)
3. **"Verify net of returns" banner** (immediately above the stockout table)
4. stockout risk table
5. deadstock-candidate and cash tied up
6. supplier follow-up draft (two templates, auto-selected by urgency)
7. formulas and caveats

Do not lead with charts.

---

## 5. Result Modules

### 5.1 Weekly Action Summary

This is the hero result block.

It should answer:

- how many SKUs need action now
- which actions dominate
- which one or two SKUs are most urgent

Suggested components:

- four compact metric cards (SKUs analyzed, high stockout risk, deadstock candidates, cash tied up)
- one "top actions this week" text block
- one legend explaining action labels (reorder, expedite, markdown, hold, review data)

### 5.2 Data Quality Panel (SME-added)

Position: below the action summary, above the "Verify net of returns" banner and stockout table on mobile; right-rail or inline on desktop.

Content:

- "Analyzed with N of 6 optional fields" headline
- Checklist of optional columns with the operational consequence of each:
  - ✓ `unit_cost` → "Cash tied up and estimated cash for reorder enabled"
  - ✓ `vendor` → "Supplier draft personalized"
  - ✓ `incoming_units` → "Inbound counted in effective inventory"
  - ✓ `committed_units` → "Committed units subtracted from available inventory"
  - ○ `reorder_multiple` → "Reorder qty not rounded to MOQ"
  - ○ `category` → "Category not available for segmentation"
- Row-level warning counts when triggered:
  - "Newly active SKU: N rows" (90d < 30d * 2.5)
  - "Committed exceeds on-hand: N rows" (available inventory floored at 0)
  - "Review data: N rows" (validation issues)

Tone: factual, no fail-state styling. This panel doubles as a discoverable upsell list for future schema versions.

### 5.3 Stockout Risk Ranked Table

Columns:

- SKU
- product name
- days of cover
- **lead time (inline-editable per row)** — SME requirement: most SMBs guess lead time and need to test what the calculation does at 30 vs 45 vs 60 days; recalc must run client-side without re-uploading the file
- stockout risk
- reorder quantity (with **estimated cash for reorder** next to it when `unit_cost` is present)
- action (the `expedite` action label includes **"projected N days short"**)

Per-row badges and caveats:

- **Newly active SKU** badge near the SKU name when `units_sold_90d < units_sold_30d * 2.5`

Sorting:

- high risk first
- then lowest days of cover

Visual treatment:

- red/orange/yellow neutral scale, not a noisy heatmap-first chart
- row tap reveals detail on mobile

Banner immediately above this table:

- **"Verify net of returns"** — "Make sure units_sold_30d and units_sold_90d are NET of returns. Shopify's default order export is gross."

### 5.4 Deadstock-Candidate / Cash Section

Label: **"Deadstock candidate"** throughout (never bare "Deadstock") per SME naming requirement.

Columns:

- SKU
- product name
- inventory on hand
- units sold 90d
- deadstock-candidate risk
- cash tied up if available
- action

Per-row caveat (always on for `high` rows):

- "Off-season SKUs may appear here. Confirm against your assortment calendar before marking down."

This section should feel secondary to weekly stockout action, but still important.

### 5.5 Supplier Draft Panel (two templates, auto-selected)

Behavior:

- selecting a row populates the draft panel
- template auto-selects by urgency:
  - **Urgent expedite** when `stockout_risk == high` AND `days_of_cover < lead_time_days`
  - **Standard reorder** otherwise (for any stockout-high row)
- A small "Switch to standard / Switch to urgent" link is always visible above the draft text, so the operator can override the auto-selection
- if no vendor is present, use a generic supplier placeholder
- copy button stays visible on mobile

Structure for each template:

- short subject line
- brief supplier message
- bullet facts pulled from the deterministic metrics (the urgent template highlights "projected days short")

### 5.6 Formula / Caveat Panel

Must explain:

- how days of cover is calculated, including the new `available_inventory = inventory_on_hand - committed_units` step
- how the safety buffer scales with lead time: `safety_buffer_days = max(7, ceil(0.25 * lead_time_days))`
- how stockout risk is classified
- how deadstock candidate is classified, and why the "candidate" framing exists (seasonal false-positives)
- bundles / kits are not exploded into components — treat parent and components as separate inputs
- that this is a planning aid, not a forecast guarantee

---

## 6. Copy Direction

Preferred tone:

- plain English
- operational
- credible, not hyped

Good:

- `3 SKUs need action this week`
- `Inventory looks healthy for most SKUs`
- `This SKU may run short before your lead time window`
- `Expedite — projected 12 days short of next replenishment window`
- `Deadstock candidate — confirm against your assortment calendar before marking down`
- `Newly active SKU — limited sales history`
- `Make sure units_sold_30d and units_sold_90d are NET of returns`

Avoid:

- `AI predicts your supply chain future`
- `Guaranteed stockout prevention`
- `Replace your inventory planner instantly`
- bare `Deadstock` without the "candidate" qualifier
- `Replacement for Stocky` until 5–10 merchant conversations confirm migration story

---

## 7. State Copy

### 7.1 Empty State

`Upload a normalized inventory CSV to see stockout risk, deadstock, days of cover, and what to do this week.`

### 7.2 Sample State

`Sample data loaded. Review the result flow before uploading your own file.`

### 7.3 Parsing State

`Checking your CSV and calculating SKU risk...`

### 7.4 Validation Error State

`We couldn't analyze this CSV yet. Fix the issues below or try the sample file.`

### 7.5 No Recent Sales State

`No recent sales in this dataset. We can't estimate days of cover, but we can still flag deadstock.`

### 7.6 No High-Risk SKU State

`No high stockout-risk SKUs found in this file. Review the watchlist and deadstock section below.`

---

## 8. Mobile Notes

- upload controls must remain reachable without scrolling back to the top forever
- summary cards should stack cleanly
- the first table should become a card list or horizontally safe table
- the supplier draft copy action must stay obvious
- formulas/caveats can collapse behind an accordion

---

## 9. Dock to AI Embedded / Standalone Readiness

Like the container checker, the UI should be ready for both:

- standalone Vercel preview
- Dock to AI embedded toolkit route

Requirements:

- no backend dependency
- responsive layout
- no browser features that break inside an embed
- local-file processing messaging visible in both contexts

---

## 10. Developer Handoff Notes

- build sample-first flow before advanced upload polish
- keep the first result screen text-heavy and operational
- use deterministic action colors consistently
- prefer simple tables/cards over heavy chart libraries
- do not create disabled fake CTAs in the first interactive build
- inline-edit on `lead_time_days` must recalc the row's metrics, risk, action, and supplier template client-side without re-uploading the CSV
- supplier draft auto-selection must rerun on every row selection (so the urgent template appears for expedite rows automatically)
- Data Quality panel state must update when row-level warnings appear/disappear after a lead-time edit (e.g. an edit that pushes a SKU from expedite back into reorder)

## 11. Interface Playground Gate (per Agent Identity)

Before Developer begins implementation, UX Product Designer must produce an **Interface Playground with 5 distinct UI/UX options** for Esther to choose between (or combine). Each option must include name, intended feeling, layout strategy, component style, best use case, tradeoffs, implementation complexity, and recommended choice. Esther selects/combines/rejects the direction before final build.

This gate is triggered AFTER Esther approves the PRD package (PRODUCT-SPEC, DATA-PLAN, UX-SPEC, DEV-PLAN, REVIEW-GATE). It is currently NOT yet open — do not begin playground work until approval lands on [DOC-56](mention://issue/c0975b5c-4597-49c6-98d8-6098a3d8ce36).
