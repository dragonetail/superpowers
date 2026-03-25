---
name: ai-sldc-sync
description: Use when starting work on an existing codebase, after significant code changes, or before starting new feature development. Triggers when AI needs to understand project context quickly, or when documentation needs to be synchronized with current code state.
---

# AI-SLDC Sync - 逆向成果物同步

## 概述

从现有代码逆向分析，自动生成结构化成果物，帮助 AI 快速建立项目上下文。

**与正向流程的区别：**
```
正向：想法 → 设计文档 → 代码
逆向：代码 → 结构化成果物（本 skill）
```

---

## 使用场景

| 场景 | 触发条件 |
|------|----------|
| 接手项目 | 刚接手一个已有代码的项目 |
| 上下文建立 | AI 对项目不熟悉，需要快速理解 |
| 变更同步 | 代码有较大变更，文档需要更新 |
| 开发前准备 | 准备开发新功能前，建立基线 |

**不适用：** 新项目从零开始 → 使用 `/ai-sldc-design`

---

## 执行流程

```
触发 /ai-sldc-sync
    ↓
1. 扫描代码仓库
    ├── 目录结构
    ├── 依赖配置（package.json / pom.xml / requirements.txt）
    └── 技术栈识别
    ↓
2. 提取关键信息
    ├── API 接口（路由、handler、参数）
    ├── 数据模型（实体、字段、关系）
    └── 模块依赖
    ↓
3. 生成成果物
    ├── architecture-overview.md
    ├── api-inventory.yaml
    ├── data-model.yaml
    └── .memory/project-context.md
    ↓
4. 用户确认
    └── 微调后提交到 docs/reverse/
```

---

## 成果物说明

### 1. 架构概览

**用途**：让 AI 快速理解项目整体结构

**内容**：
- 项目基本信息（名称、技术栈、规模）
- 目录结构树 + 模块职责说明
- 模块间依赖关系
- 关键技术决策

### 2. API 清单

**用途**：结构化的 API 定义，供 AI 理解接口层

**内容**：
- 端点路径、方法、handler
- 请求/响应结构
- 认证要求

### 3. 数据模型

**用途**：实体定义，供 AI 理解数据层

**内容**：
- 实体名称、来源文件
- 字段定义（名称、类型、约束）
- 实体间关系

### 4. 项目记忆

**用途**：写入 `.memory/` 目录，供后续对话直接加载

**内容**：
- 快速参考（框架、语言、数据库）
- 关键文件路径
- 开发约定

---

## 提取规则

### 目录结构识别

```
src/
├── api/         → API层
├── services/    → 业务层
├── models/      → 数据层
├── utils/       → 工具层
└── config/      → 配置层
```

### 技术栈识别

| 配置文件 | 提取内容 |
|---------|---------|
| package.json | dependencies, scripts |
| pom.xml | groupId, artifactId, dependencies |
| requirements.txt | Python 包 |
| go.mod | Go 模块 |

### API 识别

| 框架 | 识别方式 |
|------|---------|
| Express | app.get/post/put/delete |
| Next.js | app/api/ 目录结构 |
| Spring | @RequestMapping 等注解 |
| FastAPI | @app.get/post 装饰器 |

### 数据模型识别

| 类型 | 识别方式 |
|------|---------|
| ORM | Prisma schema / TypeORM entity |
| 类定义 | class/interface 定义 |
| 数据库 | migration 文件 / schema.sql |

---

## 输出目录

```
docs/
└── reverse/
    └── YYYY-MM-DD/
        ├── architecture-overview.md
        ├── api-inventory.yaml
        ├── data-model.yaml
        └── trace-matrix.md

.memory/
└── project-context.md    # AI 项目记忆
```

---

## 与正向流程的衔接

```
场景1：已有项目，首次使用 AI
/ai-sldc-sync → 生成上下文 → 后续开发

场景2：新项目
/ai-sldc-design → /ai-sldc-delivery → [代码完成] → /ai-sldc-sync 同步

场景3：重大变更后
开发变更 → /ai-sldc-sync → 更新文档 → 继续开发
```

---

## 关键原则

| 原则 | 说明 |
|------|------|
| 自动优先 | 尽量自动分析，减少交互 |
| AI 友好 | 成果物格式优先 AI 可读 |
| 增量更新 | 支持只更新变更部分 |
| 追溯建立 | 自动建立代码到成果物的追溯 |

---

## 相关资源

- **逆向模板**：`_shared/templates/reverse/`
- **提取规则**：`references/extraction-rules.md`

---

## Skill 关系

```
/ai-sldc-sync         → 逆向同步（本 skill）
        ↓ 建立上下文
/ai-sldc-design       → 正向设计
/ai-sldc-delivery     → 正向交付
        ↓ 代码变更后
/ai-sldc-sync         → 再次同步
```
