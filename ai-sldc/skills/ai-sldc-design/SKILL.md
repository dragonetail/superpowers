---
name: ai-sldc-design
description: Use when starting a new project, designing features, or creating structured deliverables for requirements and architecture phases. Triggers when user needs standardized design documents, AI-readable specifications, or traceable artifacts.
---

# AI-SLDC Design - 工程化设计流程

## 概述

基于 AI-SLDC 工程交付体系的结构化设计流程。通过协作式对话，依次推进 **启动 → 需求 → 设计** 三个阶段，产出 AI 可理解、可追溯的数字化成果物。

**知识流动对齐：**
```
业务价值定义 → 需求要件整理 → 技术方案设计 → [交接 ai-sldc-delivery]
```

---

## 使用场景

| 场景 | 触发条件 |
|------|----------|
| 新项目启动 | 需要规范化交付的新功能或项目 |
| 需求设计 | 需要产出可追溯的用户故事、业务流程 |
| 架构设计 | 需要技术选型决策、API 设计 |
| 交接准备 | 需要后续交接给开发团队的设计 |

**不适用：** 快速头脑风暴 → 使用 `/superpowers:brainstorming`

---

## 流程概览

```
阶段1：启动 (Init)        → 业务价值定义，产出：目标/KPI、干系人、计划
    ↓ 准出检查
阶段2：需求 (Require)     → 需求要件整理，产出：流程、故事、规则、原型
    ↓ 准出检查
阶段3：设计 (Design)      → 技术方案设计，产出：架构、API、数据模型
    ↓ 交接
[ai-sldc-delivery]        → 代码实现交付
```

---

## 阶段1：启动

### 目标
明确"为什么做"——业务价值、目标、范围和可行性。

### 准入条件
- [ ] 有业务诉求或机会
- [ ] 有关键干系人支持

### 协作方式
1. **理解背景** - 了解项目上下文，询问业务痛点
2. **明确目标** - 一次一问，多选引导，聚焦目的/约束/成功标准
3. **探索方案** - 提出 2-3 种方案，给出推荐和理由

### 成果物
| ID | 名称 | 格式 |
|----|------|------|
| PRJ-001 | 业务目标/KPI | YAML + Markdown |
| PRJ-002 | 干系人分析 | Markdown |
| PRJ-003 | 项目计划书 | YAML + Markdown |

### 准出检查
- [ ] 业务目标/KPI 已定义并获认同
- [ ] 干系人已识别
- [ ] 用户确认进入下一阶段

---

## 阶段2：需求

### 目标
明确"做什么"——将隐性业务知识转化为结构化需求。

### 准入条件
- [ ] 阶段1 准出通过
- [ ] 业务目标已确认

### 协作方式
1. **业务调研** - 询问流程、规则、用户角色
2. **需求分析** - 编写用户故事(Gherkin)、绘制流程(BPMN)、定义对象(JSON Schema)
3. **需求确认** - 分段呈现(200-300字/段)，确认后继续

### 成果物
| ID | 名称 | 格式 |
|----|------|------|
| BIZ-001 | 业务流程模型 | BPMN 2.0 XML |
| BIZ-002 | 业务对象模型 | JSON Schema |
| BIZ-003 | 业务规则 | Markdown + 决策表 |
| BIZ-004 | 用户故事 | Markdown + YAML |
| BIZ-005 | 原型设计 | Figma/Sketch 链接 |

### 准出检查
- [ ] 业务流程已完成(BPMN 格式)
- [ ] 用户故事已完成
- [ ] 需求追溯关系已建立
- [ ] 用户确认进入下一阶段

---

## 阶段3：设计

### 目标
明确"怎么做"——产出可指导开发的结构化设计。

### 准入条件
- [ ] 阶段2 准出通过
- [ ] 需求已确认

### 协作方式
1. **架构设计** - 确定系统上下文、划分领域边界(DDD)、选择技术栈(记录ADR)
2. **详细设计** - 设计 API(OpenAPI)、数据模型、时序图
3. **设计呈现** - 分段呈现，确认后继续

### 成果物
| ID | 名称 | 格式 |
|----|------|------|
| ARC-001 | 系统上下文图 | C4/PlantUML |
| ARC-002 | 架构图 | C4/PlantUML |
| ARC-003 | 技术选型决策 | Markdown (ADR) |
| ARC-004 | API 设计 | OpenAPI 3.0 |
| ARC-005 | 数据模型 | ER图 + JSON Schema |

### 准出检查
- [ ] 架构图已完成
- [ ] 技术选型决策已记录(ADR)
- [ ] API 设计已完成(OpenAPI)
- [ ] 设计追溯已建立
- [ ] 用户确认设计完成

---

## 设计完成后

### 文档输出
```
docs/plans/YYYY-MM-DD-<topic>/
├── 01-业务目标.yaml
├── 02-干系人分析.md
├── 03-用户故事.md
├── 04-架构设计.md
├── 05-api-design.yaml
└── 06-追溯矩阵.md
```

### 交接
- 继续实现 → 使用 `/ai-sldc-delivery`
- 暂停 → 保存所有成果物，记录进度和待办

---

## 关键原则

| 原则 | 说明 |
|------|------|
| 阶段推进 | 严格按阶段推进，完成准入准出检查 |
| 一次一问 | 每次只问一个问题，避免信息过载 |
| 分段呈现 | 设计分段呈现，每段确认后继续 |
| YAGNI | 坚决移除不必要的功能 |
| AI 适配 | 所有产出使用 AI 友好格式 |
| 可追溯 | 自动建立成果物追溯关系 |

---

## 相关资源

- **模板库**：`_shared/templates/` - 各阶段成果物模板
- **详细规范**：`references/format-spec.md` - AI 适配格式规范
- **追溯机制**：`references/trace-mechanism.md` - ID 编码和追溯规则

---

## Skill 关系

```
/superpowers:brainstorming  → 快速探索
/ai-sldc-design             → 规范化设计（本 skill）
/ai-sldc-delivery           → 开发交付
```
