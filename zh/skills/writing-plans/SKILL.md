---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# 编写计划

## 概述

编写全面的实现计划，假设工程师对我们的代码库零背景和可疑的品味。记录他们需要知道的一切：每个任务要触及哪些文件、代码、测试、他们可能需要检查的文档、如何测试。把整个计划作为小粒度任务给他们。DRY。YAGNI。TDD。频繁提交。

假设他们是熟练的开发者，但几乎不了解我们的工具集或问题领域。假设他们不太了解好的测试设计。

**开始时宣布：** "我正在使用 writing-plans 技能来创建实现计划。"

**背景：** 这应该在专用的 worktree 中运行（由 brainstorming 技能创建）。

**计划保存到：** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## 小粒度任务粒度

**每一步是一个动作（2-5 分钟）：**
- "写失败测试" - 步骤
- "运行它以确保失败" - 步骤
- "实现最小代码使测试通过" - 步骤
- "运行测试确保通过" - 步骤
- "提交" - 步骤

## 计划文档标题

**每个计划必须以此标题开始：**

```markdown
# [功能名称] 实现计划

> **给 Claude：** 必需子技能：使用 superpowers:executing-plans 逐任务实现这个计划。

**目标：** [一句话描述这构建什么]

**架构：** [2-3 句关于方法]

**技术栈：** [关键技术/库]

---
```

## 任务结构

````markdown
### 任务 N：[组件名称]

**文件：**
- 创建：`exact/path/to/file.py`
- 修改：`exact/path/to/existing.py:123-145`
- 测试：`tests/exact/path/to/test.py`

**步骤 1：写失败测试**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**步骤 2：运行测试验证失败**

运行：`pytest tests/path/test.py::test_name -v`
预期：FAIL with "function not defined"

**步骤 3：写最小实现**

```python
def function(input):
    return expected
```

**步骤 4：运行测试验证通过**

运行：`pytest tests/path/test.py::test_name -v`
预期：PASS

**步骤 5：提交**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: 添加具体功能"
```
````

## 记住
- 总是确切文件路径
- 计划中完整代码（不是"添加验证"）
- 确切命令和预期输出
- 用 @ 语法引用相关技能
- DRY、YAGNI、TDD、频繁提交

## 执行交接

保存计划后，提供执行选择：

**"计划完成并保存到 `docs/plans/<filename>.md`。两种执行选项：**

**1. 子 agent 驱动（本会话）** - 我为每个任务调度新子 agent，任务间审查，快速迭代

**2. 并行会话（单独）** - 在 worktree 中打开新会话，批量执行带检查点

**哪种方式？"**

**如果选择子 agent 驱动：**
- **必需子技能：** 使用 superpowers:subagent-driven-development
- 保留在此会话
- 每个任务新子 agent + 代码审查

**如果选择并行会话：**
- 引导他们在 worktree 中打开新会话
- **必需子技能：** 新会话使用 superpowers:executing-plans
