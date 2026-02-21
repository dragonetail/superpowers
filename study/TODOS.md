# Superpowers 学习计划与进度

## 学习目标

全面掌握 superpowers 项目（定制、教学、集成、贡献）

## 学习路径

架构优先，系统学习

## 优先级

1. 文档生成 → 2. 流程规范 → 3. 调试排查 → 4. 代码审查

---

## 学习进度

### 已完成

- [x] 整体架构概览（Hooks、Skills、Agents 三大组件）
- [x] Hooks 机制详解
  - [x] 文件结构
  - [x] hooks.json 配置
  - [x] session-start.sh 工作流程
  - [x] 触发时机（startup|resume|clear|compact）
  - [x] 多插件 hooks 协作机制
  - [x] Token 开销分析
- [x] Skills 机制详解
  - [x] 文件结构
  - [x] SKILL.md 结构（YAML frontmatter + 正文）
  - [x] 核心设计理念
  - [x] description 字段的重要性
  - [x] 优先级机制
- [x] Agents 机制详解
  - [x] 与 Skills 的区别
  - [x] 工作流程
  - [x] 使用场景选择
- [x] 学习文档编写规范（writing-skills）

### 进行中

- [ ] 创建自定义 Skill（文档生成）
  - [x] 阅读 writing-skills 规范
  - [ ] 需求澄清：确定文档生成场景
  - [ ] 设计 skill 结构
  - [ ] 编写 SKILL.md
  - [ ] 测试 skill

### 待完成

- [ ] 创建自定义 Agent（如需要）
- [ ] 修改/定制 Hook（如需要）
- [ ] 实践案例：为团队构建定制工具集
- [ ] 整理完整的学习笔记

---

## 当前任务

**创建文档生成 Skill - 需求澄清**

问题：你的文档生成场景主要是哪种？

- A) API 文档 - 从代码自动生成 API 接口文档
- B) 项目 README - 为项目生成说明文档
- C) 架构文档 - 生成系统架构、模块关系等
- D) 综合文档 - 以上都需要

---

## 输出文件

| 文件 | 说明 |
|------|------|
| `study/01-架构概览与Hooks机制.md` | 架构、Hooks、Skills、Agents 学习笔记 |
| `study/FAQ-常见问题.md` | 学习过程中的常见问题解答 |
| `study/TODOS.md` | 本文件 - 学习计划与进度 |
