# 项目上下文

> 此文档由 ai-sldc-sync 生成，用于 AI 快速建立项目心智模型
> 存放路径: .memory/project-context.md

---

## 快速参考

| 属性 | 值 |
|------|-----|
| 项目名称 | [项目名] |
| 框架 | [框架名 + 版本] |
| 语言 | [语言 + 版本] |
| 数据库 | [数据库类型] |
| ORM | [ORM 名称] |
| 包管理 | [npm/yarn/pnpm/maven/pip] |

---

## 关键路径

### 入口文件

| 文件 | 说明 |
|------|------|
| [入口文件] | 应用主入口 |
| [配置文件] | 环境配置 |

### 核心目录

```
src/
├── api/         → 接口层，处理 HTTP 请求
├── services/    → 业务层，核心逻辑
├── models/      → 数据层，实体定义
├── utils/       → 工具函数
└── config/      → 配置管理
```

---

## 开发命令

```bash
# 安装依赖
[install command]

# 开发模式
[dev command]

# 构建
[build command]

# 测试
[test command]

# 代码检查
[lint command]
```

---

## API 概览

| 模块 | 路径前缀 | 主要接口 |
|------|---------|---------|
| [模块1] | /api/xxx | GET /, POST /, GET /:id |
| [模块2] | /api/yyy | GET /, POST / |

详细定义见: `docs/reverse/api-inventory.yaml`

---

## 数据实体

| 实体 | 表名 | 主要字段 |
|------|------|---------|
| [Entity1] | [table1] | id, name, createdAt |
| [Entity2] | [table2] | id, title, status |

详细定义见: `docs/reverse/data-model.yaml`

---

## 开发约定

### 代码风格

- 格式化: [Prettier/ESLint]
- 命名: [camelCase/PascalCase/kebab-case]

### 分支策略

- main: 生产分支
- develop: 开发分支
- feature/*: 功能分支

### 提交规范

- feat: 新功能
- fix: 修复
- docs: 文档
- refactor: 重构

---

## 常见任务

### 新增 API

1. 在 `src/api/` 下创建路由
2. 在 `src/services/` 下实现逻辑
3. 更新 `api-inventory.yaml`

### 新增实体

1. 在 `src/models/` 下定义模型
2. 创建数据库迁移
3. 更新 `data-model.yaml`

### 调试

```bash
# 查看日志
[log command]

# 进入数据库
[db command]
```

---

## 相关文档

- 架构概览: `docs/reverse/architecture-overview.md`
- API 清单: `docs/reverse/api-inventory.yaml`
- 数据模型: `docs/reverse/data-model.yaml`

---

## 变更历史

| 日期 | 变更内容 |
|------|---------|
| YYYY-MM-DD | 初始生成 |
