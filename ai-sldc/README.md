# AI-SLDC 工程交付体系

基于 AI 辅助的软件生命周期交付能力体系，提供正向设计到交付、逆向代码到成果物的双向支持。

## 体系概述

AI-SLDC (AI-Software Lifecycle Delivery Capability) 是一套工程化的软件交付方法论，包含三个核心 skill：

```
正向流程：
/ai-sldc-design     → 启动 → 需求 → 设计
        ↓
/ai-sldc-delivery   → 开发 → 测试 → 发布 → 运维 → 运营
        ↓
[闭环反馈] → 回到 /ai-sldc-design

逆向流程（新增）：
/ai-sldc-sync       → 代码 → 成果物同步 → AI 上下文建立
```

## 安装方式

### 方式一：符号链接（推荐）

```bash
# 将 skills 目录链接到 Claude Code 的 skills 目录
ln -s $(pwd)/ai-sldc/skills/* ~/.claude/skills/
```

### 方式二：复制文件

```bash
# 复制到 Claude Code 的 skills 目录
cp -r ai-sldc/skills/* ~/.claude/skills/
```

## 使用方法

### 场景一：新项目（正向流程）

#### 1. 设计阶段

```
/ai-sldc-design
```

将依次推进：
- **阶段1：启动** - 业务价值定义，产出目标/KPI、干系人、计划
- **阶段2：需求** - 需求要件整理，产出流程、故事、规则、原型
- **阶段3：设计** - 技术方案设计，产出架构、API、数据模型

#### 2. 交付阶段

```
/ai-sldc-delivery
```

将依次推进：
- **阶段4：开发** - 代码实现交付
- **阶段5：测试** - 质量验证
- **阶段6：发布** - 部署上线
- **阶段7：运维** - 系统运行验证
- **阶段8：运营** - 价值度量反馈

### 场景二：已有代码（逆向流程）

#### 逆向同步

当接手已有项目或需要建立 AI 上下文时：

```
/ai-sldc-sync
```

自动分析代码，生成：
- **架构概览** - 目录结构、模块划分、依赖关系
- **API 清单** - 接口定义、请求响应结构
- **数据模型** - 实体定义、字段、关系
- **项目记忆** - 写入 `.memory/` 供后续 AI 使用

**适用场景：**
- 刚接手一个已有代码的项目
- 代码有较大变更，需要同步更新文档
- 准备开发新功能前，建立上下文基线

### 场景三：混合使用

```
# 已有项目，首次使用
/ai-sldc-sync         → 建立上下文
        ↓
/ai-sldc-design       → 设计新功能
        ↓
/ai-sldc-delivery     → 开发交付
        ↓
[代码变更后]
        ↓
/ai-sldc-sync         → 同步更新成果物
```

## 目录结构

```
ai-sldc/
├── README.md
├── skills/
│   ├── ai-sldc-design/           # 正向：设计阶段
│   │   ├── SKILL.md
│   │   └── references/
│   │
│   ├── ai-sldc-delivery/         # 正向：交付阶段
│   │   ├── SKILL.md
│   │   └── references/
│   │
│   ├── ai-sldc-sync/             # 逆向：代码同步
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── extraction-rules.md
│   │
│   └── _shared/
│       └── templates/
│           ├── forward/          # 正向流程模板
│           │   ├── phase-1-init/
│           │   ├── phase-2-require/
│           │   ├── phase-3-design/
│           │   └── ...
│           │
│           └── reverse/          # 逆向生成模板
│               ├── architecture-overview.md
│               ├── api-inventory.yaml
│               ├── data-model.yaml
│               └── project-memory.md
```

## 成果物追溯

所有成果物都有唯一 ID 和追溯关系：

```
阶段代码：
- PRJ: 启动    - ARC: 设计    - OPS: 运维
- BIZ: 需求    - ENG: 开发    - RUN: 运营
- TST: 测试    - RLS: 发布

追溯链示例：
API设计(ARC-004) ← 用户故事(BIZ-004) ← 业务目标(PRJ-001)
```

## Skill 选择指南

| 场景 | 推荐操作 |
|------|---------|
| 新项目从零开始 | `/ai-sldc-design` |
| 设计完成，进入开发 | `/ai-sldc-delivery` |
| 接手已有项目 | `/ai-sldc-sync` |
| 代码变更后同步文档 | `/ai-sldc-sync` |
| 快速头脑风暴 | `/superpowers:brainstorming` |
| 编写实施计划 | `/superpowers:writing-plans` |

## 版本信息

- **版本**: v2.2
- **更新日期**: 2026-03-25
- **变更**: 新增 `/ai-sldc-sync` 逆向同步 skill
