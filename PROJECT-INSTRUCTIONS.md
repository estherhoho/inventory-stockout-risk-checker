# Inventory Stockout Risk Checker 项目指令

## 项目定位

这是 Dock to AI 的第三个工具产品，接在：

1. Supply Chain AI Opportunity Scanner
2. Container Utilization Checker

之后启动。

目标不是做完整 forecasting SaaS，而是做一个 **CSV-first website tool**：

```text
用户上传 Shopify / ecommerce inventory + order CSV
→ 工具确定性计算 stockout risk、deadstock risk、reorder urgency
→ 输出 heatmap、top actions、supplier follow-up draft
→ 用户可下载/留资/预约咨询
```

## Canonical Path

```text
/Users/estherho/sc_product/products/inventory-stockout-risk-checker/
```

不要使用旧路径：

```text
/Users/estherho/Documents/Codex/sc_product/
```

不要把这个产品混进 Scanner 原型目录：

```text
/Users/estherho/sc_product/code/snapshot-prototype/
```

## Website URL 建议

```text
/toolkit/inventory-stockout-risk-checker
```

## 产品阶段

当前阶段：

```text
Project Kickoff / PRD Draft
```

不要直接 public launch。先完成：

1. PRODUCT-SPEC
2. Data Plan + sample CSV
3. UX Flow
4. DEV-PLAN
5. Static MVP
6. REVIEW-GATE
7. Vercel Preview
8. Esther Review

## 核心原则

- 参考 Container Utilization Checker 的成功项目模式：

```text
/Users/estherho/sc_product/products/container-utilization-checker/
```

- 复用它的 one-tool-one-project、static MVP、deterministic calculation、review gate、README/SKILL packaging 思路。
- 不复制 Container 的业务逻辑，只借鉴工程和产品交付模式。
- 计算必须用确定性公式，不要让 AI 猜库存建议。
- AI element 用在解释、supplier follow-up email、action plan、report summary。
- 第一版可以没有真实 LLM API，用模板/规则型 copy 生成即可。
- 页面首屏必须是工具体验，不是品牌介绍页。
- 结果页先给 “which SKUs need action this week”，再给图表。
- 必须支持手机 review。
- 每次请求 Esther review，都要有中文快速摘要和链接列表。

## 不做范围

第一版不做：

- Shopify API OAuth / app install
- multi-store sync
- Amazon FBA API
- purchase order creation
- probabilistic black-box demand forecasting
- paid API data
- login
- saved dashboard
- subscription
- automatic supplier email sending

## 成功定义

MVP 成功必须满足：

- 用户能上传 sample Shopify-style CSV。
- 用户能看到 top stockout-risk SKUs。
- 用户能看到 top deadstock SKUs。
- 用户能看到 days of cover、reorder urgency、cash tied up。
- 用户能看到清楚的 heatmap / ranked table。
- 用户能复制 supplier follow-up draft。
- 用户知道下一步应该 reorder、expedite、markdown、hold, or review data。
- 用户能在手机打开 Vercel preview review。
- REVIEW-GATE 没有 P0 blocker。
