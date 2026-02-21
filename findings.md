# Findings: Superpowers 项目翻译发现

## 项目结构发现

### 根目录
- README.md: 6305 字节 - 项目主文档
- RELEASE-NOTES.md: 36353 字节 - 版本发布说明（较大）

### agents/ (1个文件)
- code-reviewer.md - 代码审查代理

### commands/ (3个文件)
- brainstorm.md - 头脑风暴命令
- execute-plan.md - 执行计划命令
- write-plan.md - 写计划命令

### docs/ (~7个文件)
- plans/ 目录: 3个计划文档
- windows/ 目录: 1个文档
- README.codex.md, README.opencode.md, testing.md

### hooks/ (3个文件)
- hooks.json - 配置文件（不翻译）
- run-hook.cmd - Windows 脚本
- session-start.sh - Shell 脚本

### libs/ (1个文件)
- skills-core.js - 技能核心库（翻译注释）

### skills/ (13个技能目录)
1. brainstorming
2. dispatching-parallel-agents
3. executing-plans
4. finishing-a-development-branch
5. receiving-code-review
6. requesting-code-review
7. subagent-driven-development
8. systematic-debugging
9. test-driven-development
10. using-git-worktrees
11. using-superpowers
12. verification-before-completion
13. writing-plans
14. writing-skills (含示例和测试)

### tests/ (5个测试套件)
- claude-code/
- explicit-skill-requests/
- opencode/
- skill-triggering/
- subagent-driven-dev/

## 翻译策略

### 文档类型处理
| 类型 | 策略 |
|------|------|
| Markdown 文档 | 完整翻译正文 |
| 代码文件 | 翻译注释，保留代码 |
| JSON 配置 | 不翻译 |
| Shell 脚本 | 翻译注释 |

### 特殊处理
- 代码块内的代码不翻译
- URL 和链接保持原样
- 专有名词保留英文（如 Claude Code, MCP）
