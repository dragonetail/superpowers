---
name: ai-templates
description: "GTMC 数字化 SLDC 工程交付体系的成果物模板库，提供 AI 适配的结构化模板，供 ai-design 和 ai-delivery 调用。"
---

# AI Templates - 成果物模板库

## 概述

基于 **GTMC 数字化 SLDC 工程交付体系 v2.1** 的成果物模板库，提供各阶段成果物的 AI 适配格式模板。

供 `/superpowers:ai-design` 和 `/superpowers:ai-delivery` 调用，确保成果物格式统一、结构化、AI 可读。

---

## 模板目录结构

```
ai-templates/
├── SKILL.md                          # 本文件
├── templates/
│   ├── phase-1-init/                 # 启动阶段模板
│   │   ├── business-goal.yaml        # 业务目标/KPI
│   │   ├── stakeholder-analysis.md   # 干系人分析
│   │   └── project-plan.yaml         # 项目计划书
│   │
│   ├── phase-2-require/              # 需求阶段模板
│   │   ├── user-story.md             # 用户故事
│   │   ├── business-process.bpmn     # 业务流程模型
│   │   ├── business-object.yaml      # 业务对象模型
│   │   └── business-rule.md          # 业务规则
│   │
│   ├── phase-3-design/               # 设计阶段模板
│   │   ├── api-design.yaml           # API设计 (OpenAPI)
│   │   ├── architecture.md           # 架构设计
│   │   ├── adr.md                    # 架构决策记录
│   │   └── data-model.yaml           # 数据模型
│   │
│   ├── phase-4-develop/              # 开发阶段模板
│   │   ├── code-review.md            # 代码评审记录
│   │   └── tech-doc.md               # 技术文档
│   │
│   ├── phase-5-test/                 # 测试阶段模板
│   │   ├── test-case.feature         # 测试用例 (Gherkin)
│   │   └── test-report.md            # 测试报告
│   │
│   ├── phase-6-release/              # 发布阶段模板
│   │   ├── release-checklist.yaml    # 发布检查清单
│   │   └── release-note.md           # 变更记录
│   │
│   ├── phase-7-operate/              # 运维阶段模板
│   │   ├── monitor-config.yaml       # 监控配置
│   │   └── ops-manual.md             # 运维手册
│   │
│   ├── phase-8-run/                  # 运营阶段模板
│   │   ├── value-report.md           # 价值度量报告
│   │   └── iteration-suggest.md      # 迭代建议
│   │
│   └── _common/                      # 通用模板
│       ├── metadata-header.yaml      # 元数据头模板
│       └── trace-matrix.md           # 追溯矩阵
│
└── README.md                         # 使用说明
```

---

## 通用规范

### 元数据头

所有 Markdown/YAML 成果物必须包含以下元数据头：

```yaml
---
id: [阶段代码]-[序号]           # 必填：唯一标识
name: [成果物名称]              # 必填：成果物名称
version: v1.0                  # 必填：版本号
phase: [阶段名称]               # 必填：所属阶段
status: 草稿                   # 必填：草稿/评审中/已批准/已变更
created_at: YYYY-MM-DD         # 必填：创建日期
updated_at: YYYY-MM-DD         # 必填：更新日期
author: [作者]                 # 必填：创建者
reviewer: [评审者]             # 可选：评审者
approver: [批准者]             # 可选：批准者
traces_to: []                  # 可选：追溯的上游成果物ID
tags: []                       # 可选：标签
---
```

### ID 编码规则

```
格式：[阶段代码]-[序号]

阶段代码：
- PRJ: 项目启动 (Phase 1)
- BIZ: 业务/需求 (Phase 2)
- ARC: 架构/设计 (Phase 3)
- ENG: 工程/开发 (Phase 4)
- TST: 测试 (Phase 5)
- RLS: 发布 (Phase 6)
- OPS: 运维 (Phase 7)
- RUN: 运营 (Phase 8)
```

---

## 模板使用方式

### 在 ai-design 中使用

```
阶段1-启动：使用 phase-1-init/ 模板
阶段2-需求：使用 phase-2-require/ 模板
阶段3-设计：使用 phase-3-design/ 模板
```

### 在 ai-delivery 中使用

```
阶段4-开发：使用 phase-4-develop/ 模板
阶段5-测试：使用 phase-5-test/ 模板
阶段6-发布：使用 phase-6-release/ 模板
阶段7-运维：使用 phase-7-operate/ 模板
阶段8-运营：使用 phase-8-run/ 模板
```

---

## 模板调用示例

### 生成用户故事

```markdown
参考模板: phase-2-require/user-story.md

输出文件: docs/plans/YYYY-MM-DD-topic/用户故事.md

填充内容:
- id: BIZ-004
- traces_to: [PRJ-001]  # 追溯到业务目标
- 故事陈述
- 验收标准
- 业务规则
```

### 生成 API 设计

```yaml
参考模板: phase-3-design/api-design.yaml

输出文件: docs/plans/YYYY-MM-DD-topic/api-design.yaml

填充内容:
- id: ARC-004
- traces_to: [BIZ-004]  # 追溯到用户故事
- OpenAPI 3.0 规范内容
```

---

## 关键原则

- **结构化优先** — 所有模板使用结构化格式
- **元数据完整** — 必须包含完整的元数据头
- **追溯可链** — 每个成果物都有追溯关系
- **AI 可读** — 格式便于 AI 理解和处理
- **版本可控** — 纯文本格式，便于 Git 管理

---

## 模板维护

### 新增模板

1. 在对应阶段目录下创建模板文件
2. 确保包含元数据头
3. 更新本文件的目录结构

### 更新模板

1. 修改模板文件
2. 更新模板版本号
3. 通知相关 skill 维护者

---

## 与其他 Skill 的关系

```
/superpowers:ai-design     → 调用 phase-1/2/3 模板
/superpowers:ai-delivery   → 调用 phase-4/5/6/7/8 模板
/superpowers:ai-templates  ← 提供模板支撑
```
