# REVIEW-GATE — Inventory Stockout Risk Checker

**Version:** 0.2 (post Domain Feasibility Review — [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260))
**Last updated:** 2026-06-06

## Status

Static MVP build pass complete. Supply Chain SME Domain Feasibility Review incorporated. Product spec, data plan, UX spec, dev plan, selected hybrid UX direction, code implementation, and fixture tests are now aligned around the SME-validated static MVP scope.

**Ready for Product QA review.** Public launch is still not approved.

## SME Recommendation

**BUILD** — after the five v0 adjustments are baked in (see PRODUCT-SPEC §SME-Validated v0 Adjustments).

## Launch Recommendation

Not ready for public launch.

Recommended next stage:

```text
Esther approval (gate 1) -> Interface Playground (5 options) -> Esther design selection ->
Static MVP build -> fixture tests -> Vercel preview -> Esther approval (gate 2) ->
private beta decision -> Esther approval (gate 3, public launch)
```

## Review Levels

### P0 — Must Fix Before Any Reviewable Build Is Shared

- [x] CSV-first scope is explicit.
- [x] No Shopify OAuth in v0.
- [x] Deterministic formula layer is documented (SME-validated 2026-06-06).
- [x] Rule-based recommendation layer is documented.
- [x] Browser-local privacy stance is documented.
- [x] `committed_units` added as optional column; `available_inventory` subtracts it before risk math.
- [x] Safety buffer scales with lead time: `max(7, ceil(0.25 * lead_time_days))`.
- [x] `expedite` rule fires on `days_of_cover < lead_time_days` and surfaces projected days short.
- [x] Two supplier templates specified (standard reorder, urgent expedite) with auto-select + manual switch.
- [x] Data Quality panel specified.
- [x] Three caveat triggers specified (Newly active SKU, Off-season candidate, Verify net of returns).
- [x] Deadstock label renamed to "Deadstock candidate" throughout the spec.
- [x] Inline-editable `lead_time_days` per row specified.
- [x] Esther approves PRD package (gate 1).
- [x] Interface Playground (5 options) produced by UX Product Designer.
- [x] Esther selects/combines/rejects the design direction.
- [x] Static HTML/CSS/JS MVP exists.
- [x] Sample CSV (with `committed_units`) is wired into the UI.
- [x] Fixture tests exist and pass.
- [x] Invalid CSV produces clear UI errors.

### P1 — Must Fix Before Private Beta or Public Positioning

- [x] Stocky sunset is treated as evidence-backed context, not a guaranteed public claim.
- [x] Tool-first mobile-first result structure is documented.
- [x] Chinese Esther review summary is prepared.
- [x] Mobile UI reviewed in screenshots or preview.
- [x] Desktop UI reviewed in screenshots or preview.
- [ ] Standalone preview URL exists.
- [ ] Dock to AI embedded preview is checked.
- [x] Supplier draft copy is credible on real fixture rows.
- [x] DATA-PLAN.md deadstock-candidate formula updated to match the shipped 180-day cover threshold behavior and candidate wording.
- [x] Overview and Deadstock tab cash labels disambiguated as "Deadstock cash at risk."

### P2 — Should Improve Before Scale

- [ ] Raw Shopify export adapter.
- [ ] Downloadable normalized CSV template.
- [ ] More nuanced seasonal/launch SKU caveats.
- [ ] Email capture or feedback capture.
- [ ] Bulk supplier draft export.

### P3 — Nice To Have

- [ ] Saved report export.
- [ ] Read-only Shopify connector after validation.
- [ ] Consultant handoff PDF/report mode.
- [ ] AI summary layer for full portfolio narrative.

## Formula Sanity Checks (SME-updated)

- [x] `available_inventory = max(0, inventory_on_hand - committed_units)`; `committed_units` defaults to 0 when missing.
- [x] `effective_inventory = available_inventory + incoming_units`.
- [x] `days_of_cover` uses `effective_inventory` and shows `No recent sales` when demand run rate is `0`.
- [x] `safety_buffer_days = max(7, ceil(0.25 * lead_time_days))`.
- [x] high stockout risk triggers when `days_of_cover <= lead_time_days + safety_buffer_days`.
- [x] expedite triggers when stockout is high AND `days_of_cover < lead_time_days`; label includes projected days short.
- [x] deadstock-candidate high/candidate rows use "candidate" wording.
- [x] reorder quantity rounds up to `reorder_multiple` when present.
- [x] `cash_tied_up = inventory_on_hand * unit_cost`.
- [x] `estimated_cash_for_reorder = reorder_quantity * unit_cost` shown when `unit_cost` exists.
- [x] Newly active SKU badge triggers when `units_sold_90d < units_sold_30d * 2.5`.
- [x] Off-season candidate caveat is always paired with deadstock-candidate rows.
- [x] "Verify net of returns" banner is always present above the stockout-risk table.
- [x] Committed-exceeds-on-hand row count surfaces in the Data Quality panel.
- [x] action priority handles `review data` before any business recommendation.
- [x] Inline `lead_time_days` edit recalcs metrics, action, and supplier template without re-upload.

## Static MVP Scope Recommendation

Recommended first shipping scope:

- one normalized CSV template only
- one upload screen with sample-data shortcut
- one action-first results screen
- one ranked stockout table
- one deadstock/cash section
- one copyable supplier draft panel
- one formula/caveat section

Explicitly deferred:

- raw Shopify export parsing
- OAuth
- dashboards
- saved state
- email sending
- forecasting
- subscriptions

## Open Questions

Carried forward:

- Should the first mobile result show the deadstock-candidate table expanded or collapsed below stockout actions?
- Should we include a visible but inactive future CTA area, or keep the first MVP purely operational?
- What exact public phrasing should replace "Stocky replacement" until merchant conversations are complete?

Resolved by SME review, pending Esther confirmation:

- ✅ Column name: `committed_units` (vs `committed` / `reserved`)
- ✅ Sample CSV adds `committed_units` column with realistic values
- ✅ Data Quality panel below action summary, above tables on mobile
- ✅ Supplier draft auto-selects by urgency with one-click switch link

## Product QA Review — 2026-06-06

**Reviewer:** Product QA Reviewer (DOC-61)
**Status:** APPROVE FOR ESTHER BUILD-PREVIEW REVIEW

### P0 — Blockers Before Esther Preview

None.

### P1 — Fix Before Private Beta

- [x] **DATA-PLAN.md documents deadstock threshold as `units_sold_90d == 0`/`<= 3`, but the code uses `daysOfCover > 180`.** Fixed: DATA-PLAN.md now documents the 180-day cover threshold and candidate wording.
- [x] **"Cash tied up" metric card in Overview shows only deadstock-candidate cash ($2,296), not total portfolio cash.** Fixed: Overview metric and Deadstock tab header now use "Deadstock cash at risk."

### P2 — Improve Before Scale

- [ ] `metrics.urgency` field (EXPEDITE/REORDER/HOLD) is computed in `calculateInventoryMetrics` but never read by the UI or action logic. Dead code. Remove or use it.
- [ ] Newly active SKU caveat in code uses `units_sold_30d > 0 &&` guard not documented in DATA-PLAN.md. The guard prevents false positives when 30d sales = 0 (reasonable improvement). Document in DATA-PLAN.md.

### Verified Pass

- [x] `node --check code/app.js` — PASS
- [x] `node tests/run-fixtures.js` — 10/10 PASS
- [x] Sample CSV loads, all modules render (Overview, Stockout Risk, Deadstock, Supplier Draft, Formulas)
- [x] Formula verification against DATA-PLAN.md: `available_inventory`, `effective_inventory`, `days_of_cover`, `safety_buffer_days`, `stockoutRisk` thresholds, `expedite` rule, `reorder_quantity`, `reorder_multiple` rounding, `cash_tied_up`, `estimated_cash_for_reorder` — all correct
- [x] Sample CSV SKU results verified: stockoutHigh=4, deadstock=3, totalCashTiedUp=$2,296, SKU-1004 daysOfCover=1.2/expedite/reorderQty=108
- [x] Inline lead_time edit recalcs action and supplier template (fixture test + screenshot confirm)
- [x] No external network calls in `track()` — stub confirmed inert
- [x] No Shopify OAuth, no backend storage, no paid API calls, no login
- [x] Error state renders with actionable copy ("Fix the issues below or try the sample file")
- [x] Validation catches: missing required column, invalid number, duplicate SKU, negative inventory, committed > on-hand
- [x] Data Quality panel shows optional field usage and row-level warnings
- [x] Supplier draft: two templates (standard reorder / urgent expedite), auto-selection by urgency, one-click switch visible
- [x] "Verify net of returns" banner present above stockout table
- [x] Off-season candidate caveat present on all deadstock-candidate rows
- [x] Desktop layout: sidebar nav, metric cards, action list, Data Quality panel — professional SaaS quality
- [x] Mobile layout: bottom tabs, scrollable action list, Data Quality panel below summary — acceptable for MVP
- [x] Privacy notice in sidebar: "CSV is processed locally in your browser. No login, upload, or storage."
- [x] "Deadstock candidate" wording used consistently (not bare "deadstock")
- [x] REVIEW-GATE P0/P1 checklist items all verified against code

### QA Recommendation

**APPROVE FOR ESTHER BUILD-PREVIEW REVIEW.**

No P0 blockers. The two P1 documentation/label issues from QA have been fixed in place. The tool meets all functional success criteria in PRODUCT-SPEC.md.

---

## Esther Review Summary

See:

```text
/Users/estherho/sc_product/products/inventory-stockout-risk-checker/feedback/2026-06-05-esther-review-summary-zh.md
```

Short version:

- 方向是对的，且应明确复用 Container Utilization Checker 的产品化模式。
- 第一版不要做成完整补货 SaaS，只做静态 CSV 工具。
- 结果页优先回答“本周哪些 SKU 要处理”。
- 下一步不是 launch，而是按文档把 static MVP 做出来并跑 fixtures。
