# Esther Review Summary — Inventory Stockout Risk Checker v0.2

**Date:** 2026-06-06
**Multica issue:** [DOC-56](mention://issue/c0975b5c-4597-49c6-98d8-6098a3d8ce36)
**SME review:** [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260) — complete
**Stage:** Static MVP Planning Review (post Domain Feasibility Review)
**Approval gate:** Gate 1 of 3 — PRD / Data / UX scope recommendation
**Project folder:** `/Users/estherho/sc_product/products/inventory-stockout-risk-checker/`

---

## English Summary

### What this round delivered

Synthesis pass that rolled the Supply Chain SME's Domain Feasibility Review (DOC-57) into every product/spec doc. The MVP scope is unchanged in shape — still a CSV-first, browser-local, deterministic static tool — but tightened in five ways the SME flagged as blockers to operator trust.

### Files updated

- `PRODUCT-SPEC.md` — added SME-Validated v0 Adjustments section; updated optional columns, calculation layer, recommendation rules, and supplier draft to use two templates.
- `data/notes/DATA-PLAN.md` — added `committed_units` column semantics; switched safety buffer to lead-time-scaled; renamed deadstock → "deadstock candidate"; added Data Quality panel and Caveat Triggers sections; expanded fixture list.
- `docs/UX-SPEC.md` — added Data Quality Panel module (§5.2), inline-editable `lead_time_days`, three caveat triggers, two-template supplier draft with auto-select + switch link, "Verify net of returns" banner, "Off-season candidate" caveat, "estimated cash for reorder" column treatment, and an explicit Interface Playground gate.
- `DEV-PLAN.md` — added `computeSafetyBufferDays`, `evaluateCaveats`, `selectSupplierTemplate`, `summarizeDataQuality`, `recalcRowForLeadTimeEdit` helpers; expanded fixture plan.
- `REVIEW-GATE.md` — rewrote Formula Sanity Checks against the new formulas; added SME-driven P0 items; resolved 4 open questions pending Esther confirmation.
- `data/sample/shopify-inventory-sample.csv` — added `committed_units` column with realistic values (SKU-1004 demonstrates committed materially reducing available inventory).

### SME findings now baked in

1. **Lead-time-scaled safety buffer**: `safety_buffer_days = max(7, ceil(0.25 * lead_time_days))` — replaces the flat 7-day buffer that under-flagged overseas SKUs.
2. **`committed_units` optional column** — subtracted from on-hand before any risk math, because the #1 cause of surprise SMB stockouts is "on-hand looks fine, available is empty."
3. **Data Quality panel** — explicitly shows which optional fields were used vs missing, so degradation is never silent.
4. **Three caveat triggers** — Newly active SKU, Off-season candidate, Verify net of returns.
5. **Two supplier templates** — standard reorder, urgent expedite, auto-selected by urgency, with a one-click switch link. The expedite action label surfaces "projected days short."

Also: rename "Deadstock" → **"Deadstock candidate"** throughout; show **estimated cash for reorder** next to reorder qty when `unit_cost` exists; make `lead_time_days` **inline-editable** per row.

### Recommendation

**BUILD** (after Esther approves this PRD package).

### What's deliberately still deferred

Shopify OAuth, raw export adapter, multi-location, multi-warehouse, kit/bundle explosion, forecasting, saved dashboards, login, email sending, paid APIs, public launch.

### Open decisions Esther needs to confirm

These are PM-proposed resolutions from the SME's open-items list — pending Esther sign-off, not yet treated as final:

1. **Column name:** use `committed_units` (matches Stocky + Shopify Liquid). OK?
2. **Sample CSV update:** added `committed_units` with realistic small values, including SKU-1004 where committed materially reduces available. OK?
3. **Data Quality panel placement (mobile):** below the action summary, above the stockout table. OK?
4. **Supplier draft template selection:** auto-select by urgency with a visible "Switch to standard / Switch to urgent" link. OK?

Plus carried-over open questions:

5. Public-facing wording around Stocky sunset — confirm we stay on "weekly inventory action checker" / "stockout risk and deadstock review" until 5–10 merchant interviews are done. OK?
6. On mobile, should the deadstock-candidate table be expanded by default or collapsed below the stockout actions?

### What I'm explicitly asking Esther to approve

- [ ] **Approve PRD package** (PRODUCT-SPEC v0.2 + DATA-PLAN v0.2 + UX-SPEC v0.2 + DEV-PLAN v0.2 + REVIEW-GATE v0.2)
- [ ] **Approve the 5 SME v0 adjustments** baked into the spec
- [ ] **Approve the 4 PM-proposed resolutions** to SME open items (above)
- [ ] **Approve proceeding to the Interface Playground gate** — UX Product Designer produces 5 distinct UI/UX options before Developer starts implementation
- [ ] **Approve the public-copy guardrails** (no "Stocky replacement" language until merchant interviews)
- [ ] Revise / reject / send back with edits — whichever you prefer

I am NOT asking for build approval, deployment approval, paid API approval, or public launch approval in this gate.

### Next action after Esther approval

I @mention UX Product Designer on this issue to produce the **Interface Playground — 5 distinct options** (per Agent Identity playground gate). Developer does NOT start before Esther selects/combines/rejects a direction.

### What is still unverified

- No prototype build has been started; no fixture tests have been written or executed; no preview URL exists.
- No live merchant has reviewed either the data plan or the supplier draft templates.
- Stocky-sunset positioning copy has not been tested against any operator.

### Quick review links

- `/Users/estherho/sc_product/products/inventory-stockout-risk-checker/PRODUCT-SPEC.md`
- `/Users/estherho/sc_product/products/inventory-stockout-risk-checker/data/notes/DATA-PLAN.md`
- `/Users/estherho/sc_product/products/inventory-stockout-risk-checker/docs/UX-SPEC.md`
- `/Users/estherho/sc_product/products/inventory-stockout-risk-checker/DEV-PLAN.md`
- `/Users/estherho/sc_product/products/inventory-stockout-risk-checker/REVIEW-GATE.md`
- `/Users/estherho/sc_product/products/inventory-stockout-risk-checker/data/sample/shopify-inventory-sample.csv`
- SME review on [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260)

---

## 中文摘要

### 当前阶段

Static MVP Planning Review v0.2 — 已合并 Supply Chain SME 的 Domain Feasibility Review。
等待 Esther 第 1 个审批门（共 3 个）：PRD / 数据 / UX 方案。

### 这一轮我做了什么

把 SME 在 [DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260) 里的反馈，一次性写进了 PRD / DATA-PLAN / UX-SPEC / DEV-PLAN / REVIEW-GATE 和 sample CSV。整体范围不变（CSV-first、纯前端、确定性公式），但按 SME 建议收紧了五个会影响操作员信任的点。

### SME 已纳入的 5 个 v0 调整

1. **安全缓冲随 lead time 缩放**：`safety_buffer_days = max(7, ceil(0.25 * lead_time_days))`，替换原来的固定 7 天。固定 7 天会让海外长 lead time 的 SKU 报警太晚。
2. **新增可选列 `committed_units`**（已分配给未发货订单的数量）：在做风险计算前从 on-hand 减掉。SME 说这是 SMB "突然断货" 的 #1 原因——账上有 100，但 80 是 hold 给未发货订单的。
3. **Data Quality 面板**：明确显示哪些 optional 列被用上、哪些缺失、缺失带来的后果。不静默降级。
4. **三个 caveat 提示**：
   - "Newly active SKU"（90 天销量 < 30 天销量 × 2.5 时）
   - "Off-season candidate"（deadstock 高分行始终显示）
   - "Verify net of returns"（stockout 表格上方常驻条幅，提醒销量要扣掉退货）
5. **两套 supplier 模板**：standard reorder + urgent expedite，按紧急度自动选，可一键切换。Expedite 标签里直接显示 "projected N days short"。

附带：
- "Deadstock" 全局改名 "Deadstock candidate"。
- 有 `unit_cost` 时，在 reorder 数量旁显示 "estimated cash for reorder"。
- `lead_time_days` 在结果表里可逐行就地编辑、前端即时重算。

### 我的建议

**BUILD（按上述调整执行）** — 等你批了这个 PRD 包之后开始。

### 仍然不做

Shopify OAuth、原始 export 自适配、多仓多门店、bundle/kit 拆 component、forecasting、登录 / 保存 / 订阅、自动发邮件、付费 API、公开 launch。

### 需要 Esther 现在确认的决定（我提议的 4 个，等你点头）

1. 列名用 `committed_units`（和 Stocky / Shopify Liquid 一致）。OK 吗？
2. 已经把 `committed_units` 加进 sample CSV，含 SKU-1004 这种"committed 把 available 压低"的演示行。OK 吗？
3. 移动端：Data Quality 面板放在 "本周 action" 之下、stockout 表格之上。OK 吗？
4. Supplier 模板：按紧急度自动选 + 提供 "Switch to standard / Switch to urgent" 链接。OK 吗？

延续的开放问题：

5. 对外文案：5–10 个 merchant 访谈完成前，不出现 "Stocky replacement" 字眼；只用 "weekly inventory action checker" / "stockout risk and deadstock review"。同意？
6. 移动端：deadstock candidate 表格默认展开，还是放在 stockout action 下方折叠？

### 我要 Esther 明确批准的项（请逐项打勾或回复）

- [ ] **批准 PRD 包**（PRODUCT-SPEC + DATA-PLAN + UX-SPEC + DEV-PLAN + REVIEW-GATE，v0.2）
- [ ] **批准 SME 5 个调整** 全部纳入
- [ ] **批准我上面提议的 4 个解决方案**
- [ ] **批准进入 Interface Playground 阶段**（UX 出 5 个不同的方向，开发暂不开始）
- [ ] **批准对外文案护栏**（暂不用 Stocky replacement 字眼）
- [ ] 或者：返修 / 拒绝 / 让我改某一项再来

这一轮我**不**申请：build 批准、部署批准、付费 API 批准、对外 launch 批准。

### Esther 批了之后的下一步

我会在 DOC-56 上 @ UX Product Designer，让她做 **Interface Playground——5 个不同的 UI/UX 方向**（Agent Identity 要求的设计 playground gate）。Developer 在你选完方向之前都不开工。

### 还没验证的

- 还没写代码、没写 fixture test、没有 preview URL。
- 公式和供应商模板还没被任何真实 merchant 实际用过。
- "Stocky 落日" 的对外文案没在任何 operator 那里测过。

### Review 链接

- PRODUCT-SPEC：`/Users/estherho/sc_product/products/inventory-stockout-risk-checker/PRODUCT-SPEC.md`
- DATA-PLAN：`/Users/estherho/sc_product/products/inventory-stockout-risk-checker/data/notes/DATA-PLAN.md`
- UX-SPEC：`/Users/estherho/sc_product/products/inventory-stockout-risk-checker/docs/UX-SPEC.md`
- DEV-PLAN：`/Users/estherho/sc_product/products/inventory-stockout-risk-checker/DEV-PLAN.md`
- REVIEW-GATE：`/Users/estherho/sc_product/products/inventory-stockout-risk-checker/REVIEW-GATE.md`
- Sample CSV：`/Users/estherho/sc_product/products/inventory-stockout-risk-checker/data/sample/shopify-inventory-sample.csv`
- SME 评审记录：[DOC-57](mention://issue/55c5dc3a-8fe6-4e08-b323-d40270d0d260)
