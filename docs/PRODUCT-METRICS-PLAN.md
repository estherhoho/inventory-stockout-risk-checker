# Product Metrics Plan — Inventory Stockout Risk Checker

**Version:** v0 (pre-launch)
**Author:** Performance Analyst, Product Build Squad
**Date:** 2026-06-06
**Status:** Before-launch metrics plan. Delivered during the DOC-60 build so the lightweight instrumentation hooks (§10) can be baked in now instead of retrofitted later. Post-launch interpretation happens later, only when real data exists.

---

## Honesty note (read first)

v0 is a **static HTML/CSS/JS tool, processed browser-local, with no backend and no public launch.** That means:

- There is **no analytics and no usage data today.** Nothing here reports observed numbers — there are none yet.
- There is **no baseline** (no prior version, no traffic).
- The reference product Esther liked (Container Utilization Checker) shipped with qualitative success criteria and **no instrumentation** — so this plan stays deliberately light and opt-in, not a heavy analytics build.

All target numbers below are **directional first-read targets**, to be replaced by observed data after real sessions. Do not treat them as validated.

---

## 1. Product / tool name

**Inventory Stockout Risk Checker** (库存断货风险检查器). Route: `/toolkit/inventory-stockout-risk-checker`.
v0 = static CSV-first MVP, browser-local, hybrid UI (Option 5 sidebar shell + Option 1 numbered Action Digest as the Overview tab).

## 2. Primary success metric

**Decision completion rate** — the share of test sessions that go: data loaded (sample or own CSV) → a clear weekly action answer is rendered (Overview action list) → one concrete action taken (copy a supplier draft **or** edit a lead time **or** open a flagged SKU).

This maps directly to the core job-to-be-done — *"which SKUs need action this week?"* A static tool's value is **time-to-decision and an action taken**, not pageviews. (For a future public launch the business north star is tool → consultation-CTA conversion, but that is premature in v0; decision completion is the leading indicator that earns the right to measure conversion later.)

## 3. Supporting metrics

- **Activation:** % of sessions that load any data (sample or upload) vs. bounce on the empty state.
- **Sample → own-CSV progression:** % who try the sample, then upload their own file (real intent signal).
- **Time-to-first-answer:** seconds from data load to the Overview action list rendering (Success Criteria target: full session < 2 min; sample should be seconds).
- **Supplier-draft copy rate:** % of sessions copying ≥1 draft, split by template (standard vs. urgent expedite). Likely the "aha" / value moment.
- **Lead-time inline-edit usage:** % of sessions using the per-row edit — validates the SME hypothesis that operators guess lead time and need to test 30/45/60 days.
- **Validation-error rate:** % of uploads that fail validation — the single biggest killer of a CSV-first tool.
- **Module engagement:** which tabs get viewed (Overview / Stockout Risk / Deadstock / Supplier Draft / Formulas) — tells us whether the Overview-first bet pays off and which modules earn their place.
- **Data Quality completeness:** distribution of "N of 6 optional fields present" in real uploads — drives the future schema/adapter roadmap.
- **Repeat / weekly usage:** matches the recurring-ops mental model; only measurable later with a returning-visitor signal — in v0, captured qualitatively from dogfooding.

## 4. Events / behaviors to track

All anonymous and aggregate. **Never** CSV row contents, SKU / product / vendor names, costs, or any uploaded value.

| Event | Aggregate props (examples) |
|---|---|
| `tool_loaded` | — |
| `sample_loaded` | — |
| `csv_uploaded` | row-count bucket, # optional fields present (0–6) |
| `validation_error` | category: missing_column / invalid_number / duplicate_sku |
| `results_rendered` | high_risk_count bucket, deadstock_count bucket |
| `module_viewed` | tab: overview / stockout / deadstock / supplier / formulas |
| `sku_row_expanded` | — |
| `lead_time_edited` | — |
| `supplier_draft_copied` | template: standard / urgent |
| `cta_clicked` | target: consultation / future-cta (when added) |

## 5. Data source

- **v0 preview / private beta — primary source is qualitative dogfooding** (Esther + squad test sessions, notes recorded). State plainly: there is no automatic usage data by design.
- **Optional, opt-in, Esther-approved later:** a privacy-first, **cookieless** event counter that receives only the anonymous aggregate events in §4. Until approved, the tracking layer is a **no-op stub** (calls go nowhere) — keeping v0 fully within the browser-local / no-upload guardrail while pre-placing the call-sites.
- **Future public launch:** standard cookieless **site** analytics on the `/toolkit/` route for visits, source, and CTA conversion — kept separate from the in-tool event layer.

## 6. Baseline

**None.** No prior version, no traffic, no analytics. First real sessions establish the baseline. Treat every target as directional until then.

## 7. Review cadence

- Build / QA phase: n/a (no users).
- Private beta / dogfooding: review after each batch of ~5–10 test sessions (qualitative).
- Post public launch (future): weekly for the first 4 weeks, then monthly — matches the weekly-ops cadence the PM cited for choosing the sidebar shell.

## 8. Learning questions

- Do operators reach a clear weekly action without help? *(completion rate, time-to-answer)*
- Is the CSV schema a barrier? *(validation-error rate, optional-field distribution)*
- Does the Overview-first hybrid pay off, or do users immediately dive into the tables? *(module engagement)*
- Is the supplier draft the real value moment? *(draft copy rate, template split)*
- Do operators trust the math enough to test assumptions? *(lead-time edit usage)*
- Which optional columns matter most in real data? *(Data Quality distribution → schema roadmap)*

## 9. Minimum signal needed to decide next step

This is a small-sample, directional phase. With even **5–10 real test sessions**:

- Most sessions reach a clear action **and** copy a draft → tool works; proceed toward private-beta / launch-prep.
- Validation errors dominate → fix CSV onboarding (template / adapter) **before** anything else.
- Users never leave Overview / never copy a draft → the value moment is missing; revisit copy or the action list — **not a rebuild.**

Label all findings at this stage **directional, not statistically significant.** No launch or performance claims off < 30 sessions, and none published externally without Esther approval.

## 10. Recommended instrumentation / tracking setup *(time-sensitive — for the DOC-60 build)*

1. Add a single thin `track(event, props)` function and call it at the ~10 behavioral moments in §4.
2. **Default it to a no-op** — no network call, no cookie, no third-party script. v0 ships fully within the browser-local / no-upload privacy stance and needs **no** Esther approval to merge (it is not a stop-gate item: no public launch, no prod deploy, no paid API, no OAuth, no external contact, no scope expansion).
3. **Why now:** placing these call-sites during the live build costs minutes; retrofitting them after launch is a rebuild — which the guardrails say to avoid. If the build is already finished, the hooks can be added in the QA-fix pass without a rebuild (just new call-sites).
4. Keep every prop anonymous and aggregate (buckets / labels). Never CSV contents, SKU / product / vendor names, costs, or uploaded values.
5. Wiring the stub to a real cookieless analytics destination is a **separate, later, Esther-approved decision** (and would update the privacy note). Until then it stays dark.
6. For the public `/toolkit/` route later: standard cookieless site analytics for visits + CTA conversion, kept separate from the in-tool event layer.
