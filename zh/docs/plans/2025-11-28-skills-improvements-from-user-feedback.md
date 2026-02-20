# 基于用户反馈的技能改进

**日期：** 2025-11-28
**状态：** 草稿
**来源：** 两个在实际开发场景中使用 superpowers 的 Claude 实例

---

## 执行摘要

两个 Claude 实例从实际开发会话中提供了详细反馈。他们的反馈揭示了当前技能中的**系统性缺陷**，这些缺陷导致本可预防的 bug 被发布，尽管遵循了技能指导。

**关键洞察：** 这些是问题报告，而不仅仅是解决方案提案。问题是真实的；解决方案需要仔细评估。

**关键主题：**
1. **验证缺口** - 我们验证操作成功，但没有验证它们达到了预期结果
2. **进程卫生** - 后台进程累积并在子代理之间产生干扰
3. **上下文优化** - 子代理获得了太多无关信息
4. **自我反思缺失** - 没有提示在交接前审视自己的工作
5. **Mock 安全性** - Mock 可能与接口偏离而未被检测到
6. **技能激活** - 技能存在但未被阅读/使用

---

## 识别的问题

### 问题 1：配置更改验证缺口

**发生的情况：**
- 子代理测试了 "OpenAI 集成"
- 设置了 `OPENAI_API_KEY` 环境变量
- 获得了状态 200 响应
- 报告 "OpenAI 集成正常工作"
- **但是**响应包含 `"model": "claude-sonnet-4-20250514"` - 实际上使用的是 Anthropic

**根本原因：**
`verification-before-completion` 检查操作成功，但不检查结果是否反映了预期的配置更改。

**影响：** 高 - 对集成测试的虚假信心，bug 被发布到生产环境

**失败模式示例：**
- 切换 LLM 提供商 → 验证状态 200 但不检查模型名称
- 启用功能标志 → 验证无错误但不检查功能是否激活
- 更改环境 → 验证部署成功但不检查环境变量

---

### 问题 2：后台进程累积

**发生的情况：**
- 会话期间调度了多个子代理
- 每个都启动了后台服务器进程
- 进程累积（4+ 个服务器运行）
- 过时的进程仍然绑定端口
- 后来的 E2E 测试命中了配置错误的过时服务器
- 混乱/错误的测试结果

**根本原因：**
子代理是无状态的 - 不知道前一个子代理的进程。没有清理协议。

**影响：** 中高 - 测试命中错误的服务器，虚假的通过/失败，调试混乱

---

### 问题 3：子代理提示中的上下文膨胀

**发生的情况：**
- 标准方法：给子代理完整的计划文件阅读
- 实验：仅给出任务 + 模式 + 文件 + 验证命令
- 结果：更快，更专注，单次尝试完成更常见

**根本原因：**
子代理在不相关的计划部分浪费 token 和注意力。

**影响：** 中 - 执行更慢，更多失败尝试

**有效做法：**
```
You are adding a single E2E test to packnplay's test suite.

**Your task:** Add `TestE2E_FeaturePrivilegedMode` to `pkg/runner/e2e_test.go`

**What to test:** A local devcontainer feature that requests `"privileged": true`
in its metadata should result in the container running with `--privileged` flag.

**Follow the exact pattern of TestE2E_FeatureOptionValidation** (at the end of the file)

**After writing, run:** `go test -v ./pkg/runner -run TestE2E_FeaturePrivilegedMode -timeout 5m`
```

---

### 问题 4：交接前无自我反思

**发生的情况：**
- 添加了自我反思提示："用全新的眼光审视你的工作 - 有什么可以改进的？"
- 任务 5 的实现者发现失败测试是由于实现 bug，而不是测试 bug
- 追踪到第 99 行：`strings.Join(metadata.Entrypoint, " ")` 创建了无效的 Docker 语法
- 如果没有自我反思，只会报告 "测试失败" 而没有根本原因

**根本原因：**
实现者在报告完成之前不会自然地退一步审视自己的工作。

**影响：** 中 - 实现者本可以发现的 bug 被移交给审查者

---

### 问题 5：Mock-接口 偏离

**发生的情况：**
```typescript
// 接口定义 close()
interface PlatformAdapter {
  close(): Promise<void>;
}

// 代码（有 BUG）调用 cleanup()
await adapter.cleanup();

// Mock（匹配 BUG）定义 cleanup()
vi.mock('web-adapter', () => ({
  WebAdapter: vi.fn().mockImplementation(() => ({
    cleanup: vi.fn().mockResolvedValue(undefined),  // 错误！
  })),
}));
```
- 测试通过
- 运行时崩溃："adapter.cleanup is not a function"

**根本原因：**
Mock 派生自有 bug 的代码调用，而不是接口定义。TypeScript 无法捕获具有错误方法名的内联 mock。

**影响：** 高 - 测试给出虚假信心，运行时崩溃

**为什么 testing-anti-patterns 没有防止这种情况：**
该技能涵盖了测试 mock 行为和在不理解的情况下进行 mock，但没有涵盖"从接口派生 mock，而不是实现"的特定模式。

---

### 问题 6：代码审查者文件访问

**发生的情况：**
- 调度了代码审查子代理
- 找不到测试文件："The file doesn't appear to exist in the repository"
- 文件实际存在
- 审查者不知道需要先显式读取它

**根本原因：**
审查者提示不包含显式的文件读取指令。

**影响：** 低中 - 审查失败或不完整

---

### 问题 7：修复工作流延迟

**发生的情况：**
- 实现者在自我反思期间发现 bug
- 实现者知道修复方法
- 当前工作流：报告 → 我调度修复者 → 修复者修复 → 我验证
- 额外的往返增加了延迟而没有增加价值

**根本原因：**
当实现者已经诊断出问题时，实现者和修复者角色之间僵化分离。

**影响：** 低 - 延迟，但没有正确性问题

---

### 问题 8：技能未被阅读

**发生的情况：**
- `testing-anti-patterns` 技能存在
- 人类和子代理在编写测试前都没有阅读它
- 本可以防止一些问题（尽管不是全部 - 见问题 5）

**根本原因：**
没有强制子代理阅读相关技能。没有提示包含技能阅读。

**影响：** 中 - 如果不使用，技能投资被浪费

---

## 建议的改进

### 1. verification-before-completion：添加配置更改验证

**添加新部分：**

```markdown
## 验证配置更改

在测试配置、提供商、功能标志或环境的更改时：

**不要只验证操作成功。要验证输出反映了预期的更改。**

### 常见失败模式

操作成功是因为存在*某个*有效配置，但它不是你想要测试的配置。

### 示例

| 更改 | 不足 | 必需 |
|--------|-------------|----------|
| 切换 LLM 提供商 | 状态 200 | 响应包含预期的模型名称 |
| 启用功能标志 | 无错误 | 功能行为实际激活 |
| 更改环境 | 部署成功 | 日志/变量引用新环境 |
| 设置凭据 | 认证成功 | 认证用户/上下文正确 |

### 门控函数

```
在声称配置更改有效之前：

1. 识别：更改后应该有什么不同？
2. 定位：该差异在哪里可观察？
   - 响应字段（模型名称、用户 ID）
   - 日志行（环境、提供商）
   - 行为（功能激活/未激活）
3. 运行：显示可观察差异的命令
4. 验证：输出包含预期差异
5. 只有这样才能：声称配置更改有效

危险信号：
  - "请求成功" 但没有检查内容
  - 检查状态码但没有检查响应体
  - 验证无错误但没有正面确认
```

**为什么有效：**
强制验证意图，而不仅仅是操作成功。

---

### 2. subagent-driven-development：为 E2E 测试添加进程卫生

**添加新部分：**

```markdown
## E2E 测试的进程卫生

在调度启动服务（服务器、数据库、消息队列）的子代理时：

### 问题

子代理是无状态的 - 它们不知道前一个子代理启动的进程。后台进程持续存在并可能干扰后续测试。

### 解决方案

**在调度 E2E 测试子代理之前，在提示中包含清理：**

```
在启动任何服务之前：
1. 终止现有进程：pkill -f "<service-pattern>" 2>/dev/null || true
2. 等待清理：sleep 1
3. 验证端口空闲：lsof -i :<port> && echo "ERROR: Port still in use" || echo "Port free"

测试完成后：
1. 终止你启动的进程
2. 验证清理：pgrep -f "<service-pattern>" || echo "Cleanup successful"
```

### 示例

```
任务：运行 API 服务器的 E2E 测试

提示包括：
"在启动服务器之前：
- 终止任何现有服务器：pkill -f 'node.*server.js' 2>/dev/null || true
- 验证端口 3001 空闲：lsof -i :3001 && exit 1 || echo 'Port available'

测试后：
- 终止你启动的服务器
- 验证：pgrep -f 'node.*server.js' || echo 'Cleanup verified'"
```

### 为什么重要

- 过时的进程使用错误的配置响应请求
- 端口冲突导致静默失败
- 进程累积拖慢系统
- 令人困惑的测试结果（命中错误的服务器）
```

**权衡分析：**
- 增加了提示的样板代码
- 但防止了非常混乱的调试
- 对于 E2E 测试子代理值得

---

### 3. subagent-driven-development：添加精简上下文选项

**修改步骤 2：使用子代理执行任务**

**之前：**
```
从 [plan-file] 仔细阅读该任务。
```

**之后：**
```
## 上下文方法

**完整计划（默认）：**
当任务复杂或有依赖关系时使用：
```
从 [plan-file] 仔细阅读任务 N。
```

**精简上下文（用于独立任务）：**
当任务是独立的且基于模式时使用：
```
你正在实现：[1-2 句任务描述]

要修改的文件：[确切路径]
要遵循的模式：[对现有函数/测试的引用]
要实现的内容：[具体要求]
验证：[要运行的确切命令]

[不要包含完整的计划文件]
```

**在以下情况使用精简上下文：**
- 任务遵循现有模式（添加类似测试、实现类似功能）
- 任务是独立的（不需要其他任务的上下文）
- 模式引用足够（例如，"遵循 TestE2E_FeatureOptionValidation"）

**在以下情况使用完整计划：**
- 任务依赖于其他任务
- 需要理解整体架构
- 需要上下文的复杂逻辑
```

**示例：**
```
精简上下文提示：

"You are adding a test for privileged mode in devcontainer features.

File: pkg/runner/e2e_test.go
Pattern: Follow TestE2E_FeatureOptionValidation (at end of file)
Test: Feature with `"privileged": true` in metadata results in `--privileged` flag
Verify: go test -v ./pkg/runner -run TestE2E_FeaturePrivilegedMode -timeout 5m

Report: Implementation, test results, any issues."
```

**为什么有效：**
在适当时减少 token 使用，增加专注度，更快完成。

---

### 4. subagent-driven-development：添加自我反思步骤

**修改步骤 2：使用子代理执行任务**

**添加到提示模板：**

```
完成后，在报告之前：

退一步，用全新的眼光审视你的工作。

问自己：
- 这实际上是否按规范解决了任务？
- 是否有我没有考虑的边缘情况？
- 我是否正确遵循了模式？
- 如果测试失败，根本原因是什么（实现 bug vs 测试 bug）？
- 这个实现有什么可以改进的地方？

如果你在反思期间发现问题，现在就修复它们。

然后报告：
- 你实现了什么
- 自我反思发现（如果有）
- 测试结果
- 更改的文件
```

**为什么有效：**
在交接前捕获实现者自己可以发现的 bug。有记录的案例：通过自我反思发现了入口点 bug。

**权衡：**
每个任务增加约 30 秒，但在审查前捕获问题。

---

### 5. requesting-code-review：添加显式文件读取

**修改代码审查者模板：**

**在开头添加：**

```markdown
## 要审查的文件

在分析之前，读取这些文件：

1. [列出 diff 中更改的特定文件]
2. [被更改引用但未修改的文件]

使用 Read 工具加载每个文件。

如果你找不到文件：
- 检查 diff 中的确切路径
- 尝试其他位置
- 报告："Cannot locate [path] - please verify file exists"

在阅读实际代码之前不要继续审查。
```

**为什么有效：**
显式指令防止"文件未找到"问题。

---

### 6. testing-anti-patterns：添加 Mock-接口 偏离反模式

**添加新的反模式 6：**

```markdown
## 反模式 6：从实现派生的 Mock

**违规示例：**
```typescript
// 代码（有 BUG）调用 cleanup()
await adapter.cleanup();

// Mock（匹配 BUG）有 cleanup()
const mock = {
  cleanup: vi.fn().mockResolvedValue(undefined)
};

// 接口（正确）定义 close()
interface PlatformAdapter {
  close(): Promise<void>;
}
```

**为什么这是错误的：**
- Mock 将 bug 编码到测试中
- TypeScript 无法捕获具有错误方法名的内联 mock
- 测试通过是因为代码和 mock 都是错误的
- 使用真实对象时运行时崩溃

**修复方法：**
```typescript
// ✅ 好的做法：从接口派生 mock

// 步骤 1：打开接口定义 (PlatformAdapter)
// 步骤 2：列出那里定义的方法（close, initialize 等）
// 步骤 3：Mock 确切是那些方法

const mock = {
  initialize: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),  // 从接口！
};

// 现在测试失败，因为代码调用了不存在的 cleanup()
// 该失败在运行时之前揭示了 bug
```

### 门控函数

```
在编写任何 mock 之前：

  1. 停止 - 还不要看被测代码
  2. 查找：依赖项的接口/类型定义
  3. 阅读：接口文件
  4. 列出：接口中定义的方法
  5. MOCK：只 mock 那些方法，使用确切的名称
  6. 不要：看你代码调用什么

  如果你的测试因为代码调用了 mock 中没有的东西而失败：
    ✅ 好 - 测试发现了你代码中的 bug
    修复代码以调用正确的接口方法
    不要修复 mock

  危险信号：
    - "我会 mock 代码调用的内容"
    - 从实现复制方法名
    - 没有阅读接口就编写 mock
    - "测试失败了所以我把这个方法加到 mock 里"
```

**检测：**

当你看到运行时错误 "X is not a function" 且测试通过时：
1. 检查 X 是否被 mock
2. 比较 mock 方法与接口方法
3. 查找方法名不匹配
```

**为什么有效：**
直接解决反馈中的失败模式。

---

### 7. subagent-driven-development：要求测试子代理阅读技能

**在任务涉及测试时添加到提示模板：**

```markdown
在编写任何测试之前：

1. 阅读 testing-anti-patterns 技能：
   使用 Skill 工具：superpowers:testing-anti-patterns

2. 在以下情况应用该技能中的门控函数：
   - 编写 mock
   - 向生产类添加方法
   - Mock 依赖项

这不是可选的。违反反模式的测试将在审查中被拒绝。
```

**为什么有效：**
确保技能实际被使用，而不仅仅是存在。

**权衡：**
增加每个任务的时间，但防止整类 bug。

---

### 8. subagent-driven-development：允许实现者修复自我发现的问题

**修改步骤 2：**

**当前：**
```
子代理报告工作摘要。
```

**建议：**
```
子代理执行自我反思，然后：

如果自我反思发现可修复的问题：
  1. 修复问题
  2. 重新运行验证
  3. 报告："初始实现 + 自我反思修复"

否则：
  报告："实现完成"

在报告中包括：
- 自我反思发现
- 是否应用了修复
- 最终验证结果
```

**为什么有效：**
当实现者已经知道修复时减少延迟。有记录的案例：本可以为入口点 bug 节省一次往返。

**权衡：**
提示稍复杂，但端到端更快。

---

## 实现计划

### 阶段 1：高影响、低风险（优先执行）

1. **verification-before-completion：配置更改验证**
   - 清晰的添加，不改变现有内容
   - 解决高影响问题（测试中的虚假信心）
   - 文件：`skills/verification-before-completion/SKILL.md`

2. **testing-anti-patterns：Mock-接口 偏离**
   - 添加新反模式，不修改现有内容
   - 解决高影响问题（运行时崩溃）
   - 文件：`skills/testing-anti-patterns/SKILL.md`

3. **requesting-code-review：显式文件读取**
   - 简单添加到模板
   - 修复具体问题（审查者找不到文件）
   - 文件：`skills/requesting-code-review/SKILL.md`

### 阶段 2：适度更改（仔细测试）

4. **subagent-driven-development：进程卫生**
   - 添加新部分，不改变工作流
   - 解决中高影响（测试可靠性）
   - 文件：`skills/subagent-driven-development/SKILL.md`

5. **subagent-driven-development：自我反思**
   - 更改提示模板（较高风险）
   - 但有记录证明可以捕获 bug
   - 文件：`skills/subagent-driven-development/SKILL.md`

6. **subagent-driven-development：技能阅读要求**
   - 增加提示开销
   - 但确保技能实际被使用
   - 文件：`skills/subagent-driven-development/SKILL.md`

### 阶段 3：优化（先验证）

7. **subagent-driven-development：精简上下文选项**
   - 增加复杂性（两种方法）
   - 需要验证它不会造成混乱
   - 文件：`skills/subagent-driven-development/SKILL.md`

8. **subagent-driven-development：允许实现者修复**
   - 更改工作流（较高风险）
   - 优化，不是 bug 修复
   - 文件：`skills/subagent-driven-development/SKILL.md`

---

## 待解决问题

1. **精简上下文方法：**
   - 我们应该将其作为基于模式的任务的默认方法吗？
   - 我们如何决定使用哪种方法？
   - 过于精简并错过重要上下文的风险？

2. **自我反思：**
   - 这会显著减慢简单任务吗？
   - 是否应该只适用于复杂任务？
   - 如何防止"反思疲劳"使其变得例行公事？

3. **进程卫生：**
   - 这应该在 subagent-driven-development 还是单独的技能中？
   - 是否适用于 E2E 测试以外的其他工作流？
   - 如何处理进程应该持久的情况（开发服务器）？

4. **技能阅读强制：**
   - 是否应该要求所有子代理阅读相关技能？
   - 如何防止提示变得太长？
   - 过度文档化并失去焦点的风险？

---

## 成功指标

我们如何知道这些改进有效？

1. **配置验证：**
   - 零"测试通过但使用了错误配置"的情况
   - Jesse 不再说"那实际上没有测试你想象的内容"

2. **进程卫生：**
   - 零"测试命中错误服务器"的情况
   - E2E 测试运行期间没有端口冲突错误

3. **Mock-接口 偏离：**
   - 零"测试通过但运行时因缺少方法崩溃"的情况
   - Mock 和接口之间没有方法名不匹配

4. **自我反思：**
   - 可衡量：实现者报告是否包含自我反思发现？
   - 定性：更少的 bug 流向代码审查？

5. **技能阅读：**
   - 子代理报告引用技能门控函数
   - 代码审查中更少的反模式违规

---

## 风险和缓解措施

### 风险：提示膨胀
**问题：** 添加所有这些要求使提示难以承受
**缓解：**
- 分阶段实现（不要一次添加所有内容）
- 使某些添加有条件（E2E 卫生仅用于 E2E 测试）
- 考虑不同任务类型的模板

### 风险：分析瘫痪
**问题：** 太多反思/验证减慢执行
**缓解：**
- 保持门控函数快速（秒级，不是分钟级）
- 最初让精简上下文选择加入
- 监控任务完成时间

### 风险：虚假安全感
**问题：** 遵循检查清单不能保证正确性
**缓解：**
- 强调门控函数是最低要求，不是最高要求
- 在技能中保留"使用判断"的语言
- 文档说明技能捕获常见失败，不是所有失败

### 风险：技能分歧
**问题：** 不同技能给出冲突建议
**缓解：**
- 审查所有技能的更改以确保一致性
- 文档说明技能如何交互（集成部分）
- 在部署前用真实场景测试

---

## 建议

**立即执行阶段 1：**
- verification-before-completion：配置更改验证
- testing-anti-patterns：Mock-接口 偏离
- requesting-code-review：显式文件读取

**在最终确定前与 Jesse 测试阶段 2：**
- 获取关于自我反思影响的反馈
- 验证进程卫生方法
- 确认技能阅读要求值得开销

**在验证前暂缓阶段 3：**
- 精简上下文需要真实世界测试
- 实现者修复工作流更改需要仔细评估

这些更改解决用户记录的真实问题，同时最小化使技能变差的风险。
