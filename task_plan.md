# Task Plan: Superpowers 项目中文翻译

## Goal
将 superpowers 项目的核心内容翻译成中文，输出到 `../zh/` 目录。

## Status
- **Phase 1**: in_progress - 创建目录结构和规划
- **Phase 2**: pending - 翻译 README.md 和 RELEASE-NOTES.md
- **Phase 3**: pending - 翻译 agents/ 目录
- **Phase 4**: pending - 翻译 commands/ 目录
- **Phase 5**: pending - 翻译 docs/ 目录
- **Phase 6**: pending - 翻译 hooks/ 目录
- **Phase 7**: pending - 翻译 libs/ 目录
- **Phase 8**: pending - 翻译 skills/ 目录（13个技能）
- **Phase 9**: pending - 翻译 tests/ 目录

## Scope

### 需要翻译的内容
| 目录/文件 | 内容类型 | 文件数量 |
|-----------|----------|----------|
| README.md | 主文档 | 1 |
| RELEASE-NOTES.md | 发布说明 | 1 |
| agents/ | 代理定义 | 1 |
| commands/ | 命令定义 | 3 |
| docs/ | 文档 | ~7 |
| hooks/ | 钩子脚本注释 | 3 |
| libs/ | 库代码注释 | 1 |
| skills/ | 技能文档 | 13 |
| tests/ | 测试说明 | 多个 |

### 输出目录结构
```
../zh/
├── README.md
├── RELEASE-NOTES.md
├── agents/
│   └── code-reviewer.md
├── commands/
│   ├── brainstorm.md
│   ├── execute-plan.md
│   └── write-plan.md
├── docs/
│   └── ... (保持原结构)
├── hooks/
│   └── ... (相关文档)
├── libs/
│   └── ... (注释翻译)
├── skills/
│   └── ... (13个技能目录)
└── tests/
    └── ... (测试说明)
```

## Decisions
1. 保持原有目录结构
2. Markdown 文件翻译正文内容
3. 代码文件翻译注释，保留代码不变
4. 配置文件(如 hooks.json)不翻译

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| - | - | - |

## Notes
- 翻译时保持 Markdown 格式
- 保留代码块中的代码不翻译
- 保留链接和引用不变
