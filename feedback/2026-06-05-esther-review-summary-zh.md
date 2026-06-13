# Esther 快速 Review 摘要

## 当前阶段

Static MVP Planning Review

## 这轮我完成了什么

- 把 `PRODUCT-SPEC.md` 收紧成一个明确的静态 CSV 工具，而不是 forecasting SaaS。
- 把 `data/notes/DATA-PLAN.md` 补全为单一 normalized CSV schema、确定性公式、action rules、fixtures 范围。
- 新建 `docs/UX-SPEC.md`，明确 upload/sample/result/mobile/error flow。
- 把 `DEV-PLAN.md` 改成和 Container Utilization Checker 一样的静态实现模式。
- 新建 `ROADMAP.md`，让这个项目也走 one-tool-one-project 的节奏。
- 更新 `REVIEW-GATE.md` 和 `LAUNCH-CHECKLIST.md`，明确目前还不能 public launch。

## 当前建议的静态 MVP 范围

只做这些：

- 1 个 normalized CSV schema
- 1 个 upload + sample CSV 入口
- 1 个“本周哪些 SKU 需要 action”结果首页
- 1 个 stockout ranked table
- 1 个 deadstock / cash tied up section
- 1 个 supplier follow-up draft panel
- 1 个 formulas / caveats panel

先不要做：

- Shopify OAuth
- 原始 Shopify export 自动适配
- login / saved dashboard / subscription
- 自动发邮件
- 黑箱 forecasting
- 大而全 dashboard

## 你现在最需要判断的 3 件事

1. 这个 MVP 是否够小，适合先做成 static website tool？
2. 结果页优先级是否正确：
   - 先本周 action
   - 再 stockout table
   - 再 deadstock / cash
3. 对外文案里，是否暂时避免直接说 “Stocky replacement”，等 5-10 个 merchant conversation 后再定？

## 请点击 Review

- [PRODUCT-SPEC](/Users/estherho/sc_product/products/inventory-stockout-risk-checker/PRODUCT-SPEC.md)
- [DATA-PLAN](/Users/estherho/sc_product/products/inventory-stockout-risk-checker/data/notes/DATA-PLAN.md)
- [UX-SPEC](/Users/estherho/sc_product/products/inventory-stockout-risk-checker/docs/UX-SPEC.md)
- [DEV-PLAN](/Users/estherho/sc_product/products/inventory-stockout-risk-checker/DEV-PLAN.md)
- [ROADMAP](/Users/estherho/sc_product/products/inventory-stockout-risk-checker/ROADMAP.md)
- [REVIEW-GATE](/Users/estherho/sc_product/products/inventory-stockout-risk-checker/REVIEW-GATE.md)

## 建议下一步

按现在文档直接进入 static MVP 开发：

```text
code/index.html
code/styles.css
code/app.js
tests/run-fixtures.js
```

目标不是 launch，而是先做出一个可以本地跑、能读 sample CSV、能出 deterministic result 的 reviewable build。
