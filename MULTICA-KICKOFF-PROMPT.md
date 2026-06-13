# Multica Kickoff Prompt — Inventory Stockout Risk Checker

> 复制下面内容给 Multica，用来启动 Dock to AI 第三个工具产品。

---

你现在是我的 **Multica Product Squad**，请启动新产品：

```text
Inventory Stockout Risk Checker
```

中文名：

```text
库存断货风险检查器
```

## 0. 项目路径

所有文件必须保存在：

```text
/Users/estherho/sc_product/products/inventory-stockout-risk-checker/
```

不要使用旧路径：

```text
/Users/estherho/Documents/Codex/sc_product/
```

不要把这个产品混进当前 Scanner 原型目录：

```text
/Users/estherho/sc_product/code/snapshot-prototype/
```

## 1. 产品目标

做一个 CSV-first static website tool，帮助 Shopify / ecommerce operator 快速判断：

- 哪些 SKU 可能快要断货？
- 哪些 SKU 是 deadstock 或慢销库存？
- 每个 SKU 还有多少 days of cover？
- 本周应该 reorder、expedite、markdown、hold，还是 review data？
- 应该如何写给 supplier 的 follow-up email？

第一版必须简单、透明、可用、可手机 review。

## 1A. 已确认的 MVP 边界

请按以下已确认决策执行，不要重复询问：

- v0 只做 CSV upload + sample CSV，不做 Shopify OAuth。
- 第一版不做 login、saved dashboard、subscription。
- 第一版不做黑箱 ML forecasting。
- Stockout / deadstock / reorder 建议必须用 deterministic formulas。
- AI element 只用于解释、supplier follow-up draft、action plan 文案。
- 第一版可以用规则型 copy，不一定接 OpenAI API。
- CSV 在浏览器本地处理，不上传、不存储。

## 2. 背景依据

这是 Dock to AI 第三个工具产品，接在：

1. Supply Chain AI Opportunity Scanner
2. Container Utilization Checker

之后启动。

推荐理由：

- 最新 evidence brief 把 `Stockout Risk Heatmap with AI Supplier Follow-Up Drafter` 排为 Top #1 build。
- Shopify Stocky 将在 August 2026 sunset，形成明确迁移窗口。
- 这个工具比通用 forecasting app 更可信，因为它先展示透明计算和 SKU action list。
- v0 可用 CSV 构建，不需要深度 integration。

请参考：

```text
/Users/estherho/sc_product/doc-27-product-evidence-brief-en.html
/Users/estherho/sc_product/outputs/2026-06-02-doc-25-product-opportunity-roadmap.md
```

## 2A. 参考已成功产品模式

Esther 明确反馈：

```text
Container Utilization Checker 项目效果不错，可以 replicate / refer to it.
```

请重点参考这个项目的工作方式和工程结构：

```text
/Users/estherho/sc_product/products/container-utilization-checker/
```

可以复用/借鉴：

- one-tool-one-project folder structure
- `PRODUCT-SPEC.md` / `DEV-PLAN.md` / `ROADMAP.md` / `REVIEW-GATE.md` / `LAUNCH-CHECKLIST.md` 文档风格
- static HTML/CSS/JS MVP approach
- deterministic calculation layer + rule-based recommendation layer
- sample data + fixture tests
- mobile-first, tool-first UI
- Dock to AI embedded / standalone readiness
- GitHub-ready `README.md` + `SKILL.md` packaging
- 中文 Esther review summary format

不要复制 Container business logic。只复制它的产品流程、技术模式、QA gate、文档组织和可发布工具形态，然后适配到 inventory CSV analysis。

## 3. Agent 分工

请按以下 agent squad 执行：

### Product Manager Agent

请输出并完善：

- `PRODUCT-SPEC.md`
- target user
- job-to-be-done
- MVP scope
- out of scope
- success criteria
- monetization path
- website category / URL / CTA

### Supply Chain / Inventory SME Agent

请输出并完善：

- inventory assumptions
- Shopify / ecommerce CSV field expectations
- stockout and deadstock formulas
- edge cases
- merchant validation questions
- `data/notes/DATA-PLAN.md`

### UX Designer Agent

请输出：

- upload flow
- sample CSV first-run experience
- CSV review/error state
- result page layout
- heatmap / ranked table approach
- mobile-first review
- empty/error/loading states

### Developer Agent

请先不要写复杂 app。第一版用 static HTML/CSS/JS。

请输出：

- `code/index.html`
- `code/styles.css`
- `code/app.js`
- deterministic scoring functions
- CSV parser and validation rules
- sample data loader
- instructions to run locally

### QA Reviewer Agent

请输出：

- `REVIEW-GATE.md`
- P0/P1/P2/P3 findings
- formula sanity checks
- parser fixture checks
- mobile/desktop QA
- placeholder/fake CTA check
- launch readiness

### Launch / Marketing Agent

请输出：

- website tool card copy
- SEO title
- SEO description
- LinkedIn launch draft
- 小红书 launch draft
- Esther review summary

## 4. MVP 输入

第一版支持 normalized CSV upload：

Required columns:

- `sku`
- `product_name`
- `inventory_on_hand`
- `units_sold_30d`
- `units_sold_90d`
- `lead_time_days`

Optional columns:

- `unit_cost`
- `vendor`
- `category`
- `reorder_multiple`
- `incoming_units`

Sample CSV 已创建：

```text
data/sample/shopify-inventory-sample.csv
```

## 5. MVP 输出

必须输出：

- SKUs analyzed
- high stockout-risk count
- deadstock count
- total cash tied up if unit cost exists
- top stockout-risk SKUs
- top deadstock SKUs
- days of cover
- reorder urgency label
- reorder quantity estimate
- recommended action
- copyable supplier follow-up email draft

结果页优先显示：

1. Which SKUs need action this week?
2. Stockout risk table / heatmap
3. Deadstock and cash tied up
4. Supplier follow-up draft
5. Supporting formulas / data caveats

不要先放大图表。

## 6. Website 信息

Website category:

```text
Inventory & Ecommerce Operations
```

URL:

```text
/toolkit/inventory-stockout-risk-checker
```

Tool card one-liner:

```text
Upload an inventory CSV to find stockout-risk SKUs, deadstock, reorder urgency, and supplier follow-up actions.
```

Primary CTA:

```text
Check My Inventory Risk
```

Secondary CTA:

```text
Use Sample CSV
```

## 7. Review 要求

每次请求 Esther review，必须输出中文摘要：

```markdown
# Esther 快速 Review 摘要

## 当前阶段
PRD Review / UX Review / Launch Review

## 你需要判断的 3 件事
1.
2.
3.

## 本轮主要变化
-
-
-

## 链接
- Preview:
- Key files:
```

## 8. 第一轮任务

请从 PRD + Data Plan + UX flow 开始，不要直接 public launch。

第一轮交付：

1. 完整 `PRODUCT-SPEC.md`
2. 完整 `data/notes/DATA-PLAN.md`
3. `docs/UX-SPEC.md`
4. `DEV-PLAN.md`
5. 一版静态 MVP scope recommendation
6. 中文 Esther review summary
