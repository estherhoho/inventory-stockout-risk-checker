# Inventory Stockout Risk Checker

## One-line Description

A CSV-first static inventory analysis tool for Shopify and ecommerce operators. It highlights stockout risk, deadstock, days of cover, reorder urgency, and supplier follow-up actions using deterministic formulas.

## Current Stage

```text
Planning complete for first static MVP. Build not started yet.
```

## Operating Pattern

This project intentionally follows the working pattern from Container Utilization Checker:

- one tool, one project folder
- static HTML/CSS/JS
- deterministic calculation layer
- rule-based recommendation layer
- sample data plus fixture tests
- mobile-first Dock to AI and standalone readiness

## Target Users

- Shopify / DTC merchants
- ecommerce operators
- founders managing inventory via spreadsheet exports
- fractional ops or supply chain consultants

## First Static MVP

Upload a normalized CSV or try sample data to get:

- SKUs analyzed
- high stockout-risk count
- deadstock count
- cash tied up
- top weekly actions
- days of cover
- reorder quantity estimate
- copyable supplier follow-up draft

## AI Element

The calculation layer is deterministic. AI or rule-based copy is used only for:

- explaining the result
- drafting supplier follow-up language
- presenting action-plan text

## Key Files

- `PRODUCT-SPEC.md`
- `data/notes/DATA-PLAN.md`
- `docs/UX-SPEC.md`
- `DEV-PLAN.md`
- `REVIEW-GATE.md`
- `ROADMAP.md`

## Run Locally

Intended first local path:

```bash
cd /Users/estherho/sc_product/products/inventory-stockout-risk-checker/code
python3 -m http.server 8767
```

Open:

```text
http://127.0.0.1:8767/
```

## Test

Planned fixture runner:

```bash
node tests/run-fixtures.js
```

## Sample Data

```text
data/sample/shopify-inventory-sample.csv
```

## Canonical Folder

```text
/Users/estherho/sc_product/products/inventory-stockout-risk-checker/
```

## Website URL Target

```text
https://www.docktoai.com/toolkit/inventory-stockout-risk-checker
```
