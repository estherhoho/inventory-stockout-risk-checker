# ROADMAP — Inventory Stockout Risk Checker

## v0.1 — PRD / Data / UX Alignment

- sharpen `PRODUCT-SPEC.md`
- complete `data/notes/DATA-PLAN.md`
- create `docs/UX-SPEC.md`
- refine `DEV-PLAN.md`
- document recommended static MVP scope
- prepare Chinese Esther review summary

## v0.2 — Static CSV Analyzer MVP

- build static HTML/CSS/JS app
- support one normalized CSV schema
- add sample CSV loader
- validate required columns and numeric fields
- calculate stockout risk, deadstock risk, days of cover, reorder quantity, and cash tied up
- render action-first results
- generate rule-based supplier follow-up draft
- no OAuth, no storage, no forecasting, no email sending

## v0.3 — Review Preview

- add fixture tests
- run local QA
- capture desktop and mobile screenshots
- create standalone preview
- check Dock to AI embed readiness
- update `REVIEW-GATE.md`
- share Chinese quick review summary with links

## v1.0 — Private Beta

- 5-10 merchant review conversations
- validate normalized CSV usability
- validate Stocky-sunset positioning language
- collect feedback on action labels and supplier draft usefulness

## v1.1 — Structured Import Expansion

- optional raw Shopify export adapter
- downloadable normalized CSV template
- richer validation help
- optional feedback capture

## Later

- read-only Shopify connector after demand is proven
- saved reports or weekly dashboards
- gated report mode
- broader inventory planning workflows
