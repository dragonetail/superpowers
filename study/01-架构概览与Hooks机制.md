# Superpowers 学习笔记

> 学习目标：全面掌握 superpowers 项目（定制、教学、集成、贡献）
> 学习路径：架构优先，系统学习
> 优先级：文档生成 → 流程规范 → 调试排查 → 代码审查

---

## 一、整体架构概览

### 三大核心组件

Superpowers 由三个核心组件构成，它们协同工作形成一个完整的开发工作流：

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code 启动                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  HOOKS (钩子)                                                │
│  ─────────────                                               │
│  在特定事件发生时自动触发，注入上下文或执行脚本                  │
│  例如：SessionStart → 自动加载 using-superpowers skill        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  SKILLS (技能)                                               │
│  ─────────────                                               │
│  封装特定工作流程的 markdown 文档，告诉 AI 如何处理任务         │
│  例如：brainstorming、writing-plans、test-driven-development │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  AGENTS (代理)                                               │
│  ─────────────                                               │
│  独立的子任务执行者，有特定角色和职责                           │
│  例如：code-reviewer 用于代码审查                             │
└─────────────────────────────────────────────────────────────┘
```

**关键理解**：Hooks 是触发器，Skills 是流程指南，Agents 是执行者。

---

## 二、Hooks 机制详解

### 2.1 文件结构

```
hooks/
├── hooks.json       # 声明哪些事件触发哪些脚本
├── run-hook.cmd     # 通用执行脚本（跨平台）
└── session-start.sh # 实际的逻辑脚本
```

### 2.2 hooks.json 配置解析

```json
{
  "hooks": {
    "SessionStart": [  // 事件类型：会话开始时
      {
        "matcher": "startup|resume|clear|compact",  // 匹配条件
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh",
            "async": false  // 同步执行，必须完成后才能继续
          }
        ]
      }
    ]
  }
}
```

### 2.3 session-start.sh 工作流程

1. 读取 `using-superpowers/SKILL.md` 的内容
2. 将其包装成 JSON 格式
3. 通过 `additional_context` 注入到 AI 的上下文中

**关键点**：Hooks 的本质是"上下文注入"——在正确的时机，把正确的指令塞给 AI。

### 2.4 Hooks 触发时机

**不是每个消息都触发，而是特定事件触发。**

`matcher: "startup|resume|clear|compact"` 的含义：

| 事件 | 说明 |
|------|------|
| `startup` | 启动新的 Claude Code 会话 |
| `resume` | 恢复之前的会话（比如重新打开终端） |
| `clear` | 用户执行 `/clear` 命令清空对话 |
| `compact` | 会话被压缩（上下文过长时自动触发） |

**所以：**
- 普通对话中发送消息 → **不会触发** hook
- 新开一个会话 → **会触发** hook
- 执行 `/clear` → **会触发** hook

### 2.5 实际效果

每次 hook 触发后，`using-superpowers/SKILL.md` 的内容会被注入到 AI 的上下文中。这就是为什么每次新会话开始，AI 都"知道"自己有 superpowers。

### 2.6 其他 Hook 类型

Claude Code 还支持其他 hook 事件（superpowers 目前没用到）：

| Hook 事件 | 说明 |
|-----------|------|
| `UserPromptSubmit` | 用户发送消息时触发 |
| `PreToolUse` | AI 使用工具前触发 |
| `PostToolUse` | AI 使用工具后触发 |
| `Stop` | AI 完成回复时触发 |

---

## 三、Skills 机制详解

### 3.1 Skills 的本质

Skills 是 **markdown 格式的指令文档**，告诉 AI 如何完成特定类型的工作。它们不是代码，而是"知识"和"流程"的封装。

**文件结构：**
```
skills/
├── brainstorming/
│   └── SKILL.md          # 核心：技能定义
├── writing-plans/
│   └── SKILL.md
├── test-driven-development/
│   ├── SKILL.md
│   └── examples/         # 可选：示例文件
└── ...
```

### 3.2 SKILL.md 的结构

```markdown
---
name: skill-name                                    # YAML frontmatter
description: Use when [条件] - [做什么]
---

# 技能内容

实际的指令、流程、最佳实践...
```

**关键组成部分：**
1. **YAML frontmatter** - 元数据（name、description）
2. **正文** - 实际的指令内容

### 3.3 Skills 如何被调用

1. AI 识别用户任务与某个 skill 相关
2. 调用 `Skill` 工具，加载 SKILL.md 内容
3. 按照内容中的指令执行

**核心机制**：`lib/skills-core.js` 提供 skill 的发现、解析、加载功能。

### 3.4 Skills 的核心设计理念

**Skills = 结构化的提示词工程**

Superpowers 把"如何做好某类任务"的知识编码成可复用的 markdown 文档。核心思想：

1. **可发现** - AI 能自动识别何时该用哪个 skill
2. **可复用** - 同一套流程可以反复使用
3. **可组合** - 多个 skills 可以串联成工作流

### 3.5 description 字段的关键作用

```yaml
---
name: brainstorming
description: Use when starting any conversation - establishes how to find and use skills
---
```

`description` 决定了 AI **何时**会调用这个 skill。写好 description 是 skill 设计的关键。

**好的 description 特征：**
- 明确触发条件："Use when..."
- 说明技能目的："...to do what"
- 提供示例场景（可选）

### 3.6 Skills 的优先级机制

当多个 skills 都可能适用时，有明确的优先级：

1. **Process skills** 先（brainstorming、debugging）→ 决定 HOW to approach
2. **Implementation skills** 后（frontend-design、mcp-builder）→ 指导 execution

```
"Let's build X" → brainstorming first → 然后才是 implementation skills
"Fix this bug"  → debugging first     → 然后才是 domain-specific skills
```

### 3.7 现有 Skills 列表

| Skill | 用途 |
|-------|------|
| brainstorming | 设计讨论，需求澄清 |
| writing-plans | 编写实施计划 |
| executing-plans | 执行计划 |
| test-driven-development | TDD 开发流程 |
| systematic-debugging | 系统化调试 |
| verification-before-completion | 完成前验证 |
| writing-skills | 编写新 skill |
| using-git-worktrees | Git worktree 管理 |
| finishing-a-development-branch | 分支完成处理 |

---

## 四、Agents 机制详解

### 4.1 Agents 的本质

Agents 是**具有特定角色和职责的子代理**。当主 AI 需要完成一个复杂任务时，可以派发一个子代理专门处理。

### 4.2 与 Skills 的区别

| 特性 | Skills | Agents |
|------|--------|--------|
| 本质 | 静态指令文档 | 动态执行的子代理 |
| 执行方式 | 主 AI 内部遵循 | 独立的子进程 |
| 适用场景 | 流程指导 | 需要独立探索、审查的工作 |
| 上下文 | 共享主上下文 | 可以有独立上下文 |

### 4.3 Agents 文件结构

```
agents/
└── code-reviewer.md    # 代理定义
```

### 4.4 Agent 定义示例

从 `agents/code-reviewer.md` 可以看到：

```yaml
---
name: code-reviewer
description: |
  Use this agent when a major project step has been completed and needs
  to be reviewed against the original plan and coding standards.
model: inherit    # 使用与主代理相同的模型
---

You are a Senior Code Reviewer with expertise in...
```

**关键字段：**
- `name` - 代理名称
- `description` - 何时使用这个代理
- `model` - 模型配置（`inherit` 表示继承主代理模型）

### 4.5 Agents 的工作流程

```
主 AI 完成一个功能
    ↓
识别需要代码审查
    ↓
启动 code-reviewer agent（子代理）
    ↓
子代理独立执行：
  - 读取代码
  - 对照计划检查
  - 评估质量
  - 生成报告
    ↓
返回结果给主 AI
    ↓
主 AI 根据反馈继续工作
```

### 4.6 何时用 Agent 而不是 Skill？

**用 Agent：**
- 需要独立视角的审查
- 任务需要大量探索
- 需要并行处理多个任务

**用 Skill：**
- 需要主 AI 遵循特定流程
- 任务相对简单
- 需要保持上下文连贯

---

## 五、扩展与定制模式

（待续...）

---

## 六、实践案例

（待续...）
