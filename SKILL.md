---
name: inventory-stockout-risk-checker
description: Use this skill to run, inspect, or modify the Dock to AI Inventory Stockout Risk Checker CSV analyzer.
---

# Inventory Stockout Risk Checker Skill

## Purpose

Help an AI agent understand and work on the Inventory Stockout Risk Checker without turning it into a full forecasting SaaS.

## Guardrails

- Keep v0 CSV-first.
- Keep calculations deterministic.
- Do not add Shopify OAuth unless explicitly requested.
- Do not send user CSV data to an external API in v0.
- Use AI only for explanation, action-plan, and supplier-email copy.

## Key Files

```text
PRODUCT-SPEC.md
DEV-PLAN.md
data/notes/DATA-PLAN.md
data/sample/shopify-inventory-sample.csv
code/index.html
code/styles.css
code/app.js
```

## Expected Workflow

1. Read `PRODUCT-SPEC.md`.
2. Read `data/notes/DATA-PLAN.md`.
3. Implement or inspect deterministic scoring.
4. Run fixture tests.
5. Update `REVIEW-GATE.md` with findings.

