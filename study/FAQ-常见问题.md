# Superpowers 学习 FAQ

> 记录学习过程中提出的常见问题

---

## Q1: 安装了这个组件后，每个会话这个 HOOK 都会被调起吗？

**不是每个消息都触发，而是特定事件触发。**

从 `hooks.json` 可以看到：
```json
"matcher": "startup|resume|clear|compact"
```

这意味着 `SessionStart` hook 在以下场景触发：

| 事件 | 说明 |
|------|------|
| `startup` | 启动新的 Claude Code 会话 |
| `resume` | 恢复之前的会话（比如重新打开终端） |
| `clear` | 用户执行 `/clear` 命令清空对话 |
| `compact` | 会话被压缩（上下文过长时自动触发） |

**结论：**
- 普通对话中发送消息 → **不会触发** hook
- 新开一个会话 → **会触发** hook
- 执行 `/clear` → **会触发** hook

---

## Q2: Hook 机制每次注入上下文，是不是占用很大的 token？

**开销很小，设计精巧。**

### 实际数据

| 文件 | 大小 | 估算 Token |
|------|------|-----------|
| `using-superpowers/SKILL.md` | 4207 字节 / 95 行 | ~1000 tokens |

### 为什么可接受

1. **只在会话开始时注入一次**，不是每条消息都注入
2. **Claude Code 的上下文窗口是 200K tokens**，1000 tokens 只占 0.5%
3. **投资回报率高**：这点 token 让 AI 知道如何使用所有 skills，避免大量无效探索

### 懒加载设计

Superpowers 的设计是**懒加载**的：
- Hook 只注入 `using-superpowers` 这个"入口指南"（~1000 tokens）
- 其他 14 个 skills **不会自动加载**
- 只有 AI 识别需要时，才通过 `Skill` 工具加载具体的 skill

```
会话开始 → 注入 using-superpowers (~1000 tokens)
    ↓
用户："帮我调试这个 bug"
    ↓
AI 识别需要 systematic-debugging skill
    ↓
调用 Skill 工具 → 加载 systematic-debugging/SKILL.md（此时才占用额外 token）
```

**结论**：最小化基础开销，按需加载。

---

## Q3: 多个插件注册的 Hooks 会同时生效吗？对上下文有什么影响？

**是的，多个插件的 hooks 会同时生效。**

### 当前会话中注册的所有 Hooks

#### 全局 Hooks（来自 ~/.claude/settings.json）

| Hook 事件 | 脚本 | 作用 |
|-----------|------|------|
| UserPromptSubmit | optimize-prompt.sh | 每次发送消息时优化提示词 |
| PreToolUse | observe.sh pre | AI 使用工具前触发 |
| PostToolUse | observe.sh post | AI 使用工具后触发 |

#### Superpowers 插件 Hooks

| Hook 事件 | Matcher | 脚本 | 作用 |
|-----------|---------|------|------|
| SessionStart | startup\|resume\|clear\|compact | session-start.sh | 注入 using-superpowers skill |

### 对上下文的影响

#### 1. UserPromptSubmit Hook

- **来源**：claude-code-prompt-optimizer 插件
- **触发**：每次你发送消息时
- **影响**：可能会修改/优化你的提示词，然后通过 additional_context 注入额外信息

#### 2. PreToolUse / PostToolUse Hooks

- **来源**：everything-claude-code 插件的 continuous-learning-v2 skill
- **触发**：AI 每次使用工具前后
- **影响**：观察并记录工具使用情况，可能用于学习/分析

#### 3. SessionStart Hook

- **来源**：superpowers 插件
- **触发**：会话开始/恢复/清空时
- **影响**：注入 using-superpowers skill 内容，告诉 AI 如何使用 skills

### 总结

会话上下文主要受以下因素影响：

1. **UserPromptSubmit** → 每条消息都会经过优化器处理
2. **PreToolUse/PostToolUse** → 每次工具调用都会被观察
3. **SessionStart** → 会话开始时注入 superpowers 使用指南

这些 hooks 的额外输出（如 additional_context）会增加每次对话的 token 消耗。

---

## Q4: （待补充）

（学习过程中继续记录...）
