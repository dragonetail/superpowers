---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# 将创意头脑风暴成设计

## 概述

通过自然的协作对话，帮助将创意转化为完整的设计和规格。

首先了解当前项目背景，然后逐个提问来细化创意。一旦你理解了要构建的内容，展示设计并获得用户批准。

<HARD-GATE>
在展示设计并获得用户批准之前，不要调用任何实现技能、编写任何代码、搭建任何项目或采取任何实现行动。这适用于每个项目，无论看起来多么简单。
</HARD-GATE>

## 反模式："这太简单了不需要设计"

每个项目都要经历这个过程。待办列表、单函数工具、配置更改——所有这些。"简单"项目恰恰是未经审视的假设导致最多浪费工作的地方。设计可以很短（对于真正简单的项目只需几句话），但你必须展示它并获得批准。

## 检查清单

你必须为以下每项创建任务并按顺序完成：

1. **探索项目背景** — 检查文件、文档、最近的提交
2. **提出澄清问题** — 一次一个，理解目的/约束/成功标准
3. **提出2-3种方法** — 包括权衡和你推荐的方法
4. **展示设计** — 按复杂度分节展示，每节后获得用户批准
5. **编写设计文档** — 保存到 `docs/plans/YYYY-MM-DD-<topic>-design.md` 并提交
6. **过渡到实现** — 调用 writing-plans 技能创建实现计划

## 流程图

```dot
digraph brainstorming {
    "Explore project context" [shape=box];
    "Ask clarifying questions" [shape=box];
    "Propose 2-3 approaches" [shape=box];
    "Present design sections" [shape=box];
    "User approves design?" [shape=diamond];
    "Write design doc" [shape=box];
    "Invoke writing-plans skill" [shape=doublecircle];

    "Explore project context" -> "Ask clarifying questions";
    "Ask clarifying questions" -> "Propose 2-3 approaches";
    "Propose 2-3 approaches" -> "Present design sections";
    "Present design sections" -> "User approves design?";
    "User approves design?" -> "Present design sections" [label="no, revise"];
    "User approves design?" -> "Write design doc" [label="yes"];
    "Write design doc" -> "Invoke writing-plans skill";
}
```

**最终状态是调用 writing-plans。** 不要调用 frontend-design、mcp-builder 或任何其他实现技能。头脑风暴后你唯一调用的技能是 writing-plans。

## 流程

**理解创意：**
- 首先查看当前项目状态（文件、文档、最近提交）
- 逐个提问来细化创意
- 尽可能使用选择题，但开放式问题也可以
- 每条消息只问一个问题——如果某个主题需要更多探索，将其拆分为多个问题
- 专注于理解：目的、约束、成功标准

**探索方法：**
- 提出2-3种不同方法及其权衡
- 以对话方式展示选项，包括你的推荐和理由
- 首先展示你推荐的选项并解释原因

**展示设计：**
- 一旦你认为理解了要构建的内容，展示设计
- 根据复杂度调整每节篇幅：如果简单直白则几句话，如果微妙复杂则最多200-300字
- 每节后询问目前是否正确
- 涵盖：架构、组件、数据流、错误处理、测试
- 准备好在某处不合理时回头澄清

## 设计完成后

**文档化：**
- 将验证过的设计写入 `docs/plans/YYYY-MM-DD-<topic>-design.md`
- 如果可用，使用 elements-of-style:writing-clearly-and-concisely 技能
- 将设计文档提交到 git

**实现：**
- 调用 writing-plans 技能创建详细的实现计划
- 不要调用任何其他技能。writing-plans 是下一步。

## 核心原则

- **一次一个问题** - 不要用多个问题让人应接不暇
- **优先选择题** - 可能时比开放式问题更容易回答
- **严格遵循 YAGNI** - 从所有设计中删除不必要的功能
- **探索替代方案** - 在确定之前总是提出2-3种方法
- **增量验证** - 展示设计，在继续之前获得批准
- **保持灵活** - 当某事不合理时回头澄清
