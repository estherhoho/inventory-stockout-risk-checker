# UX Playground — Inventory Stockout Risk Checker

**Version:** 1.0  
**Date:** 2026-06-06  
**Author:** UX Product Designer (Dock to AI Product Build Squad)  
**Status:** Ready for Esther review and direction selection  
**Parent issue:** DOC-56 (Inventory Stockout Risk Checker kickoff)  
**Playground issue:** DOC-59  

---

## Overview

This document records 5 distinct UI/UX directions for the Inventory Stockout Risk Checker MVP. Each option was rendered as a static HTML prototype using the 10-SKU sample CSV (`data/sample/shopify-inventory-sample.csv`) with pre-calculated risk scores, days of cover, reorder quantities, and supplier draft templates.

All 5 options implement every module required by UX-SPEC v0.2:
- CSV upload + Data Quality panel
- Top-line counts (SKUs analyzed, stockout-risk count, deadstock-candidate count, cash tied up)
- Top stockout-risk SKUs with days_of_cover, reorder urgency label, reorder qty + estimated cash
- Top deadstock-candidate table with off-season caveat
- Caveat triggers (Newly active SKU badge, Off-season candidate, Verify net of returns banner)
- Supplier follow-up draft — two templates (standard reorder + urgent expedite), auto-selected by urgency, one-click switch
- Inline-editable `lead_time_days` per row
- Estimated cash for reorder next to reorder qty

---

## Pre-calculated Sample Data Summary

Derived from `data/sample/shopify-inventory-sample.csv` using UX-SPEC v0.2 formulas:

| SKU | Product | Days Cover | Action | Notes |
|-----|---------|-----------|--------|-------|
| SKU-1004 | Cotton Drawer Organizer | 1.2 | EXPEDITE | 29 days short, reorder 108, $513 |
| SKU-1001 | Bamboo Storage Bin - Small | 10.7 | EXPEDITE | 17 days short, reorder 144, $1,224 |
| SKU-1007 | Glass Meal Prep Container 3pk | 16.4 | EXPEDITE | 44 days short, reorder 18, $194 |
| SKU-1002 | Bamboo Storage Bin - Large | 17.5 | EXPEDITE | 18 days short, reorder 120, $1,470 |
| SKU-1008 | Linen Closet Divider | 48 | HOLD | 0 on-hand, 40 incoming |
| SKU-1006 | Magnetic Spice Labels | 83 | HOLD | Stable |
| SKU-1009 | Compostable Shipping Mailer 50pk | 95 | HOLD | Stable |
| SKU-1005 | Reusable Produce Bag Set | No sales | HOLD | 0 units sold |
| SKU-1003 | Silicone Travel Bottle Set | 587 | DEADSTOCK | $744 cash tied up |
| SKU-1010 | Holiday Gift Wrap Bundle | 1,791 | DEADSTOCK | $870 cash tied up, off-season caveat |

**Summary:** 10 SKUs · 4 Expedite · 3 Deadstock candidates · $2,296 cash in deadstock · Est. reorder commitment ~$3,401

---

## Option 1: Action Digest

**File:** `work/playground/option-1-action-digest/index.html`

### Intended Feeling
Monday morning ops report. Decisive, text-first. You open it and immediately know what to do.

### Layout Strategy
Numbered action list at the top → expandable detail per item → collapsible tables (stockout, deadstock) → supplier draft panel that opens below. No charts or card grids.

### Components
- Hero headline: "4 SKUs need action this week"
- 4 metric pills (KPIs)
- Numbered action list with colored left-border pills (EXPEDITE/HOLD/DEADSTOCK)
- Click-to-expand detail rows with inline lead-time edit
- "Draft supplier email" button per expanded EXPEDITE item
- Supplier draft panel (slides open below the action list)
- Collapsible deadstock section
- Collapsible formula/caveat accordion

### Best Use Case
Ops manager on mobile doing a Monday morning scan. Wants the answer — not a data dump. Under 60 seconds from load to knowing what to do.

### Tradeoffs
| Strength | Risk |
|----------|------|
| Fastest time-to-decision | Tables are hidden by default; data-heavy users may miss detail |
| Low cognitive load | Less suitable for comparing multiple SKUs simultaneously |
| Mobile-first naturally | Non-obvious where the "full data" lives |
| Low implementation complexity | May feel too simple for power users |

### Implementation Complexity
**Low** — No sidebar, no tab routing. One page with accordion expand/collapse, one slide-in panel. Straightforward HTML/CSS/JS.

---

## Option 2: Command Table

**File:** `work/playground/option-2-command-table/index.html`

### Intended Feeling
Professional data tool. Like a well-designed spreadsheet for ops analysts who live in tables.

### Layout Strategy
Compact sticky header with KPIs → full-width dense table showing all 10 SKUs → supplier draft in a fixed bottom drawer that slides up when an EXPEDITE row is clicked.

### Components
- Sticky header with KPI strip
- Dismissable "Verify net of returns" banner
- Data quality inline row (used/missing fields)
- Full sortable table (click column headers to sort)
- Color-coded risk cells (red/amber/gray/purple background per risk)
- Inline lead-time edit (click pencil icon in cell)
- Bottom drawer (320px) for supplier draft with slide-up CSS animation
- Collapsible formula section below table

### Best Use Case
Inventory analyst doing a weekly desktop review session. Wants to see all SKUs at once, sort by risk, compare columns, and act on individual rows.

### Tradeoffs
| Strength | Risk |
|----------|------|
| All data visible simultaneously | Dense — harder on mobile |
| Sortable, comparable | Requires horizontal scroll on small screens |
| Familiar spreadsheet mental model | Risk cells can look noisy |
| Good for 50–200 SKU lists | Bottom drawer may be missed |

### Implementation Complexity
**Medium** — Table sorting, sticky header, inline cell editing, bottom drawer animation. Feasible in plain HTML/CSS/JS but requires careful mobile handling.

---

## Option 3: Risk Cards

**File:** `work/playground/option-3-risk-cards/index.html`

### Intended Feeling
Visual, scannable, immediate — like a Kanban board or Trello for inventory risk. Color tells the story.

### Layout Strategy
Summary strip → 2-column (mobile) / 3-column (desktop) card grid → click card to expand detail panel inline (accordion, not modal). All SKUs visible as cards, color-coded by risk tier.

### Components
- Summary strip (4 metric boxes with colored top borders)
- Dismissable "Verify net of returns" banner
- Data quality compact notice
- SKU cards: 4px colored left border, risk badge top-right, bold days-of-cover number, action label
- EXPEDITE cards: "X days short" in red
- DEADSTOCK cards: cash tied up, off-season badge for SKU-1010
- Card expand: detail grid (on-hand, available, incoming, lead time, reorder qty, cash), supplier draft inline
- Inline lead-time edit in expanded detail
- Formula accordion at bottom

### Best Use Case
SMB founder doing a quick visual triage on mobile or tablet. Wants to understand the risk landscape in 5 seconds by scanning card colors. Non-analytical user.

### Tradeoffs
| Strength | Risk |
|----------|------|
| Instant visual risk scan | Less data density per item |
| Mobile-friendly grid | More scrolling for detail |
| Easy to understand without training | No simultaneous comparison of all SKUs |
| Engaging visual design | Card layout may look too informal for enterprise positioning |

### Implementation Complexity
**Medium** — CSS grid, accordion card expand with smooth height animation, inline edit in expanded detail. Similar complexity to Option 2.

---

## Option 4: Guided Wizard

**File:** `work/playground/option-4-guided-wizard/index.html`

### Intended Feeling
Calm, focused, educational. Like having a consultant walk you through the data. One thing at a time.

### Layout Strategy
5-step wizard with progress bar: Step 1 Data Quality → Step 2 Stockout Risk → Step 3 Deadstock → Step 4 Supplier Draft → Step 5 Summary. One step visible at a time. Previous/Next navigation.

### Components
- 5-step progress indicator (dots with teal fill + checkmarks)
- Step 1: Field checklist, returns warning, formula explainer
- Step 2: 4 expedite cards (with inline lead-time edit), returns banner
- Step 3: 3 deadstock candidate cards with cash + caveats
- Step 4: SKU selector tabs, auto-selected template, editable draft textarea, copy button
- Step 5: Summary stat boxes, numbered next-actions list, cash summary, start-over button
- Fade-in animation between steps
- Fixed prev/next buttons at bottom of viewport on mobile

### Best Use Case
Ecommerce consultant walking a client through a first inventory review. New user unfamiliar with the tool. Someone who wants guided confirmation at each stage rather than a full data dump.

### Tradeoffs
| Strength | Risk |
|----------|------|
| Excellent for new/first-time users | Too slow for power users doing a weekly review |
| Guides users to the right decisions | Can't see all data simultaneously |
| Consultant/client demo friendly | 5 steps may feel long for a simple dataset |
| Low error rate (guided path) | Users may skip steps or abandon |

### Implementation Complexity
**Low–Medium** — Step show/hide with JS, progress indicator, fade transitions. Simpler state management than sidebar nav (Option 5).

---

## Option 5: SaaS Dashboard (Mini Command Center)

**File:** `work/playground/option-5-saas-dashboard/index.html`

### Intended Feeling
Professional SaaS product. Feels like a real tool, not a web page. Built for weekly recurring use.

### Layout Strategy
Fixed sidebar (200px) with 5 nav items: Overview / Stockout Risk / Deadstock / Supplier Draft / Formulas. Main content area fills remaining width. Desktop: sidebar always visible. Mobile: sidebar collapses to bottom tab bar.

### Components
- Dark sidebar (#1E293B) with sky-500 active state indicator
- White 60px header bar
- Tab 1 Overview: KPI cards, returns banner, urgent action list, data quality panel
- Tab 2 Stockout Risk: full 10-SKU table with inline lead-time edit, row-level action buttons
- Tab 3 Deadstock: deadstock-only table with cash column, off-season badge, per-row caveats
- Tab 4 Supplier Draft: SKU selector tabs, template toggle, editable draft, copy button
- Tab 5 Formulas: numbered formula cards with monospace expressions, caveat triggers
- Fade-in content transition between tabs
- Mobile bottom tab bar with 5 icons

### Best Use Case
Ops manager running this tool weekly. Dock to AI embed context. Power user who wants each module cleanly separated and navigable without scrolling. Future features (saved reports, alerts) slot naturally into existing sidebar nav.

### Tradeoffs
| Strength | Risk |
|----------|------|
| Professional, credible SaaS feel | Higher implementation complexity |
| Best for recurring weekly use | Heavier mental model for one-time users |
| Clean module separation (no scroll) | Mobile bottom tab bar is a pattern users must learn |
| Most scalable for future features | Sidebar may feel unnecessary for small SKU lists |
| Best for Dock to AI embed | |

### Implementation Complexity
**High** — Sidebar layout, tab routing, full table with sortable rows, inline editing, template switching, mobile responsive switching (sidebar → bottom tab bar). Most complex of the 5 options.

---

## Recommendation

**Recommended: Option 5 (SaaS Dashboard)**

Reasoning:
1. The Inventory Stockout Risk Checker is positioned as a **recurring weekly ops tool**, not a one-time calculator. The sidebar pattern fits weekly-review mental models better than a single long page.
2. The dark sidebar creates **credibility and professionalism** appropriate for Dock to AI's business-user positioning.
3. Each module (Stockout, Deadstock, Supplier Draft, Formulas) gets a **focused view without competing for scroll space**.
4. The sidebar layout **scales cleanly** to a Dock to AI embed and positions well for future features (saved reports, multi-file comparison, alerts).
5. The Stockout Risk tab is the most **powerful version of the main table** across all 5 options — full sortable data with inline editing and row-level actions.

**Strong alternative: Option 1 (Action Digest)** if:
- The primary user is a mobile-first founder, not a desktop ops analyst
- Dock to AI wants to emphasize simplicity over depth for first impressions
- Dev timeline is constrained (Option 1 has the lowest implementation complexity)

**Hybrid suggestion worth considering:**
- Option 5 sidebar + Option 1's numbered action list as the Overview tab content (instead of a KPI grid)
- This gives power users the full tool AND gives first-time users an immediate "here's what to do" answer when they first land

---

## Artifact Locations

| Artifact | Path |
|---------|------|
| Playground gallery (Esther entry point) | `work/playground/index.html` |
| Option 1: Action Digest | `work/playground/option-1-action-digest/index.html` |
| Option 2: Command Table | `work/playground/option-2-command-table/index.html` |
| Option 3: Risk Cards | `work/playground/option-3-risk-cards/index.html` |
| Option 4: Guided Wizard | `work/playground/option-4-guided-wizard/index.html` |
| Option 5: SaaS Dashboard | `work/playground/option-5-saas-dashboard/index.html` |
| This spec | `docs/UX-PLAYGROUND.md` |

---

## Approval Required from Esther

- [ ] Select one option, combine two, or reject all and describe a different direction
- [ ] Confirm whether mobile-first (Options 1, 3) or desktop-first (Options 2, 5) is the primary MVP build target
- [ ] Confirm whether Dock to AI embed context should influence final layout (Option 5 is most embed-friendly)
- [ ] Confirm whether the Action Digest hybrid (Option 5 sidebar + Option 1 hero) is worth a design pass before Developer starts

---

## Developer Handoff (after Esther selects a direction)

Once Esther confirms a direction, Developer should:
1. Set up the project folder under `code/` (clone or initialize)
2. Implement the selected UI direction starting with the sample-data-first flow (not upload polish first)
3. Wire real CSV parsing and the deterministic calculation layer (PRODUCT-SPEC v0.2 formulas)
4. Keep the supplier draft logic deterministic (no AI API needed for v0 — rule-based template population)
5. Test at 375px mobile and 1024px+ desktop before build preview
6. Reference `DEV-PLAN.md` for implementation sequencing

Known playground limitations:
- All 5 options use hardcoded pre-calculated data (no live CSV parsing)
- Lead-time inline edit is visual only — does not recalculate downstream values (would in real build)
- "Upload CSV" button shows sample state only
- Supplier draft copy works via `navigator.clipboard` — requires HTTPS or localhost in real deploy
- No actual file download in any option

---

*Generated by UX Product Designer for DOC-59. Playground gate per UX-SPEC v0.2 §11.*
