# Inventory Stockout Risk Checker - Static MVP

Static HTML/CSS/JS MVP for the Dock to AI Inventory Stockout Risk Checker.

## Run Locally

```bash
cd /Users/estherho/sc_product/products/inventory-stockout-risk-checker/code
python3 -m http.server 8767
```

Open:

```text
http://127.0.0.1:8767/
```

The sample CSV is embedded in `app.js` so `Try Sample CSV` works from the recommended `code/` server root. Uploaded CSVs are parsed locally in the browser and are not sent anywhere.

## Run Fixture Tests

```bash
cd /Users/estherho/sc_product/products/inventory-stockout-risk-checker
node tests/run-fixtures.js
```

## MVP Inputs

Required CSV columns:

- `sku`
- `product_name`
- `inventory_on_hand`
- `units_sold_30d`
- `units_sold_90d`
- `lead_time_days`

Optional CSV columns:

- `unit_cost`
- `vendor`
- `category`
- `reorder_multiple`
- `incoming_units`
- `committed_units`

## MVP Outputs

- Weekly action list
- Data Quality panel
- Stockout Risk table with inline `lead_time_days` edits
- Deadstock Candidate table
- Supplier Draft panel with standard reorder and urgent expedite templates
- Formula and caveat reference
