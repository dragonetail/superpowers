# Agent Skill 设计与编写向导

> 综合来源:
> - [Google Cloud Tech — 5 Agent Skill Design Patterns](https://x.com/GoogleCloudTech/status/2033953579824758855)
> - [Anthropic — Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## 概述

本向导分为两部分：**设计模式**（如何设计 Skill 的结构与交互方式）和**编写最佳实践**（如何写出高质量、易发现、高效率的 Skill）。

# 第一部分：设计模式

**5 种模式速览：**

| 模式 | 核心用途 | 典型场景 |
|------|---------|---------|
| Tool Wrapper | 将 Agent 变为某个领域的即时专家 | 框架最佳实践、编码规范 |
| Generator | 基于模板生成结构化文档 | 技术报告、API 文档 |
| Reviewer | 按检查清单对输入进行评分 | 代码审查、质量审计 |
| Inversion | Agent 先采访用户，再执行操作 | 需求收集、项目规划 |
| Pipeline | 强制执行多步骤工作流，含检查点 | 文档生成流水线、发布流程 |

---

## 模式 1: Tool Wrapper（工具包装器）

**核心思想：** 将领域知识（最佳实践、规范文档）封装为 Skill，让 Agent 成为该领域的即时专家。

**适用场景：**
- Agent 需要遵循特定框架/库的编码规范
- 需要对代码进行规范性审查

**SKILL.md 模板：**

```yaml
# skills/<领域>-expert/SKILL.md
---
name: <领域>-expert
description: <领域>开发最佳实践与规范。当构建、审查或调试相关应用时使用。
metadata:
  pattern: tool-wrapper
  domain: <领域>
---

你是 <领域> 开发专家。将以下规范应用到用户的代码或问题中。

## 核心规范

加载 'references/conventions.md' 获取完整的最佳实践列表。

## 审查代码时
1. 加载规范参考
2. 将用户代码与每条规范进行比对
3. 对每个违规项，引用具体规则并建议修复方案

## 编写代码时
1. 加载规范参考
2. 严格遵循每条规范
3. 为所有函数签名添加类型注解
4. 使用 Annotated 风格进行依赖注入
```

**关键点：**
- 将规范内容放在 `references/` 目录下，而非内联到 SKILL.md 中
- Skill 描述中的触发词要精确（如框架名、文件类型）

---

## 模式 2: Generator（生成器）

**核心思想：** 基于预定义模板和风格指南，从用户提供的要素中生成结构化输出。

**适用场景：**
- 生成技术报告、分析文档
- 产出具有固定格式的结构化内容

**SKILL.md 模板：**

```yaml
# skills/report-generator/SKILL.md
---
name: report-generator
description: 生成结构化技术报告（Markdown 格式）。当用户要求撰写、创建或起草报告/总结/分析文档时使用。
metadata:
  pattern: generator
  output-format: markdown
---

你是技术报告生成器。严格按以下步骤执行：

Step 1: 加载 'references/style-guide.md' 获取语气和格式规则。

Step 2: 加载 'assets/report-template.md' 获取所需的输出结构。

Step 3: 向用户询问填充模板所需的缺失信息：
- 主题或课题
- 关键发现或数据点
- 目标读者（技术人员、管理层、通用）

Step 4: 按照风格指南规则填充模板。模板中的每个章节都必须出现在输出中。

Step 5: 以单一 Markdown 文档形式返回完成的报告。
```

**关键点：**
- 模板（`assets/`）与风格指南（`references/`）分离
- 强制要求模板中每个章节都必须出现

---

## 模式 3: Reviewer（审查器）

**核心思想：** 按预定义检查清单对输入进行系统性评审，按严重程度分类输出发现。

**适用场景：**
- 代码质量审查
- 安全审计
- 文档合规性检查

**SKILL.md 模板：**

```yaml
# skills/code-reviewer/SKILL.md
---
name: code-reviewer
description: 审查 Python 代码的质量、风格和常见 Bug。当用户提交代码审查、请求反馈或要求代码审计时使用。
metadata:
  pattern: reviewer
  severity-levels: error,warning,info
---

你是 Python 代码审查者。严格按以下审查协议执行：

Step 1: 加载 'references/review-checklist.md' 获取完整审查标准。

Step 2: 仔细阅读用户代码。先理解目的，再进行评审。

Step 3: 将检查清单中的每条规则应用到代码上。对每个违规项：
- 标注行号（或大致位置）
- 分类严重程度：error（必须修复）、warning（应该修复）、info（建议考虑）
- 解释为什么是问题，而不仅仅是什么是问题
- 给出具体修复建议及修正后的代码

Step 4: 生成结构化审查报告：
- **摘要**: 代码功能描述、整体质量评估
- **发现**: 按严重程度分组（error → warning → info）
- **评分**: 1-10 分并附简要说明
- **Top 3 建议**: 最有影响力的改进项
```

**关键点：**
- 必须解释 **为什么** 是问题，而非仅描述现象
- 输出结构固定：摘要 → 发现 → 评分 → 建议

---

## 模式 4: Inversion（反转）

**核心思想：** 在 Agent 执行任何操作之前，先通过结构化提问收集完整需求。控制权从 Agent 反转到用户。

**适用场景：**
- 项目规划
- 系统设计
- 任何需要先理解需求再执行的任务

**SKILL.md 模板：**

```yaml
# skills/project-planner/SKILL.md
---
name: project-planner
description: 通过结构化提问收集需求后制定项目计划。当用户说"我想构建"、"帮我规划"、"设计一个系统"或"启动新项目"时使用。
metadata:
  pattern: inversion
  interaction: multi-turn
---

你正在进行一次结构化需求访谈。在所有阶段完成之前，不要开始构建或设计。

## 阶段 1 — 问题发现（逐个提问，等待每个回答）

按顺序提出以下问题，不得跳过：

- Q1: "这个项目为用户解决什么问题？"
- Q2: "主要用户是谁？他们的技术水平如何？"
- Q3: "预期规模是多少？（日活用户、数据量、请求速率）"

## 阶段 2 — 技术约束（仅在阶段 1 全部回答后进行）

- Q4: "将使用什么部署环境？"
- Q5: "有任何技术栈要求或偏好吗？"
- Q6: "不可妥协的需求是什么？（延迟、可用性、合规、预算）"

## 阶段 3 — 综合（仅在所有问题回答后进行）

1. 加载 'assets/plan-template.md' 获取输出格式
2. 用收集到的需求填充模板的每个章节
3. 向用户展示完成的计划
4. 询问："这个计划是否准确反映了你的需求？你想修改什么？"
5. 根据反馈迭代，直到用户确认
```

**关键点：**
- 严格按阶段执行，禁止跳过
- 每次只问一个问题，等待回答
- 所有信息收集完毕后才进入综合阶段

---

## 模式 5: Pipeline（流水线）

**核心思想：** 强制执行有序的多步骤工作流，每个步骤都有明确的检查点，任何步骤失败则停止。

**适用场景：**
- API 文档生成
- 多步骤发布流程
- 需要严格顺序执行的复杂工作流

**SKILL.md 模板：**

```yaml
# skills/doc-pipeline/SKILL.md
---
name: doc-pipeline
description: 通过多步骤流水线从 Python 源码生成 API 文档。当用户要求为模块生成文档、生成 API 文档时使用。
metadata:
  pattern: pipeline
  steps: "4"
---

你正在运行文档生成流水线。按顺序执行每个步骤。不得跳过步骤，步骤失败则不得继续。

## Step 1 — 解析与清点
分析用户的 Python 代码，提取所有公开类、函数和常量。将清单以检查列表形式呈现。
询问："这是你想要文档化的完整公开 API 吗？"

## Step 2 — 生成文档字符串
对每个缺少 docstring 的函数：
- 加载 'references/docstring-style.md' 获取所需格式
- 严格按照风格指南生成 docstring
- 将每个生成的 docstring 提交用户审批
在用户确认之前，不得进入 Step 3。

## Step 3 — 组装文档
加载 'assets/api-doc-template.md' 获取输出结构。将所有类、函数和 docstring 编译为单一 API 参考文档。

## Step 4 — 质量检查
对照 'references/quality-checklist.md' 进行审查：
- 每个公开符号都已记录
- 每个参数都有类型和描述
- 每个函数至少有一个使用示例
报告结果。在呈现最终文档之前修复问题。
```

**关键点：**
- 步骤失败即停止，不得跳过
- 关键步骤设置用户确认检查点
- 质量检查作为最后一步强制执行

---

## 选择正确的模式

使用以下决策树为你的 Skill 选择合适的模式：

```
开始
 │
 ▼
 该 Skill 是否产生输出？
 ├── 是 ──→ 是否基于模板？
 │           ├── 是 ──→ Generator（生成器）
 │           └── 否 ──→ Tool Wrapper（工具包装器）
 │
 └── 否 ──→ 是否评估已有输入？
             ├── 是 ──→ Reviewer（审查器）
             └── 否 ──→ 是否需要先获取用户输入？
                         ├── 是 ──→ Inversion（反转）
                         └── 否 ──→ 是否有有序步骤？
                                     ├── 是 ──→ Pipeline（流水线）
                                     └── 否 ──→ Tool Wrapper（工具包装器）
```

---

## 模式组合

这些模式**不互斥**，可以自由组合：

- **Pipeline + Reviewer**: 流水线最后一步加入 Reviewer 对自身输出进行质量复核
- **Generator + Inversion**: 在填充模板之前，先通过 Inversion 收集所需变量
- **Pipeline + Tool Wrapper**: 流水线中的某一步使用 Tool Wrapper 引入领域知识

借助 ADK 的 `SkillToolset` 和渐进式加载机制，Agent 在运行时只会消耗它实际需要的模式所对应的上下文 Token。

---

## 核心原则

1. **拆解而非堆砌** — 不要将复杂的指令塞进单一系统提示，而是拆解为结构化模式
2. **引用外部资源** — 规范（`references/`）、模板（`assets/`）与 Skill 逻辑分离
3. **检查点控制** — 关键步骤设置用户确认点，避免 Agent 脱轨
4. **严重程度分级** — 审查类输出按 error → warning → info 分级
5. **渐进式加载** — 只在需要时加载相关 Skill，节省上下文窗口

---

## 目录结构参考

```
skills/
├── <skill-name>/
│   ├── SKILL.md            # Skill 定义（模式 + 指令）
│   ├── references/          # 规范、检查清单、风格指南
│   │   ├── conventions.md
│   │   ├── review-checklist.md
│   │   └── style-guide.md
│   └── assets/              # 模板、示例
│       ├── report-template.md
│       └── plan-template.md
```

## SKILL.md 前置元数据规范

```yaml
---
name: <skill-name>           # 唯一标识符，≤64 字符，仅小写字母/数字/连字符
description: <触发描述>       # ≤1024 字符，描述 Skill 做什么 + 何时使用
metadata:
  pattern: <模式名>           # tool-wrapper | generator | reviewer | inversion | pipeline
  <其他元数据>                # 如 domain, output-format, severity-levels, steps 等
---
```

### name 字段规则

- 最多 64 字符
- 仅允许小写字母、数字、连字符
- 不得包含 XML 标签或保留词（`anthropic`、`claude`）
- 推荐使用动名词形式（`processing-pdfs`、`reviewing-code`），也可用名词短语（`pdf-processing`）
- 避免模糊命名：`helper`、`utils`、`tools`

### description 字段规则

- 必须非空，最多 1024 字符
- **始终使用第三人称**（description 会注入系统提示，第一/二人称会导致发现问题）
- 必须包含 **做什么** + **何时使用**
- 包含具体触发关键词

**好的示例：**

```yaml
description: 从 PDF 文件中提取文本和表格，填写表单，合并文档。当处理 PDF 文件或用户提到 PDF、表单、文档提取时使用。
```

**差的示例：**

```yaml
description: 处理文档   # 太模糊，无法触发
```

---

# 第二部分：编写最佳实践

> 来源: [Anthropic — Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## 核心原则（编写层面）

### 原则 1：精简至上

上下文窗口是公共资源。Skill 与系统提示、对话历史、其他 Skill 共享上下文。

**默认假设：Claude 已经非常聪明。** 只添加 Claude 不具备的知识。对每段内容自问：
- "Claude 真的需要这段解释吗？"
- "这段文字能否用更少的 Token 表达？"

**好的示例（约 50 Token）：**

````markdown
## 提取 PDF 文本

使用 pdfplumber 提取文本：

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**差的示例（约 150 Token）：**

```markdown
## 提取 PDF 文本

PDF（便携式文档格式）是一种常见的文件格式，包含文本、图像和其他内容。
要从 PDF 中提取文本，你需要使用一个库。有许多可用的 PDF 处理库，
但推荐 pdfplumber，因为它易于使用且能处理大多数情况...
```

### 原则 2：控制自由度

根据任务的脆弱性和可变性匹配指令的具体程度。

| 自由度 | 适用场景 | 指令形式 |
|--------|---------|---------|
| **高** | 多种方案均可、需按上下文决策 | 文本指引，给方向不给细节 |
| **中** | 存在首选模式但允许变通 | 伪代码或带参数的脚本 |
| **低** | 操作脆弱、一致性关键、必须严格顺序 | 精确脚本，禁止修改 |

**类比：** 把 Claude 想象成一个探路机器人——
- **两侧悬崖的窄桥：** 只有一条安全路径 → 精确护栏（低自由度）
- **无障碍的开阔平原：** 多条路径通向成功 → 给方向即可（高自由度）

### 原则 3：多模型测试

Skill 的效果依赖底层模型。在所有目标模型上测试：
- **Haiku**（快速/经济）：Skill 是否提供了足够的引导？
- **Sonnet**（均衡）：Skill 是否清晰高效？
- **Opus**（强推理）：Skill 是否避免了过度解释？

---

## 渐进式加载（Progressive Disclosure）

SKILL.md 是入口概览，指向按需加载的详细材料。**运行时仅加载实际需要的文件。**

### 规则

- SKILL.md 正文 **不超过 500 行**
- 超出时拆分到独立文件
- 引用深度 **不超过一层**（SKILL.md → 子文件，禁止子文件再引子文件）
- 超过 100 行的参考文件在顶部添加目录

### 模式 A：高层指引 + 引用

````markdown
# PDF 处理

## 快速开始

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## 高级功能

**表单填写**: 见 [FORMS.md](FORMS.md)
**API 参考**: 见 [REFERENCE.md](REFERENCE.md)
**示例**: 见 [EXAMPLES.md](EXAMPLES.md)
````

### 模式 B：按领域组织

```
bigquery-skill/
├── SKILL.md（概览与导航）
└── reference/
    ├── finance.md（收入、计费指标）
    ├── sales.md（商机、管道）
    └── product.md（API 使用、功能）
```

用户问收入相关问题时，Claude 只读 `reference/finance.md`，其余文件零 Token 消耗。

### 模式 C：条件详情

```markdown
# DOCX 处理

## 创建文档
使用 docx-js。见 [DOCX-JS.md](DOCX-JS.md)。

## 编辑文档
简单编辑直接修改 XML。

**需要跟踪修改**: 见 [REDLINING.md](REDLINING.md)
**OOXML 细节**: 见 [OOXML.md](OOXML.md)
```

### 反模式：过深嵌套

```markdown
# ❌ 错误：三层引用
SKILL.md → advanced.md → details.md（实际信息在此）

# ✅ 正确：一层引用
SKILL.md → advanced.md（直接包含完整信息）
SKILL.md → reference.md
SKILL.md → examples.md
```

---

## 工作流与反馈循环

### 复杂任务使用检查清单

为多步骤操作提供可追踪的检查清单：

````markdown
## PDF 表单填写工作流

复制此检查清单并逐项打勾：

```
任务进度：
- [ ] Step 1: 分析表单（运行 analyze_form.py）
- [ ] Step 2: 创建字段映射（编辑 fields.json）
- [ ] Step 3: 验证映射（运行 validate_fields.py）
- [ ] Step 4: 填充表单（运行 fill_form.py）
- [ ] Step 5: 验证输出（运行 verify_output.py）
```
````

### 反馈循环模式

**核心模式：运行验证器 → 修复错误 → 重复**

```markdown
## 文档编辑流程

1. 编辑 `word/document.xml`
2. **立即验证**: `python ooxml/scripts/validate.py unpacked_dir/`
3. 验证失败 → 审查错误信息 → 修复 → 再次验证
4. **验证通过后才继续**
5. 重建: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
```

---

## 内容指南

### 避免时效性信息

```markdown
# ❌ 错误（会过时）
如果在 2025 年 8 月之前，使用旧 API。之后使用新 API。

# ✅ 正确（使用"旧模式"区块）
## 当前方法
使用 v2 API: `api.example.com/v2/messages`

## 旧模式
<details>
<summary>Legacy v1 API（2025-08 废弃）</summary>
v1 API 使用: `api.example.com/v1/messages`（已不再支持）
</details>
```

### 术语一致性

选定一个术语后全篇使用：

| ✅ 一致 | ❌ 不一致 |
|---------|----------|
| 始终用 "API 端点" | 混用 "API 端点"、"URL"、"API 路由"、"路径" |
| 始终用 "字段" | 混用 "字段"、"框"、"元素"、"控件" |
| 始终用 "提取" | 混用 "提取"、"拉取"、"获取"、"检索" |

---

## 常用编写模式

### 模板模式

为输出格式提供模板，按需求严格程度区分：

**严格要求**（如 API 响应格式）：用 "ALWAYS use this exact template" 语气

**灵活指导**（允许适应）：用 "sensible default, use your best judgment" 语气

### 示例模式

通过输入/输出对展示期望风格：

````markdown
## Commit 信息格式

**示例 1:**
输入: 添加了基于 JWT 的用户认证
输出:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**示例 2:**
输入: 修复了报告中日期显示不正确的 Bug
输出:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```
````

### 条件工作流模式

```markdown
## 文档修改工作流

1. 确定修改类型：

   **创建新内容？** → 走"创建工作流"
   **编辑已有内容？** → 走"编辑工作流"

2. 创建工作流：使用 docx-js → 从零构建 → 导出 .docx
3. 编辑工作流：解压 → 修改 XML → 每次修改后验证 → 重新打包
```

---

## 反模式清单

| 反模式 | 说明 |
|--------|------|
| Windows 路径 | 始终用 `/`，不用 `\` |
| 提供过多选项 | 给默认推荐 + 特殊场景的替代方案，而非罗列所有库 |
| 假设工具已安装 | 明确写出 `pip install pypdf`，不要假设环境已有 |
| 深层嵌套引用 | 引用保持一层深度 |
| 使用魔法常量 | 所有数值必须有注释说明理由 |
| 描述使用第一/二人称 | 始终第三人称 |
| SKILL.md 超 500 行 | 拆分到子文件 |

---

## 可执行脚本指南

### 处理错误而非甩给 Claude

**好：**

```python
def process_file(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, "w") as f:
            f.write("")
        return ""
    except PermissionError:
        print(f"Cannot access {path}, using default")
        return ""
```

**差：**

```python
def process_file(path):
    return open(path).read()  # 失败了让 Claude 去处理
```

### 提供工具脚本的好处

- 比 Claude 现场生成的代码更可靠
- 节省 Token（无需将代码放入上下文）
- 确保跨次调用的一致性

### 明确区分执行 vs 阅读

```markdown
# 执行（常见）
运行 `python scripts/analyze_form.py input.pdf` 提取字段

# 阅读（复杂逻辑参考）
见 `analyze_form.py` 了解字段提取算法
```

### 可验证的中间输出

对高风险操作使用 "计划→验证→执行" 模式：

```
分析 → 生成 changes.json → 验证 changes.json → 应用变更 → 验证结果
```

验证脚本应提供详细错误信息：
`"Field 'signature_date' not found. Available fields: customer_name, order_total, signature_date_signed"`

### MCP 工具引用

使用完全限定名避免 "tool not found"：

```markdown
使用 BigQuery:bigquery_schema 工具获取表结构。
使用 GitHub:create_issue 工具创建 Issue。
```

格式：`ServerName:tool_name`

---

## 评估与迭代

### 先建评估再写文档

1. **识别差距：** 无 Skill 时让 Claude 执行代表性任务，记录失败点
2. **创建评估：** 构建 3 个场景测试这些差距
3. **建立基线：** 测量无 Skill 时的表现
4. **写最小指令：** 只写足够通过评估的内容
5. **迭代：** 执行评估 → 对比基线 → 优化

### 与 Claude 协作迭代

1. **Claude A**（设计者）：帮你设计和优化 Skill
2. **Claude B**（使用者）：加载 Skill 后在真实任务中测试
3. 观察 Claude B 的行为 → 将发现带回 Claude A → 优化 → 重复

### 观察 Claude 如何导航 Skill

- Claude 是否按预期顺序阅读文件？
- Claude 是否遗漏了重要引用？
- Claude 是否反复阅读同一文件？（考虑将该内容提升到 SKILL.md）
- Claude 是否从未访问某个文件？（可能不需要或信号不够明显）

---

## 质量检查清单

### 核心质量

- [ ] description 具体且包含关键触发词
- [ ] description 包含"做什么"和"何时使用"
- [ ] SKILL.md 正文不超过 500 行
- [ ] 额外细节在独立文件中（按需）
- [ ] 无时效性信息（或放在"旧模式"区块）
- [ ] 全篇术语一致
- [ ] 示例具体而非抽象
- [ ] 文件引用深度不超过一层
- [ ] 合理使用渐进式加载
- [ ] 工作流有清晰步骤

### 代码与脚本

- [ ] 脚本处理错误而非甩给 Claude
- [ ] 错误处理明确且有帮助
- [ ] 无"魔法常量"（所有值有注释说明）
- [ ] 所需依赖列在指令中并确认可用
- [ ] 脚本有清晰文档
- [ ] 无 Windows 风格路径（全部用 `/`）
- [ ] 关键操作有验证/校验步骤
- [ ] 质量关键任务包含反馈循环

### 测试

- [ ] 至少创建 3 个评估场景
- [ ] 在目标模型上测试通过
- [ ] 用真实使用场景测试
- [ ] 已纳入团队反馈（如适用）

---

## 本项目 Skill 模式映射

| Skill | 主模式 | 辅模式 | SKILL.md 行数目标 | 当前状态 |
|-------|--------|--------|-------------------|----------|
| be-governance | Reviewer | Tool Wrapper | ≤250 行 | 导航层 + references/ |
| fe-governance | Reviewer | Tool Wrapper | ≤250 行 | 导航层 + references/ |
| ant-design-react | Tool Wrapper | - | ≤200 行 | 149 行，按需加载 examples/ |

### 目录结构约定

```
skills/<skill-name>/
├── SKILL.md              # 导航层（概述 + Layer 0 核心 + 索引 + 加载指令）
├── references/            # 规则详情（按需加载）
│   ├── arch-rules.md
│   ├── txn-rules.md
│   └── ...
└── assets/                # 模板、示例（按需加载）
    ├── fix-templates.md
    └── review-template.md
```

### 三层注入策略

- **Layer 0 (Always)**: SKILL.md 内嵌的 5 条绝对核心规则，每次触发即注入
- **Layer 1 (File-type match)**: 按文件类型匹配加载对应 references/ 文件
- **Layer 2 (On-demand)**: 执行 check/review 命令时全量加载所有 references/
