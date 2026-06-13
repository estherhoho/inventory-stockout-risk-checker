# DATA-PLAN — Inventory Stockout Risk Checker

**Version:** 0.2 (post Domain Feasibility Review — [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260))
**Last updated:** 2026-06-06

## Objective

Define the normalized v0 CSV contract, deterministic formulas, rule thresholds, and fixture expectations for a browser-local static MVP.

This plan should follow the same implementation discipline as Container Utilization Checker:

- deterministic math first
- rule-based recommendation layer second
- sample data and fixture tests from the start
- clear edge-case handling before public review

## v0 Input Strategy

v0 should support exactly one normalized CSV schema.

Reason:

- keeps parsing deterministic
- keeps QA fixture coverage manageable
- avoids turning the MVP into an integration project
- matches Esther's CSV-first, static-tool guardrails

Raw Shopify exports can be a later roadmap item. For v0, the user either:

- uploads the normalized template
- downloads/adapts the sample schema
- uses the sample CSV for first-run review

## Canonical CSV Schema

Required columns:

| Column | Type | Description |
|---|---|---|
| `sku` | string | Variant or SKU identifier |
| `product_name` | string | Human-readable product or variant name |
| `inventory_on_hand` | number | Current on-hand units available now |
| `units_sold_30d` | number | Units sold in the last 30 days |
| `units_sold_90d` | number | Units sold in the last 90 days |
| `lead_time_days` | number | Supplier lead time in days |

Optional columns:

| Column | Type | Description |
|---|---|---|
| `unit_cost` | number | Unit cost for cash tied up calculation and estimated cash for reorder |
| `vendor` | string | Supplier or vendor name |
| `category` | string | Product category |
| `reorder_multiple` | number | MOQ/pack multiple for rounding reorder quantity |
| `incoming_units` | number | Confirmed inbound units already on order |
| `committed_units` | number | Units allocated to unshipped orders / open orders — subtracted from on-hand before any risk math. **Added 2026-06-06 per SME review** because on-hand without committed materially overstates available inventory and is the #1 cause of surprise stockouts. |

## Column Semantics

- `inventory_on_hand`
  - integer or decimal allowed in parser
  - displayed as unit count
  - negative values are invalid in v0 and should trigger `review data`
- `units_sold_30d` and `units_sold_90d`
  - should represent completed sales, not forecast
  - can be `0`
  - cannot be negative
- `lead_time_days`
  - must be operational lead time, not calendar promise date
  - can be `0` for locally sourced or instantly replenished items
- `incoming_units`
  - assumed to be reliable inbound quantity already expected
  - if missing, default to `0`
- `committed_units`
  - units already allocated to unshipped orders / open orders (Shopify exposes this; Stocky uses this naming)
  - cannot be negative
  - if missing, default to `0`
  - if greater than `inventory_on_hand`, available inventory is floored at `0` and a row-level warning is shown in the Data Quality panel ("committed exceeds on-hand for X SKUs")
- `reorder_multiple`
  - if missing or invalid, do not round the reorder quantity
  - if present, must be greater than `0`

## Sample CSV Policy

Canonical sample file:

```text
data/sample/shopify-inventory-sample.csv
```

Rules:

- fake but realistic merchant-style data only
- no customer or store-identifying information
- every major rule should be represented by at least one sample row

The current sample already covers:

- high stockout risk
- deadstock
- inbound inventory
- seasonal/slow mover
- cash tied up opportunity when `unit_cost` exists

## Deterministic Calculation Layer

## Base Derived Fields

```text
average_daily_sales_30d = units_sold_30d / 30
average_daily_sales_90d = units_sold_90d / 90
demand_run_rate = max(average_daily_sales_30d, average_daily_sales_90d)

committed_units_normalized = committed_units or 0
incoming_units_normalized = incoming_units or 0

available_inventory = max(0, inventory_on_hand - committed_units_normalized)
effective_inventory = available_inventory + incoming_units_normalized
```

Rationale:

- 30-day sales catch recent acceleration
- 90-day sales prevent one slow month from hiding steady demand
- taking `max(30d rate, 90d rate)` is a simple conservative heuristic that stays deterministic
- subtracting `committed_units` before computing risk prevents the "on-hand looks fine but available is empty" failure mode SMEs flagged as the #1 cause of surprise stockouts

Failure mode to document in the UI: when `units_sold_30d` rises while genuine demand is in decline, `max()` over-orders. Acceptable v0 tax in exchange for the simpler, more conservative stockout signal. Surface this as a single-line caveat in the formula panel.

## Days of Cover

```text
if demand_run_rate <= 0:
    days_of_cover = Infinity
else:
    days_of_cover = effective_inventory / demand_run_rate
```

Display rules:

- show `No recent sales` instead of the literal word `Infinity`
- still allow deadstock logic to run independently

## Stockout Risk

Constants:

```text
safety_buffer_days = max(7, ceil(0.25 * lead_time_days))   # SME: replaces the previous fixed 7-day buffer
medium_risk_extra_days = 14
```

Thresholds:

```text
risk_threshold_high = lead_time_days + safety_buffer_days
risk_threshold_medium = risk_threshold_high + medium_risk_extra_days
```

Worked examples (so future reviewers can sanity-check):

```text
lead_time_days = 14  -> safety_buffer_days =  7  -> high threshold =  21 days
lead_time_days = 30  -> safety_buffer_days =  8  -> high threshold =  38 days
lead_time_days = 45  -> safety_buffer_days = 12  -> high threshold =  57 days
lead_time_days = 60  -> safety_buffer_days = 15  -> high threshold =  75 days
```

Classification:

```text
high:
  demand_run_rate > 0
  and days_of_cover <= risk_threshold_high

medium:
  demand_run_rate > 0
  and days_of_cover > risk_threshold_high
  and days_of_cover <= risk_threshold_medium

low:
  everything else
```

Interpretation:

- `high` means likely to run short before or around the replenishment window
- `medium` means should be reviewed this week
- `low` means no immediate stockout signal from current data

## Deadstock Candidate Risk

**Naming (SME-required):** Use the label "Deadstock candidate" — never bare "Deadstock" — throughout UI, copy, and downstream documents. The data alone cannot distinguish a genuine deadstock SKU from a seasonal, promo-driven, or otherwise recoverable SKU, so the "candidate" framing makes the human-review requirement explicit.

Classification:

```text
high:
  inventory_on_hand > 0
  and days_of_cover > 180

low:
  everything else
```

Interpretation:

- `high` is a deadstock-candidate signal — **always paired with the Off-season candidate caveat** in the UI
- `low` is not a deadstock concern from current data

## Reorder Quantity

Constants:

```text
target_cover_days = lead_time_days + 30
```

Formula:

```text
raw_reorder_quantity = max(0, target_cover_days * demand_run_rate - effective_inventory)
```

Rounding:

```text
if reorder_multiple > 0:
    reorder_quantity = round_up_to_next_multiple(raw_reorder_quantity, reorder_multiple)
else:
    reorder_quantity = ceil(raw_reorder_quantity)
```

## Cash Tied Up

```text
if unit_cost exists:
    cash_tied_up = inventory_on_hand * unit_cost
    estimated_cash_for_reorder = reorder_quantity * unit_cost
else:
    cash_tied_up = null
    estimated_cash_for_reorder = null
```

Use on-hand inventory only, not inbound, because cash_tied_up is meant to show current cash already sitting in stock. `estimated_cash_for_reorder` is shown next to the reorder quantity in the UI so the operator sees the cash impact of placing the PO before doing it (SME requirement).

## Caveat Triggers (UI-Surfaced)

These are deterministic per-row or per-portfolio signals the UI must render alongside the numbers so the operator knows when not to trust the headline.

```text
NEWLY ACTIVE SKU (per row badge):
  units_sold_90d < units_sold_30d * 2.5
  -> 90d rate is unreliable because the SKU is likely <90 days old
  -> UI badge text: "Newly active — limited sales history"

OFF-SEASON CANDIDATE (per row caveat):
  deadstock_candidate_risk == high
  -> always show: "Off-season SKUs may appear here. Confirm against your assortment calendar before marking down."

VERIFY NET OF RETURNS (portfolio banner):
  always show above the stockout-risk table
  -> "Make sure units_sold_30d and units_sold_90d are NET of returns. Shopify's default order export is gross."

BUNDLES / KITS (portfolio note in formula panel):
  -> "Bundles and kits are not exploded into components. Treat parent and components as separate inputs or component-level risk will be missed."

COMMITTED EXCEEDS ON-HAND (Data Quality panel warning):
  committed_units_normalized > inventory_on_hand
  -> count such rows in the Data Quality panel; available_inventory is floored at 0
```

## Data Quality Panel

Renders at the top of the result body (below the action summary, above the tables on mobile). Surfaces which optional fields were used vs missing, plus any structural warnings from validation.

Schema of what to show:

```text
Required columns: all present (block ALWAYS true to render results)

Optional columns:
  ✓ unit_cost          -> "Cash-tied-up and estimated cash for reorder enabled"
  ✓ vendor             -> "Supplier draft personalized"
  ✓ incoming_units     -> "Inbound counted in effective inventory"
  ✓ committed_units    -> "Committed units subtracted from available inventory"
  ○ reorder_multiple   -> "Reorder qty not rounded to MOQ"
  ○ category           -> "Category not available for segmentation"

Row-level warnings (only when triggered):
  - Newly active SKU count: N
  - Committed exceeds on-hand row count: N
  - Negative inventory (review data): N
  - Duplicate SKU (review data): N
```

The panel must not block analysis when optional fields are missing — graceful degradation only.

## Rule-Based Recommendation Layer

The recommendation layer must stay deterministic and explainable.

Priority order:

1. `review data`
2. `markdown`
3. `expedite`
4. `reorder`
5. `hold`

Rules (SME-updated):

```text
review data:
  required field missing
  invalid numeric value
  duplicate SKU unresolved
  negative inventory
  negative sales
  negative committed_units

markdown:
  deadstock_candidate_risk == high
  (always paired with Off-season candidate caveat in UI)

expedite:
  stockout_risk == high
  and days_of_cover < lead_time_days
  and reorder_quantity > 0
  -> UI label includes "projected days short = lead_time_days - days_of_cover"

reorder:
  stockout_risk == high
  and reorder_quantity > 0
  and not expedite

hold:
  everything else
```

Why `markdown` ranks above `expedite`:

- if a SKU has zero 90-day sales and inventory on hand, the more urgent issue is excess stock, not replenishment

SME change to `expedite`: the old rule fired when `incoming_units > 0 but insufficient`. New rule fires whenever the SKU is projected to run out before normal replenishment can land (`days_of_cover < lead_time_days`), regardless of inbound, because that is the actual operator decision — "do I need to pay for air-freight or rush the supplier?" The UI surfaces "projected days short" so the operator can weigh the expedite premium against the lost-sale risk.

## Supplier Draft Inputs

Two deterministic templates ship in v0. Auto-select by urgency; surface a one-click switch.

### Template 1 — Standard reorder

Trigger: `stockout_risk == high` AND `days_of_cover >= lead_time_days`

Fields used:

- `vendor` (or generic placeholder when missing)
- `sku`, `product_name`
- `inventory_on_hand`, `incoming_units_normalized`, `days_of_cover`
- `lead_time_days`, requested-by date = today + `lead_time_days`
- `reorder_quantity`
- `unit_cost` (shown as "Last unit cost" when present, otherwise "—")

Asks: confirm availability/updated lead time, current pricing/MOQ, earliest ship date.

### Template 2 — Urgent expedite

Trigger: `stockout_risk == high` AND `days_of_cover < lead_time_days` (the `expedite` action)

Fields used:

- `vendor` (or generic placeholder when missing)
- `sku`, `product_name`
- `inventory_on_hand`, `days_of_cover`
- `lead_time_days`, **projected_days_short = lead_time_days - days_of_cover**
- `reorder_quantity`

Asks: fastest possible ship date, expedite/air-freight cost, partial early shipment.

### Templates NOT shipped in v0

- Markdown / deadstock email — markdown decisions are internal or customer-facing, not supplier-facing. Shipping a half-thought template invites misuse.

## Validation Rules

Required structural checks:

- header row must exist
- all required columns must be present
- file must contain at least 1 analyzable row

Field-level checks:

- `sku` cannot be blank
- `product_name` cannot be blank
- numeric fields must parse to finite numbers
- `inventory_on_hand`, `units_sold_30d`, `units_sold_90d`, `incoming_units`, `committed_units` cannot be negative
- `lead_time_days` must be between `0` and `365`
- `unit_cost` cannot be negative if present
- `reorder_multiple` must be greater than `0` if present
- `lead_time_days` is inline-editable post-upload; the recalc must run client-side without re-uploading the file

Duplicate handling:

- duplicate `sku` rows should fail validation in v0
- do not auto-aggregate in the first release
- error copy should tell the user to consolidate duplicate SKU rows before upload

## Error Messaging Requirements

Examples:

- `Missing required column: lead_time_days`
- `Invalid number in units_sold_30d for SKU SKU-1004`
- `Duplicate SKU found: SKU-1002`
- `Negative inventory is not supported in v0: SKU-1045`

## Edge Cases

- new SKU with sales in 30d but thin 90d history → Newly active SKU badge
- seasonal SKU with old inventory and current zero demand → high deadstock candidate + Off-season caveat
- SKU with inbound units that still does not cover lead time → `expedite` action
- SKU with zero sales and zero inventory → `hold` (no signal)
- missing `unit_cost`, so cash tied up cannot be shown → Data Quality panel notes the gap
- missing `vendor`, so supplier draft becomes generic
- extremely high lead time that inflates reorder quantity → cash for reorder is shown so operator sees the impact
- duplicate SKU rows from export cleanup mistakes → fail validation, `review data`
- `committed_units > inventory_on_hand` → available_inventory floored at 0, warning shown in Data Quality panel
- bundle/kit parent SKU → not exploded; caveat shown in formula panel
- returns inflate `units_sold_30d` → cannot detect from data alone; "Verify net of returns" banner shown above stockout table

## Merchant Validation Questions

- Does `days of cover` feel understandable, or should the default label be more plain-English?
- Is the `max(30d run rate, 90d run rate)` heuristic directionally credible enough for a first-pass tool?
- Would merchants trust `incoming_units` enough to include it in the main calculation?
- Is deadstock candidate defined credibly enough as `inventory_on_hand > 0 and days_of_cover > 180`, or do we need a clearer seasonal/promo caveat?
- Is a rule-based supplier draft useful before any true AI layer is added?

## Fixture Coverage

Test fixtures should cover at least:

- high stockout risk with no inbound
- high stockout risk with inbound but still insufficient
- medium stockout risk
- low stockout risk
- high deadstock
- slow mover / medium deadstock
- zero sales and zero inventory
- missing required column
- invalid numeric field
- duplicate SKU
- missing optional columns

Recommended fixture files:

```text
tests/fixtures/valid-sample.csv
tests/fixtures/duplicate-sku.csv
tests/fixtures/missing-required-column.csv
tests/fixtures/invalid-number.csv
tests/fixtures/committed-exceeds-onhand.csv          # SME edge: warning surfaced in Data Quality panel
tests/fixtures/newly-active-sku.csv                  # 90d < 30d * 2.5
tests/fixtures/expedite-projected-days-short.csv     # days_of_cover < lead_time
tests/fixtures/long-lead-time-buffer.csv             # exercises max(7, ceil(0.25 * lead_time_days))
```

## Suggested Sample Row Expectations

Using the current sample CSV (now with `committed_units`):

- `SKU-1001` — low/medium stockout risk after committed_units is subtracted; demonstrates the Data Quality panel "committed counted" line
- `SKU-1002` — reorder due, inbound partially covers lead time, demonstrates standard supplier draft
- `SKU-1004` — high stockout risk, **expedite** (days_of_cover < lead_time after committed_units subtracted), demonstrates urgent template auto-selection and projected-days-short label
- `SKU-1005` — high deadstock candidate, paired with Off-season candidate caveat
- `SKU-1007` — Newly active SKU badge candidate (90d < 30d * 2.5 if values warrant)
- `SKU-1008` — zero on-hand with inbound; remains analyzable
- `SKU-1010` — high deadstock candidate; demonstrates the seasonal false-positive narrative (Holiday Gift Wrap)

## Verification Checklist

- sample CSV loads without validation errors
- formulas produce stable outputs across reruns
- every action label is traceable to a deterministic rule
- error states explain what the user must fix
- optional fields do not block analysis
