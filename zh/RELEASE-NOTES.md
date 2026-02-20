# Superpowers 发布说明

## v4.3.0 (2026-02-12)

此修复应显著提高 superpowers 技能的合规性，并减少 Claude 无意间进入其原生计划模式的可能性。

### 变更

**Brainstorming 技能现在强制执行其工作流程而不是描述它**

模型正在跳过设计阶段，直接跳到 frontend-design 等实现技能，或者将整个 brainstorming 过程压缩到单个文本块中。该技能现在使用硬性关卡、强制性检查清单和 graphviz 流程图来强制执行合规性：

- `<HARD-GATE>`：在设计展示并获得用户批准之前，不得使用实现技能、代码或脚手架
- 必须作为任务创建并按顺序完成的明确检查清单（6 项）
- Graphviz 流程图，`writing-plans` 作为唯一有效的终端状态
- 针对"这太简单了不需要设计"的反模式提醒——这正是模型用来跳过该流程的确切合理化借口
- 基于章节复杂度的设计章节大小，而非项目复杂度

**Using-superpowers 工作流程图拦截 EnterPlanMode**

向技能流程图添加了 `EnterPlanMode` 拦截器。当模型即将进入 Claude 的原生计划模式时，它会检查 brainstorming 是否已发生，并改为通过 brainstorming 技能路由。永远不会进入计划模式。

### 修复

**SessionStart 钩子现在同步运行**

将 hooks.json 中的 `async: true` 改为 `async: false`。异步时，钩子可能无法在模型的第一轮之前完成，这意味着 using-superpowers 指令在第一条消息时不在上下文中。

## v4.2.0 (2026-02-05)

### 重大变更

**Codex：用原生技能发现替换引导 CLI**

`superpowers-codex` 引导 CLI、Windows `.cmd` 包装器和相关的引导内容文件已被移除。Codex 现在通过 `~/.agents/skills/superpowers/` 符号链接使用原生技能发现，因此不再需要旧的 `use_skill`/`find_skills` CLI 工具。

安装现在只是 clone + symlink（在 INSTALL.md 中有文档记录）。不需要 Node.js 依赖。旧的 `~/.codex/skills/` 路径已弃用。

### 修复

**Windows：修复 Claude Code 2.1.x 钩子执行 (#331)**

Claude Code 2.1.x 改变了在 Windows 上执行钩子的方式：它现在自动检测命令中的 `.sh` 文件并添加 `bash` 前缀。这破坏了多语言包装器模式，因为 `bash "run-hook.cmd" session-start.sh` 试图将 `.cmd` 文件作为 bash 脚本执行。

修复：hooks.json 现在直接调用 session-start.sh。Claude Code 2.1.x 自动处理 bash 调用。还添加了 .gitattributes 以强制 shell 脚本使用 LF 行尾（修复 Windows checkout 上的 CRLF 问题）。

**Windows：SessionStart 钩子异步运行以防止终端冻结 (#404, #413, #414, #419)**

同步的 SessionStart 钩子阻止 TUI 在 Windows 上进入原始模式，冻结所有键盘输入。异步运行钩子可以防止冻结，同时仍然注入 superpowers 上下文。

**Windows：修复 O(n^2) `escape_for_json` 性能**

使用 `${input:$i:1}` 的逐字符循环在 bash 中是 O(n^2)，原因是子字符串复制开销。在 Windows Git Bash 上，这需要 60 多秒。替换为 bash 参数替换（`${s//old/new}`），它将每个模式作为单个 C 级别传递运行——在 macOS 上快 7 倍，在 Windows 上显著更快。

**Codex：修复 Windows/PowerShell 调用 (#285, #243)**

- Windows 不遵循 shebang，因此直接调用无扩展名的 `superpowers-codex` 脚本会触发"打开方式"对话框。所有调用现在都以 `node` 为前缀。
- 修复了 Windows 上的 `~/` 路径扩展——PowerShell 在将 `~` 作为参数传递给 `node` 时不会扩展它。改为 `$HOME`，它在 bash 和 PowerShell 中都能正确扩展。

**Codex：修复安装程序中的路径解析**

使用 `fileURLToPath()` 代替手动 URL 路径名解析，以正确处理所有平台上包含空格和特殊字符的路径。

**Codex：修复 writing-skills 中的过时技能路径**

将 `~/.codex/skills/` 引用（已弃用）更新为 `~/.agents/skills/` 以进行原生发现。

### 改进

**实现前现在需要 Worktree 隔离**

将 `using-git-worktrees` 添加为 `subagent-driven-development` 和 `executing-plans` 的必需技能。实现工作流程现在明确要求在开始工作之前设置隔离的 worktree，防止直接在 main 上意外工作。

**主分支保护软化为需要明确同意**

技能现在不再完全禁止主分支工作，而是允许在用户明确同意的情况下进行。更加灵活，同时仍然确保用户意识到其影响。

**简化安装验证**

从验证步骤中删除了 `/help` 命令检查和特定的斜杠命令列表。技能主要通过描述你想做什么来调用，而不是通过运行特定命令。

**Codex：在引导中澄清子代理工具映射**

改进了 Codex 工具如何映射到 Claude Code 等效项以用于子代理工作流程的文档。

### 测试

- 为 subagent-driven-development 添加了 worktree 要求测试
- 添加了主分支红旗警告测试
- 修复了技能识别测试断言中的大小写敏感性

---

## v4.1.1 (2026-01-23)

### 修复

**OpenCode：按照官方文档标准化为 `plugins/` 目录 (#343)**

OpenCode 的官方文档使用 `~/.config/opencode/plugins/`（复数）。我们的文档以前使用 `plugin/`（单数）。虽然 OpenCode 接受两种形式，但我们已标准化为官方约定以避免混淆。

变更：
- 在仓库结构中将 `.opencode/plugin/` 重命名为 `.opencode/plugins/`
- 更新了所有平台的安装文档（INSTALL.md、README.opencode.md）
- 更新测试脚本以匹配

**OpenCode：修复符号链接指令 (#339, #342)**

- 在 `ln -s` 之前添加了明确的 `rm`（修复重新安装时的"文件已存在"错误）
- 添加了 INSTALL.md 中缺失的技能符号链接步骤
- 从已弃用的 `use_skill`/`find_skills` 更新为原生 `skill` 工具引用

---

## v4.1.0 (2026-01-23)

### 重大变更

**OpenCode：切换到原生技能系统**

Superpowers for OpenCode 现在使用 OpenCode 的原生 `skill` 工具而不是自定义 `use_skill`/`find_skills` 工具。这是一个更干净的集成，与 OpenCode 的内置技能发现一起工作。

**需要迁移：** 技能必须符号链接到 `~/.config/opencode/skills/superpowers/`（参见更新的安装文档）。

### 修复

**OpenCode：修复会话开始时的代理重置 (#226)**

以前使用 `session.prompt({ noReply: true })` 的引导注入方法导致 OpenCode 在第一条消息时将选定的代理重置为"build"。现在使用 `experimental.chat.system.transform` 钩子，它直接修改系统提示而没有副作用。

**OpenCode：修复 Windows 安装 (#232)**

- 移除了对 `skills-core.js` 的依赖（消除了文件被复制而不是符号链接时损坏的相对导入）
- 为 cmd.exe、PowerShell 和 Git Bash 添加了全面的 Windows 安装文档
- 记录了每个平台的正确符号链接与连接使用方式

**Claude Code：修复 Claude Code 2.1.x 的 Windows 钩子执行**

Claude Code 2.1.x 改变了在 Windows 上执行钩子的方式：它现在自动检测 `.sh` 文件在命令中并添加 `bash` 前缀。这破坏了多语言包装器模式，因为 `bash "run-hook.cmd" session-start.sh` 试图将 .cmd 文件作为 bash 脚本执行。

修复：hooks.json 现在直接调用 session-start.sh。Claude Code 2.1.x 自动处理 bash 调用。还添加了 .gitattributes 以强制 shell 脚本使用 LF 行尾（修复 Windows checkout 上的 CRLF 问题）。

---

## v4.0.3 (2025-12-26)

### 改进

**加强了 using-superpowers 技能以处理明确的技能请求**

解决了一个失败模式，即即使用户明确按名称请求技能（例如，"subagent-driven-development, please"），Claude 也会跳过调用该技能。Claude 会认为"我知道那是什么意思"并直接开始工作，而不是加载技能。

变更：
- 更新"The Rule"为"调用相关或请求的技能"而不是"检查技能"——强调主动调用而非被动检查
- 添加了"在任何响应或行动之前"——原始措辞只提到"响应"，但 Claude 有时会在不先响应的情况下采取行动
- 添加了保证调用错误技能是可以的——减少犹豫
- 添加了新的红旗："我知道那是什么意思" → 知道概念 ≠ 使用技能

**添加了明确的技能请求测试**

`tests/explicit-skill-requests/` 中的新测试套件，验证当用户按名称请求技能时 Claude 正确调用它们。包括单轮和多轮测试场景。

## v4.0.2 (2025-12-23)

### 修复

**斜杠命令现在仅限用户使用**

为所有三个斜杠命令（`/brainstorm`、`/execute-plan`、`/write-plan`）添加了 `disable-model-invocation: true`。Claude 现在不能通过 Skill 工具调用这些命令——它们仅限于手动用户调用。

底层技能（`superpowers:brainstorming`、`superpowers:executing-plans`、`superpowers:writing-plans`）仍然可供 Claude 自主调用。此更改防止了 Claude 调用只是重定向到技能的命令时的混淆。

## v4.0.1 (2025-12-23)

### 修复

**澄清了如何在 Claude Code 中访问技能**

修复了一个令人困惑的模式，即 Claude 会通过 Skill 工具调用技能，然后尝试单独读取技能文件。`using-superpowers` 技能现在明确说明 Skill 工具直接加载技能内容——不需要读取文件。

- 向 `using-superpowers` 添加了"如何访问技能"部分
- 将指令中的"读取技能"改为"调用技能"
- 更新斜杠命令以使用完全限定的技能名称（例如，`superpowers:brainstorming`）

**向 receiving-code-review 添加了 GitHub 线程回复指南** (h/t @ralphbean)

添加了关于在原始线程中回复内联审查注释而不是作为顶级 PR 注释的说明。

**向 writing-skills 添加了自动化优于文档的指南** (h/t @EthanJStark)

添加了指导，即机械约束应该自动化，而不是文档化——将技能保留给判断调用。

## v4.0.0 (2025-12-17)

### 新功能

**subagent-driven-development 中的两阶段代码审查**

子代理工作流程现在在每个任务后使用两个单独的审查阶段：

1. **规格合规性审查** - 怀疑的审查者验证实现完全匹配规格。捕获缺失的需求和过度构建。不会信任实现者的报告——阅读实际代码。

2. **代码质量审查** - 仅在规格合规性通过后运行。审查清洁代码、测试覆盖率、可维护性。

这捕获了代码编写良好但不匹配请求的常见失败模式。审查是循环的，不是一次性的：如果审查者发现问题，实现者修复它们，然后审查者再次检查。

其他子代理工作流程改进：
- 控制器向工作器提供完整的任务文本（不是文件引用）
- 工作器可以在工作之前和期间提出澄清问题
- 报告完成前的自我审查检查清单
- 计划在开始时读取一次，提取到 TodoWrite

`skills/subagent-driven-development/` 中的新提示模板：
- `implementer-prompt.md` - 包括自我审查检查清单，鼓励提问
- `spec-reviewer-prompt.md` - 针对需求的怀疑验证
- `code-quality-reviewer-prompt.md` - 标准代码审查

**调试技术与工具整合**

`systematic-debugging` 现在捆绑了支持技术和工具：
- `root-cause-tracing.md` - 通过调用堆栈向后追踪 bug
- `defense-in-depth.md` - 在多个层添加验证
- `condition-based-waiting.md` - 用条件轮询替换任意超时
- `find-polluter.sh` - 用于查找哪个测试创建污染的二分脚本
- `condition-based-waiting-example.ts` - 来自真实调试会话的完整实现

**测试反模式参考**

`test-driven-development` 现在包括涵盖以下内容的 `testing-anti-patterns.md`：
- 测试模拟行为而不是真实行为
- 向生产类添加仅用于测试的方法
- 在不了解依赖项的情况下进行模拟
- 隐藏结构假设的不完整模拟

**技能测试基础设施**

三个新的测试框架用于验证技能行为：

`tests/skill-triggering/` - 验证技能从朴素提示触发而无需明确命名。测试 6 个技能以确保仅描述就足够了。

`tests/claude-code/` - 使用 `claude -p` 进行无头测试的集成测试。通过会话转录（JSONL）分析验证技能使用。包括用于成本跟踪的 `analyze-token-usage.py`。

`tests/subagent-driven-dev/` - 具有两个完整测试项目的端到端工作流程验证：
- `go-fractals/` - 带有 Sierpinski/Mandelbrot 的 CLI 工具（10 个任务）
- `svelte-todo/` - 带有 localStorage 和 Playwright 的 CRUD 应用（12 个任务）

### 主要变更

**DOT 流程图作为可执行规范**

使用 DOT/GraphViz 流程图作为权威流程定义重写了关键技能。散文成为支持内容。

**描述陷阱**（在 `writing-skills` 中记录）：发现当描述包含工作流程摘要时，技能描述会覆盖流程图内容。Claude 遵循简短描述而不是阅读详细的流程图。修复：描述必须仅用于触发（"在 X 时使用"），没有流程细节。

**using-superpowers 中的技能优先级**

当多个技能适用时，流程技能（brainstorming、debugging）现在明确优先于实现技能。"构建 X"首先触发 brainstorming，然后是领域技能。

**brainstorming 触发器加强**

描述改为命令式："在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。"

### 重大变更

**技能整合** - 合并了六个独立技能：
- `root-cause-tracing`、`defense-in-depth`、`condition-based-waiting` → 捆绑在 `systematic-debugging/` 中
- `testing-skills-with-subagents` → 捆绑在 `writing-skills/` 中
- `testing-anti-patterns` → 捆绑在 `test-driven-development/` 中
- `sharing-skills` 已移除（过时）

### 其他改进

- **render-graphs.js** - 从技能中提取 DOT 图表并渲染为 SVG 的工具
- **using-superpowers 中的合理化表** - 可扫描的格式，包括新条目："我首先需要更多上下文"、"让我先探索"、"这感觉很有成效"
- **docs/testing.md** - 使用 Claude Code 集成测试测试技能的指南

---

## v3.6.2 (2025-12-03)

### 修复

- **Linux 兼容性**：修复多语言钩子包装器（`run-hook.cmd`）以使用符合 POSIX 的语法
  - 在第 16 行将 bash 特定的 `${BASH_SOURCE[0]:-$0}` 替换为标准的 `$0`
  - 解决了 Ubuntu/Debian 系统上的"Bad substitution"错误，其中 `/bin/sh` 是 dash
  - 修复 #141

---

## v3.5.1 (2025-11-24)

### 变更

- **OpenCode 引导重构**：从 `chat.message` 钩子切换到 `session.created` 事件进行引导注入
  - 引导现在通过带有 `noReply: true` 的 `session.prompt()` 在会话创建时注入
  - 明确告诉模型 using-superpowers 已经加载以防止冗余技能加载
  - 将引导内容生成整合到共享的 `getBootstrapContent()` 帮助器中
  - 更干净的单实现方法（移除了回退模式）

---

## v3.5.0 (2025-11-23)

### 添加

- **OpenCode 支持**：OpenCode.ai 的原生 JavaScript 插件
  - 自定义工具：`use_skill` 和 `find_skills`
  - 用于在上下文压缩期间保持技能的消息插入模式
  - 通过 chat.message 钩子自动上下文注入
  - session.compacted 事件时自动重新注入
  - 三层技能优先级：项目 > 个人 > superpowers
  - 项目本地技能支持（`.opencode/skills/`）
  - 与 Codex 共享核心模块（`lib/skills-core.js`）以进行代码重用
  - 具有适当隔离的自动化测试套件（`tests/opencode/`）
  - 特定平台的文档（`docs/README.opencode.md`、`docs/README.codex.md`）

### 变更

- **重构 Codex 实现**：现在使用共享的 `lib/skills-core.js` ES 模块
  - 消除了 Codex 和 OpenCode 之间的代码重复
  - 技能发现和解析的单一真相来源
  - Codex 通过 Node.js 互操作成功加载 ES 模块

- **改进文档**：重写 README 以清晰地解释问题/解决方案
  - 移除了重复的部分和冲突的信息
  - 添加了完整的工作流程描述（brainstorm → plan → execute → finish）
  - 简化了平台安装说明
  - 强调技能检查协议而不是自动激活声明

---

## v3.4.1 (2025-10-31)

### 改进

- 优化了 superpowers 引导以消除冗余的技能执行。`using-superpowers` 技能内容现在直接在会话上下文中提供，并有明确的指导仅将 Skill 工具用于其他技能。这减少了开销，并防止了代理尽管已经从会话开始就有内容但仍手动执行 `using-superpowers` 的令人困惑的循环。

## v3.4.0 (2025-10-30)

### 改进

- 简化了 `brainstorming` 技能以回归原始的对话愿景。移除了重量级的 6 阶段流程和正式检查清单，改为自然对话：一次问一个问题，然后以 200-300 字的部分展示设计并进行验证。保留了文档和实现交接功能。

## v3.3.1 (2025-10-28)

### 改进

- 更新了 `brainstorming` 技能，要求在提问之前进行自主侦察，鼓励以推荐驱动决策，并防止代理将优先级排序委托回人类。
- 遵循 Strunk 的"风格的要素"原则对 `brainstorming` 技能应用了写作清晰度改进（省略不必要的词、将否定转换为肯定形式、改进平行结构）。

### 错误修复

- 澄清了 `writing-skills` 指南，使其指向正确的代理特定个人技能目录（Claude Code 为 `~/.claude/skills`，Codex 为 `~/.codex/skills`）。

## v3.3.0 (2025-10-28)

### 新功能

**实验性 Codex 支持**
- 添加了统一的 `superpowers-codex` 脚本，带有 bootstrap/use-skill/find-skills 命令
- 跨平台 Node.js 实现（适用于 Windows、macOS、Linux）
- 命名空间技能：superpowers 技能为 `superpowers:skill-name`，个人技能为 `skill-name`
- 当名称匹配时，个人技能覆盖 superpowers 技能
- 清晰的技能显示：显示名称/描述而没有原始前置内容
- 有用的上下文：显示每个技能的支持文件目录
- Codex 的工具映射：TodoWrite→update_plan、subagents→manual fallback 等
- 带有最小 AGENTS.md 的引导集成以实现自动启动
- 特定于 Codex 的完整安装指南和引导指令

**与 Claude Code 集成的关键区别：**
- 单一统一脚本而不是单独的工具
- Codex 特定等效项的工具替换系统
- 简化的子代理处理（手动工作而不是委托）
- 更新的术语："Superpowers 技能"而不是"核心技能"

### 添加的文件
- `.codex/INSTALL.md` - Codex 用户的安装指南
- `.codex/superpowers-bootstrap.md` - 带有 Codex 适配的引导指令
- `.codex/superpowers-codex` - 具有所有功能的统一 Node.js 可执行文件

**注意：** Codex 支持是实验性的。该集成提供核心 superpowers 功能，但可能需要根据用户反馈进行改进。

## v3.2.3 (2025-10-23)

### 改进

**更新 using-superpowers 技能以使用 Skill 工具而不是 Read 工具**
- 将技能调用指令从 Read 工具更改为 Skill 工具
- 更新描述："使用 Read 工具" → "使用 Skill 工具"
- 更新步骤 3："使用 Read 工具" → "使用 Skill 工具读取并运行"
- 更新合理化列表："读取当前版本" → "运行当前版本"

Skill 工具是在 Claude Code 中调用技能的正确机制。此更新更正了引导指令以引导代理使用正确的工具。

### 更改的文件
- 已更新：`skills/using-superpowers/SKILL.md` - 将工具引用从 Read 更改为 Skill

## v3.2.2 (2025-10-21)

### 改进

**加强了 using-superpowers 技能以对抗代理合理化**
- 添加了带有关于强制性技能检查的绝对语言的 EXTREMELY-IMPORTANT 块
  - "即使有 1% 的可能性技能适用，你也必须阅读它"
  - "你没有选择。你无法合理化你的方式逃避。"
- 添加了 MANDATORY FIRST RESPONSE PROTOCOL 检查清单
  - 代理在任何响应之前必须完成的 5 步流程
  - 明确的"没有这个就响应 = 失败"后果
- 添加了包含 8 个具体逃避模式的常见合理化部分
  - "这只是一个简单的问题" → 错误
  - "我可以快速检查文件" → 错误
  - "让我先收集信息" → 错误
  - 还有观察到的代理行为中的 5 个以上模式

这些更改解决了观察到的代理行为，即尽管有明确的指令，它们仍然围绕技能使用进行合理化。强硬的语言和先发制人的反驳旨在使不合规更加困难。

### 更改的文件
- 已更新：`skills/using-superpowers/SKILL.md` - 添加了三层强制执行以防止跳过技能的合理化

## v3.2.1 (2025-10-20)

### 新功能

**代码审查代理现在包含在插件中**
- 向插件的 `agents/` 目录添加了 `superpowers:code-reviewer` 代理
- 代理根据计划和编码标准提供系统化的代码审查
- 以前要求用户拥有个人代理配置
- 所有技能引用更新为使用命名空间的 `superpowers:code-reviewer`
- 修复 #55

### 更改的文件
- 新增：`agents/code-reviewer.md` - 带有审查检查清单和输出格式的代理定义
- 已更新：`skills/requesting-code-review/SKILL.md` - 对 `superpowers:code-reviewer` 的引用
- 已更新：`skills/subagent-driven-development/SKILL.md` - 对 `superpowers:code-reviewer` 的引用

## v3.2.0 (2025-10-18)

### 新功能

**Brainstorming 工作流程中的设计文档**
- 向 brainstorming 技能添加了阶段 4：设计文档
- 设计文档现在在实现之前写入 `docs/plans/YYYY-MM-DD-<topic>-design.md`
- 恢复了在技能转换期间丢失的原始 brainstorming 命令的功能
- 文档在 worktree 设置和实现计划之前编写
- 使用子代理测试以验证在时间压力下的合规性

### 重大变更

**技能引用命名空间标准化**
- 所有内部技能引用现在使用 `superpowers:` 命名空间前缀
- 更新格式：`superpowers:test-driven-development`（以前只是 `test-driven-development`）
- 影响所有 REQUIRED SUB-SKILL、RECOMMENDED SUB-SKILL 和 REQUIRED BACKGROUND 引用
- 与使用 Skill 工具调用技能的方式保持一致
- 更新的文件：brainstorming、executing-plans、subagent-driven-development、systematic-debugging、testing-skills-with-subagents、writing-plans、writing-skills

### 改进

**设计与实现计划命名**
- 设计文档使用 `-design.md` 后缀以防止文件名冲突
- 实现计划继续使用现有的 `YYYY-MM-DD-<feature-name>.md` 格式
- 两者都存储在 `docs/plans/` 目录中，具有清晰的命名区分

## v3.1.1 (2025-10-17)

### 错误修复

- **修复了 README 中的命令语法** (#44) - 更新了所有命令引用以使用正确的命名空间语法（`/superpowers:brainstorm` 而不是 `/brainstorm`）。插件提供的命令由 Claude Code 自动命名空间化以避免插件之间的冲突。

## v3.1.0 (2025-10-17)

### 重大变更

**技能名称标准化为小写**
- 所有技能前置内容 `name:` 字段现在使用与目录名称匹配的小写 kebab-case
- 示例：`brainstorming`、`test-driven-development`、`using-git-worktrees`
- 所有技能公告和交叉引用更新为小写格式
- 这确保了目录名称、前置内容和文档之间的命名一致

### 新功能

**增强的 brainstorming 技能**
- 添加了显示阶段、活动和工具使用的快速参考表
- 添加了可复制的工作流程检查清单用于跟踪进度
- 添加了何时重新访问早期阶段的决策流程图
- 添加了带有具体示例的全面 AskUserQuestion 工具指南
- 添加了"问题模式"部分，解释何时使用结构化与开放式问题
- 将关键原则重组为可扫描的表

**Anthropic 最佳实践集成**
- 添加了 `skills/writing-skills/anthropic-best-practices.md` - 官方 Anthropic 技能编写指南
- 在 writing-skills SKILL.md 中引用以获得全面的指导
- 提供了渐进式披露、工作流程和评估的模式

### 改进

**技能交叉引用清晰度**
- 所有技能引用现在使用明确的要求标记：
  - `**REQUIRED BACKGROUND:**` - 你必须理解的先决条件
  - `**REQUIRED SUB-SKILL:**` - 工作流程中必须使用的技能
  - `**Complementary skills:**` - 可选但有帮助的相关技能
- 移除了旧的路径格式（`skills/collaboration/X` → 只是 `X`）
- 使用分类关系（必需 vs 互补）更新了集成部分
- 使用最佳实践更新了交叉引用文档

**与 Anthropic 最佳实践保持一致**
- 修复了描述语法和语气（完全第三人称）
- 添加了用于扫描的快速参考表
- 添加了 Claude 可以复制和跟踪的工作流程检查清单
- 适当地使用流程图处理非明显的决策点
- 改进了可扫描的表格式
- 所有技能都远低于 500 行的建议

### 错误修复

- **重新添加了缺失的命令重定向** - 恢复了在 v3.0 迁移中意外删除的 `commands/brainstorm.md` 和 `commands/write-plan.md`
- 修复了 `defense-in-depth` 名称不匹配（曾是 `Defense-in-Depth-Validation`）
- 修复了 `receiving-code-review` 名称不匹配（曾是 `Code-Review-Reception`）
- 修复了 `commands/brainstorm.md` 对正确技能名称的引用
- 移除了对不存在相关技能的引用

### 文档

**writing-skills 改进**
- 使用明确的要求标记更新了交叉引用指导
- 添加了对 Anthropic 官方最佳实践的引用
- 改进了显示正确技能引用格式的示例

## v3.0.1 (2025-10-16)

### 变更

我们现在使用 Anthropic 的第一方技能系统！

## v2.0.2 (2025-10-12)

### 错误修复

- **修复了当本地技能仓库领先于上游时的错误警告** - 初始化脚本在本地仓库有领先于上游的提交时错误地警告"New skills available from upstream"。逻辑现在正确区分三种 git 状态：本地落后（应该更新）、本地领先（无警告）、已分叉（应该警告）。

## v2.0.1 (2025-10-12)

### 错误修复

- **修复了插件上下文中的 session-start 钩子执行** (#8, PR #9) - 钩子以"Plugin hook error"静默失败，阻止技能上下文加载。修复方法：
  - 当 BASH_SOURCE 在 Claude Code 的执行上下文中未绑定时，使用 `${BASH_SOURCE[0]:-$0}` 回退
  - 添加 `|| true` 以优雅地处理过滤状态标志时的空 grep 结果

---

# Superpowers v2.0.0 发布说明

## 概述

Superpowers v2.0 通过重大的架构转变，使技能更易于访问、维护和社区驱动。

头条变化是**技能仓库分离**：所有技能、脚本和文档都已从插件移动到专用仓库（[obra/superpowers-skills](https://github.com/obra/superpowers-skills)）。这把 superpowers 从单体插件转变为管理技能仓库本地克隆的轻量级 shim。技能在会话开始时自动更新。用户通过标准 git 工作流程 fork 和贡献改进。技能库独立于插件版本控制。

除了基础设施，此版本添加了九个新技能，专注于问题解决、研究和架构。我们用命令式语气和更清晰的结构重写了核心 **using-skills** 文档，使 Claude 更容易理解何时以及如何使用技能。**find-skills** 现在输出你可以直接粘贴到 Read 工具的路径，消除了技能发现工作流程中的摩擦。

用户体验无缝操作：插件自动处理克隆、fork 和更新。贡献者发现新架构使改进和分享技能变得简单。此版本为技能作为社区资源快速发展奠定了基础。

## 重大变更

### 技能仓库分离

**最大的变化：** 技能不再存在于插件中。它们已被移动到 [obra/superpowers-skills](https://github.com/obra/superpowers-skills) 的单独仓库。

**这对你的意义：**

- **首次安装：** 插件自动将技能克隆到 `~/.config/superpowers/skills/`
- **Fork：** 在设置期间，你将被提供 fork 技能仓库的选项（如果安装了 `gh`）
- **更新：** 技能在会话开始时自动更新（尽可能快进）
- **贡献：** 在分支上工作，本地提交，向上游提交 PR
- **不再有遮蔽：** 旧的两层系统（个人/核心）替换为单仓库分支工作流程

**迁移：**

如果你有现有的安装：
1. 你的旧 `~/.config/superpowers/.git` 将备份到 `~/.config/superpowers/.git.bak`
2. 旧技能将备份到 `~/.config/superpowers/skills.bak`
3. 将在 `~/.config/superpowers/skills/` 创建 obra/superpowers-skills 的新克隆

### 移除的功能

- **个人 superpowers 覆盖系统** - 替换为 git 分支工作流程
- **setup-personal-superpowers 钩子** - 被 initialize-skills.sh 替换

## 新功能

### 技能仓库基础设施

**自动克隆和设置**（`lib/initialize-skills.sh`）
- 首次运行时克隆 obra/superpowers-skills
- 如果安装了 GitHub CLI 则提供 fork 创建
- 正确设置 upstream/origin 远程
- 处理从旧安装的迁移

**自动更新**
- 每次会话开始时从跟踪远程获取
- 尽可能使用快进自动合并
- 需要手动同步时通知（分支分叉）
- 使用 pulling-updates-from-skills-repository 技能进行手动同步

### 新技能

**问题解决技能**（`skills/problem-solving/`）
- **collision-zone-thinking** - 强制不相关的概念在一起以产生涌现的洞察
- **inversion-exercise** - 翻转假设以揭示隐藏的约束
- **meta-pattern-recognition** - 跨领域发现通用原则
- **scale-game** - 在极端情况下测试以暴露基本真理
- **simplification-cascades** - 寻找能消除多个组件的洞察
- **when-stuck** - 调度到正确的问题解决技术

**研究技能**（`skills/research/`）
- **tracing-knowledge-lineages** - 理解思想如何随时间演变

**架构技能**（`skills/architecture/`）
- **preserving-productive-tensions** - 保留多种有效方法而不是强制过早解决

### 技能改进

**using-skills（原 getting-started）**
- 从 getting-started 重命名为 using-skills
- 用命令式语气完全重写（v4.0.0）
- 前置关键规则
- 为所有工作流程添加了"为什么"解释
- 引用中始终包含 /SKILL.md 后缀
- 更清晰地区分刚性规则和灵活模式

**writing-skills**
- 交叉引用指导从 using-skills 移动
- 添加了令牌效率部分（字数目标）
- 改进了 CSO（Claude Search Optimization）指导

**sharing-skills**
- 为新的分支和 PR 工作流程更新（v2.0.0）
- 移除了个人/核心分割引用

**pulling-updates-from-skills-repository**（新）
- 与上游同步的完整工作流程
- 替换旧的"updating-skills"技能

### 工具改进

**find-skills**
- 现在输出带有 /SKILL.md 后缀的完整路径
- 使路径可直接与 Read 工具一起使用
- 更新了帮助文本

**skill-run**
- 从 scripts/ 移动到 skills/using-skills/
- 改进了文档

### 插件基础设施

**会话开始钩子**
- 现在从技能仓库位置加载
- 在会话开始时显示完整技能列表
- 打印技能位置信息
- 显示更新状态（成功更新 / 落后于上游）
- 将"技能落后"警告移到输出末尾

**环境变量**
- `SUPERPOWERS_SKILLS_ROOT` 设置为 `~/.config/superpowers/skills`
- 在所有路径中一致使用

## 错误修复

- 修复了 fork 时的重复上游远程添加
- 修复了 find-skills 输出中的双重"skills/"前缀
- 从 session-start 中移除了过时的 setup-personal-superpowers 调用
- 修复了钩子和命令中的路径引用

## 文档

### README
- 为新的技能仓库架构更新
- 突出链接到 superpowers-skills 仓库
- 更新了自动更新描述
- 修复了技能名称和引用
- 更新了 Meta 技能列表

### 测试文档
- 添加了全面的测试检查清单（`docs/TESTING-CHECKLIST.md`）
- 创建了用于测试的本地市场配置
- 记录了手动测试场景

## 技术细节

### 文件变更

**添加：**
- `lib/initialize-skills.sh` - 技能仓库初始化和自动更新
- `docs/TESTING-CHECKLIST.md` - 手动测试场景
- `.claude-plugin/marketplace.json` - 本地测试配置

**移除：**
- `skills/` 目录（82 个文件）- 现在在 obra/superpowers-skills
- `scripts/` 目录 - 现在在 obra/superpowers-skills/skills/using-skills/
- `hooks/setup-personal-superpowers.sh` - 已过时

**修改：**
- `hooks/session-start.sh` - 使用来自 ~/.config/superpowers/skills 的技能
- `commands/brainstorm.md` - 更新路径到 SUPERPOWERS_SKILLS_ROOT
- `commands/write-plan.md` - 更新路径到 SUPERPOWERS_SKILLS_ROOT
- `commands/execute-plan.md` - 更新路径到 SUPERPOWERS_SKILLS_ROOT
- `README.md` - 为新架构完全重写

### 提交历史

此版本包括：
- 20+ 次用于技能仓库分离的提交
- PR #1：受 Amplifier 启发的问题解决和研究技能
- PR #2：个人 superpowers 覆盖系统（后来被替换）
- 多项技能改进和文档改进

## 升级说明

### 全新安装

```bash
# 在 Claude Code 中
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

插件自动处理一切。

### 从 v1.x 升级

1. **备份你的个人技能**（如果有的话）：
   ```bash
   cp -r ~/.config/superpowers/skills ~/superpowers-skills-backup
   ```

2. **更新插件：**
   ```bash
   /plugin update superpowers
   ```

3. **在下一次会话开始时：**
   - 旧安装将自动备份
   - 将克隆新的技能仓库
   - 如果你有 GitHub CLI，你将被提供 fork 选项

4. **迁移个人技能**（如果有的话）：
   - 在你的本地技能仓库中创建一个分支
   - 从备份复制你的个人技能
   - 提交并推送到你的 fork
   - 考虑通过 PR 贡献回来

## 接下来是什么

### 对于用户

- 探索新的问题解决技能
- 尝试基于分支的工作流程进行技能改进
- 向社区贡献技能

### 对于贡献者

- 技能仓库现在位于 https://github.com/obra/superpowers-skills
- Fork → Branch → PR 工作流程
- 参见 skills/meta/writing-skills/SKILL.md 了解文档的 TDD 方法

## 已知问题

目前没有。

## 致谢

- 受 Amplifier 模式启发的问题解决技能
- 社区贡献和反馈
- 对技能有效性的广泛测试和迭代

---

**完整变更日志：** https://github.com/obra/superpowers/compare/dd013f6...main
**技能仓库：** https://github.com/obra/superpowers-skills
**问题反馈：** https://github.com/obra/superpowers/issues
