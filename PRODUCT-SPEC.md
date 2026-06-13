# PRODUCT-SPEC — Inventory Stockout Risk Checker

**Version:** 0.2 (post Domain Feasibility Review)
**Last updated:** 2026-06-06
**Squad:** Product Build Squad
**SME recommendation:** **BUILD** — with five v0 adjustments baked in (see §SME-Validated v0 Adjustments)

## Product Overview

Inventory Stockout Risk Checker helps Shopify and ecommerce operators upload a normalized inventory CSV and quickly see which SKUs are at risk of stocking out, which SKUs look like deadstock candidates, and what action to take this week.

This product should follow the same operating pattern that worked well for Container Utilization Checker:

- one tool, one project folder
- static HTML/CSS/JS MVP
- deterministic calculation layer
- rule-based recommendation layer
- mobile-first, tool-first UX
- GitHub-ready README and skill packaging

## Why Now

The evidence brief ranks this product direction as the strongest next build because:

- Shopify merchants in the `$500K-$20M` band are specifically called out as facing the August 2026 Stocky sunset.
- The strongest recommended concept is `Stockout Risk Heatmap with AI Supplier Follow-Up Drafter`.
- The pain is operational, recurring, and easy to understand: stockouts, excess inventory, and unclear reorder timing.
- A CSV-first tool is credible and buildable without waiting on OAuth, backend storage, or black-box forecasting.

Reference evidence:

```text
/Users/estherho/sc_product/doc-27-product-evidence-brief-en.html
/Users/estherho/sc_product/outputs/2026-06-02-doc-25-product-opportunity-roadmap.md
```

Important caution from the evidence brief:

- Stocky migration pain is strong enough to justify the build direction.
- Public launch copy should still avoid overclaiming "replacement" language until 5-10 merchant conversations confirm the exact migration story.

## Target User

Primary:

- Shopify or DTC merchant
- ecommerce operator or inventory planner
- founder / ops lead managing roughly 50-2,000 SKUs
- spreadsheet-heavy team that already exports inventory and sales data manually

Secondary:

- wholesale or distribution ops manager using CSV exports
- ecommerce consultant managing replenishment for SMB brands
- Amazon/FBA-adjacent operator using normalized exports, not direct API sync

Not the v0 target:

- enterprise ERP buyer
- multi-location omnichannel network needing system-of-record sync
- merchant expecting automatic PO creation or live supplier collaboration

## Job To Be Done

When I have current inventory, recent sales, and supplier lead times, I want to quickly know which SKUs need action this week, so I can prevent stockouts, reduce deadstock, and send a credible supplier follow-up without relying on a black-box forecast.

## User Problem

SMB operators often do not know:

- which SKUs will run out before the next replenishment window
- whether inbound inventory is enough to prevent a stockout
- which slow movers are tying up cash
- whether this week calls for reorder, expedite, markdown, hold, or data cleanup
- how to explain urgency clearly to a supplier

## Current Alternatives

- spreadsheet formulas maintained manually
- Stocky or paid inventory-planning apps with sync, support, or pricing concerns
- generic reorder calculators with no deadstock view
- ops consultants manually building weekly reorder sheets

## Product Promise

Upload one normalized CSV. Get a ranked weekly action list with transparent formulas, stockout/deadstock signals, days of cover, reorder quantity guidance, and a copyable supplier follow-up draft.

## Esther-Confirmed MVP Constraints

These constraints are already confirmed and should drive every implementation decision:

- CSV-first v0 only
- no Shopify OAuth
- no backend storage of uploaded CSV data
- browser-local processing only
- no black-box ML forecasting
- AI only for explanation, action-plan copy, and supplier follow-up draft
- scope must stay tight enough for a static website tool

## SME-Validated v0 Adjustments

Supply Chain SME completed a Domain Feasibility Review on 2026-06-06 (see [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260)). Recommendation: **BUILD** — after the following five adjustments are baked into v0:

1. **Scale the safety buffer with lead time.** Replace the fixed 7-day buffer with `safety_buffer_days = max(7, ceil(0.25 * lead_time_days))`. Variance grows with lead time and a flat 7-day buffer flags overseas lead-time SKUs only after the reorder window has already passed.
2. **Add `committed_units` as an optional column** and subtract it from on-hand to compute `available_inventory` before counting inbound. This is the #1 reason SMBs stock out unexpectedly: on-hand shows 100 but 80 are committed to pending orders.
3. **Ship a Data Quality panel** at the top of results showing which optional fields were used vs missing, so the user understands what the calculation could and could not see (no silent degradation).
4. **Add three caveat triggers** in the UI:
   - **Newly active SKU** badge when `units_sold_90d < units_sold_30d * 2.5` (90d rate is unreliable for sub-90-day SKUs).
   - **Off-season candidate** caveat on every deadstock-high row (seasonal SKUs will surface as deadstock false positives).
   - **Verify net of returns** banner above the stockout table (Shopify gross sales overstate demand if returns are not subtracted).
5. **Ship two supplier templates** — standard reorder and urgent expedite — and auto-select the urgent template when `days_of_cover < lead_time_days`, surfacing "projected days short" inside the action label.

Additional UI requirements from the SME review:
- Rename the "Deadstock" label to **"Deadstock candidate"** throughout the UI to avoid promising more confidence than the math supports.
- When `unit_cost` is present, show **"estimated cash for reorder"** next to the reorder quantity so the operator sees the cash impact before placing the PO.
- Make `lead_time_days` **inline-editable per row** after upload — most SMBs guess lead time and need to test what the calculation does at 30 vs 45 vs 60 days.
- UI must explicitly state: **bundles and kits are not exploded into components** — parent and components must be treated as separate inputs.

## MVP Scope

The MVP is a static web tool that accepts a normalized inventory CSV and returns a clear action-first analysis.

Inputs:

- CSV upload
- sample CSV first-run path
- required fields:
  - `sku`
  - `product_name`
  - `inventory_on_hand`
  - `units_sold_30d`
  - `units_sold_90d`
  - `lead_time_days`
- optional fields:
  - `unit_cost`
  - `vendor`
  - `category`
  - `reorder_multiple`
  - `incoming_units`
  - `committed_units` *(SME-added; units allocated to unshipped orders — subtracted from on-hand before any risk math)*

Outputs:

- Data Quality panel (which optional fields were used vs missing)
- total SKUs analyzed
- high stockout-risk count
- deadstock-candidate count
- total cash tied up when `unit_cost` exists
- top stockout-risk SKUs
- top deadstock-candidate SKUs
- days of cover (computed from `available_inventory + incoming_units`)
- reorder urgency label
- reorder quantity estimate, with estimated cash for reorder when `unit_cost` exists
- deterministic action label:
  - `reorder`
  - `expedite` *(label surfaces projected days short)*
  - `markdown`
  - `hold`
  - `review data`
- copyable supplier follow-up draft — two templates:
  - **standard reorder** (default)
  - **urgent expedite** (auto-selected when `days_of_cover < lead_time_days`, with one-click switch back to standard)
- caveat triggers: Newly active SKU badge, Off-season candidate caveat, Verify net of returns banner
- formula and caveat panel

## Deterministic Calculation Layer

Like the container checker, the calculation layer must be explicit and deterministic.

Core v0 calculations (SME-validated):

- `average_daily_sales_30d = units_sold_30d / 30`
- `average_daily_sales_90d = units_sold_90d / 90`
- `demand_run_rate = max(average_daily_sales_30d, average_daily_sales_90d)` for conservative stockout detection
- `committed_units_normalized = committed_units or 0`
- `incoming_units_normalized = incoming_units or 0`
- `available_inventory = max(0, inventory_on_hand - committed_units_normalized)`
- `effective_inventory = available_inventory + incoming_units_normalized`
- `days_of_cover = effective_inventory / demand_run_rate` (show `No recent sales` when `demand_run_rate <= 0`)
- `safety_buffer_days = max(7, ceil(0.25 * lead_time_days))` *(SME: replaces the previous fixed 7-day buffer; variance scales with lead time)*
- `risk_threshold_high = lead_time_days + safety_buffer_days`
- `target_cover_days = lead_time_days + 30`
- `raw_reorder_quantity = max(0, target_cover_days * demand_run_rate - effective_inventory)`
- `cash_tied_up = inventory_on_hand * unit_cost`
- `estimated_cash_for_reorder = reorder_quantity * unit_cost` *(shown when `unit_cost` exists, so operator sees the cash impact next to the qty)*

The UI must show the exact formulas in plain English and note that these are planning heuristics, not perfect forecasts.

## Rule-Based Recommendation Layer

Recommendation logic should mirror the container checker pattern: deterministic result first, rule-based explanation second.

Suggested v0 action rules:

- `review data`
  - invalid numbers
  - negative inventory
  - duplicate SKU conflict
  - missing required fields
- `markdown`
  - deadstock_candidate_risk == high and inventory on hand is positive
- `expedite`
  - stockout risk high AND `days_of_cover < lead_time_days` (i.e. projected to stock out before normal replenishment can land)
  - label surfaces `projected days short = lead_time_days - days_of_cover`
- `reorder`
  - stockout risk high and reorder quantity is positive (and not already classified as expedite)
- `hold`
  - stockout risk low and deadstock-candidate risk low

The supplier follow-up draft uses **two templates** populated from deterministic results, auto-selected by urgency with a one-click switch:

**Standard reorder** (default; stockout risk high, days of cover ≥ lead time):
- SKU, product name, vendor
- current on-hand, inbound units
- requested reorder quantity, requested by date (today + lead_time_days)
- last unit cost when present
- three confirm-asks: availability/updated lead time, current pricing/MOQ, earliest ship date

**Urgent expedite** (auto-selected when stockout risk high AND `days_of_cover < lead_time_days`):
- SKU, product name, vendor
- current on-hand, days of cover, standard lead time, **projected days short**
- requested reorder quantity
- three confirm-asks: fastest possible ship date, expedite/air-freight cost option, partial early shipment

Markdown / deadstock emails are NOT shipped in v0 — markdown decisions are internal or customer-facing, not supplier-facing.

## Recommended Static MVP Scope

This should be the explicit first build scope:

- one normalized CSV schema only (6 required + 6 optional columns including `committed_units`)
- one analysis screen with upload plus sample-data loader
- one results screen emphasizing "Which SKUs need action this week?"
- one **Data Quality panel** showing which optional fields were used vs missing (positioned below the action summary, above the tables on mobile)
- one ranked table for stockout risk
- one secondary table for deadstock candidates and cash tied up
- one selected-SKU supplier draft panel **with two templates** (standard reorder, urgent expedite) and auto-selection by urgency
- one formula/caveat panel
- inline edit for `lead_time_days` per row
- three caveat triggers: Newly active SKU badge, Off-season candidate caveat, Verify net of returns banner

Defer from the first static MVP:

- multiple CSV schema adapters
- raw Shopify export parsing
- chart-heavy dashboards
- saved reports
- email capture gating
- downloads
- login
- automation
- supplier email sending

## Website Placement

Category:

```text
Inventory & Replenishment
```

URL:

```text
/toolkit/inventory-stockout-risk-checker
```

Primary CTA:

```text
Analyze Inventory CSV
```

Secondary CTA:

```text
Try Sample CSV
```

## Monetization Path

Phase 1:

- free analyzer
- consultation CTA for inventory workflow review
- optional gated full report in a later private beta step

Phase 2:

- paid weekly inventory action report setup
- Shopify export cleanup and normalized template service
- deadstock markdown planning service
- supplier follow-up workflow setup

Phase 3:

- saved weekly dashboard
- lightweight alerts
- read-only Shopify connector after demand is proven

## Success Criteria

The first static MVP is successful if:

- a user can run the sample CSV in under 2 minutes
- a user can understand the result without inventory-planning jargon
- the first result section clearly answers which SKUs need action this week
- stockout and deadstock outputs feel credible on sample data
- supplier follow-up copy is specific enough to paste-edit-send
- the page works on mobile and desktop
- the tool is ready for both Dock to AI embed and standalone preview
- REVIEW-GATE has no P0 blocker before private beta review

## Out Of Scope

Not included in v0:

- Shopify OAuth
- direct Shopify Admin sync
- automatic CSV cleanup from arbitrary exports
- probabilistic demand forecasting
- seasonality modeling
- supplier performance scoring
- PO creation
- email sending
- login or saved history
- subscription

## Open Questions

Carried forward from v0.1:

- Which normalized CSV template should be treated as the single canonical v0 input for Esther review?
- Should the first result screen show both stockout and deadstock-candidate tables immediately, or collapse deadstock below the primary action table on mobile?
- Is email capture completely deferred until after static MVP review, or should the UI reserve a clear future CTA area?
- What exact public wording is safe around Stocky sunset before direct merchant interviews are completed?

PM resolutions from the SME open-items list (proposed, pending Esther approval):

- **Column name:** use `committed_units` (matches Stocky and Shopify Liquid semantics; clearer than `committed` alone).
- **Sample CSV:** add `committed_units` column with realistic small values, including at least one row where committed materially reduces available inventory.
- **Data Quality panel placement (mobile):** below the action summary, above the stockout table — see UX-SPEC §5.2.
- **Supplier draft template selection:** auto-select by urgency; "Switch to standard / Switch to urgent" link visible in the draft panel.

Esther approval still required on each of these four resolutions before build starts.
