# DEV-PLAN — Inventory Stockout Risk Checker

**Version:** 0.2 (post Domain Feasibility Review — [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260))
**Last updated:** 2026-06-06
**Status:** Awaiting Esther approval. Developer should NOT start implementation until Esther approves PRODUCT-SPEC + DATA-PLAN + UX-SPEC and the UX Product Designer's Interface Playground (5 options) lands and is selected.

## Build Type

Static HTML/CSS/JS.

This should intentionally follow the container checker implementation pattern:

- browser-local processing
- deterministic logic in plain JavaScript
- rule-based recommendation layer
- sample data plus fixture tests
- standalone and Dock to AI embed readiness

## Esther-Confirmed v0 Constraints

- build a static CSV analyzer, not a forecasting SaaS
- support one normalized CSV schema only
- do not add Shopify OAuth
- do not upload or store user CSV data
- do not add backend services
- keep AI use limited to explanation and supplier draft copy
- keep any gated-report or email-capture idea out of the first static MVP

## One-Tool-One-Project Structure

```text
/Users/estherho/sc_product/products/inventory-stockout-risk-checker/
├── PRODUCT-SPEC.md
├── DEV-PLAN.md
├── REVIEW-GATE.md
├── ROADMAP.md
├── LAUNCH-CHECKLIST.md
├── README.md
├── SKILL.md
├── code/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/
│   ├── sample/
│   └── notes/
├── docs/
│   └── UX-SPEC.md
├── tests/
└── feedback/
```

## Build Goal

Ship a reviewable static MVP that:

- lets the user upload a normalized CSV or load sample data
- validates required columns and rows
- calculates stockout risk, deadstock risk, days of cover, and reorder quantity
- renders an action-first result view
- generates a copyable supplier follow-up draft from deterministic data

## Core Files

```text
code/
├── index.html
├── styles.css
└── app.js

tests/
├── run-fixtures.js
└── fixtures/
```

## App Architecture

Recommended structure inside `code/app.js`:

- CSV parsing utilities
- validation utilities
- deterministic calculation utilities
- rule-based recommendation utilities
- rendering functions
- event wiring

Suggested function list (SME-updated):

`parseCsv(text)`

- convert CSV text into row objects

`validateHeaders(headers)`

- confirm required columns

`validateRows(rows)`

- return row-level errors and analyzable rows
- check `committed_units` non-negative

`normalizeRow(row)`

- coerce values and set defaults for optional fields, including `committed_units_normalized` and `incoming_units_normalized`

`computeSafetyBufferDays(leadTimeDays)`

- return `Math.max(7, Math.ceil(0.25 * leadTimeDays))`

`calculateInventoryMetrics(row)`

- return:
  - demand run rate
  - available inventory (`inventory_on_hand - committed_units`, floored at 0)
  - effective inventory (`available_inventory + incoming_units`)
  - days of cover
  - safety_buffer_days
  - stockout risk
  - deadstock-candidate risk
  - reorder quantity
  - cash tied up
  - estimated_cash_for_reorder (when unit_cost present)
  - projected_days_short = `max(0, lead_time_days - days_of_cover)`

`evaluateCaveats(row, metrics)`

- return flags for:
  - `newlyActiveSku` (when `units_sold_90d < units_sold_30d * 2.5`)
  - `offSeasonCandidate` (when `deadstock_candidate_risk == 'high'`)
  - `committedExceedsOnHand` (when `committed_units > inventory_on_hand`)

`determineAction(rowMetrics)`

- return:
  - `reorder`
  - `expedite` (when stockout high AND days_of_cover < lead_time_days)
  - `markdown`
  - `hold`
  - `review data`

`selectSupplierTemplate(rowMetrics)`

- return `'urgent_expedite'` when action == `expedite`, otherwise `'standard_reorder'`

`buildSupplierDraft(rowMetrics, templateKey)`

- return copyable template text for the requested template key
- support manual override of templateKey from the UI switch link

`summarizeDataQuality(headers, optionalFieldsPresent, rowWarnings)`

- return panel content:
  - which optional columns were used
  - which optional columns were missing and the resulting consequence string
  - row-warning counts (newly active, committed exceeds on-hand, review data)

`summarizePortfolio(results)`

- return:
  - sku count
  - high-risk count
  - deadstock-candidate count
  - total cash tied up
  - dominant action breakdown

`recalcRowForLeadTimeEdit(row, newLeadTimeDays)`

- run validation + calculateInventoryMetrics + evaluateCaveats + determineAction + selectSupplierTemplate on the single edited row
- update the row in-place and trigger a re-render of the affected table cells, supplier draft, and Data Quality counts (if the warning crosses a threshold)

`renderResults(summary, rows, dataQuality)`

- render metrics, Data Quality panel, "Verify net of returns" banner, ranked tables, supplier draft panel with template-switch link, and formula/caveat panel

## UI Structure

The page should stay tool-first, like the container checker:

- hero/tool intro
- privacy/local-processing note
- upload zone plus sample CSV button
- validation summary state
- results section (SME-updated priority):
  - weekly action summary
  - Data Quality panel
  - "Verify net of returns" banner
  - stockout ranked table (with inline-editable lead time and per-row Newly active SKU badges)
  - deadstock-candidate and cash table (with per-row Off-season candidate caveat)
  - supplier draft panel (two templates, auto-selected, with switch link)
  - formulas and caveats

## UI States

- empty state
- sample-data loaded state
- uploading/parsing state
- validation error state
- valid result state
- no analyzable rows state
- mobile layout

## Fixture Test Plan

Minimum fixtures (SME-updated):

- valid sample
- duplicate SKU
- missing required column
- invalid number
- stockout high (standard reorder)
- stockout high with days_of_cover < lead_time (urgent expedite + projected days short)
- deadstock candidate high
- inbound but still high risk
- committed exceeds on-hand (available_inventory floors at 0; Data Quality panel warns)
- newly active SKU (units_sold_90d < units_sold_30d * 2.5)
- long lead time (60+ days, exercises max(7, ceil(0.25 * lead_time_days)))
- inline lead-time-edit recalc (start at 30, edit to 60, verify action transitions from reorder to expedite)

Recommended test responsibilities:

- parser tests
- formula sanity tests (worked examples for safety buffer, available inventory with/without committed)
- rule-action mapping tests
- caveat-trigger tests (newly active, off-season, verify net of returns)
- supplier template auto-selection tests
- inline lead-time edit recalc tests

## Acceptance Criteria

- fixture runner passes locally
- sample CSV loads and produces credible results
- invalid CSV produces understandable errors
- mobile layout supports upload, review, and copy actions
- no result depends on a non-deterministic AI call
- REVIEW-GATE has no P0 blocker before preview review

## Local Run

Recommended simple local path:

```bash
cd /Users/estherho/sc_product/products/inventory-stockout-risk-checker/code
python3 -m http.server 8767
```

Then open:

```text
http://127.0.0.1:8767/
```

## Deployment

Prepare for both:

- Dock to AI toolkit embed
- standalone Vercel preview

Do not public launch until:

- static MVP exists
- fixture tests pass
- REVIEW-GATE is updated after QA
- Esther review is completed with Chinese summary and links
