# 代码提取规则

## 目录结构识别

### 常见项目结构

#### Node.js / TypeScript

```
src/
├── api/ / routes/ / controllers/  → API层
├── services/ / domains/           → 业务层
├── models/ / entities/            → 数据层
├── utils/ / lib/                  → 工具层
├── config/ / settings/            → 配置层
├── middleware/                    → 中间件
└── types/ / interfaces/           → 类型定义
```

#### Java / Spring

```
src/main/java/
├── controller/ / api/             → API层
├── service/                       → 业务层
├── repository/ / dao/             → 数据访问层
├── entity/ / model/ / domain/     → 实体定义
├── dto/ / vo/                     → 数据传输对象
├── config/                        → 配置类
└── util/                          → 工具类
```

#### Python

```
src/ / app/
├── api/ / routes/ / views/        → API层
├── services/ / core/              → 业务层
├── models/ / entities/            → 数据层
├── schemas/ / dto/                → 数据结构
├── utils/ / lib/                  → 工具
└── config/ / settings/            → 配置
```

#### Go

```
/
├── api/ / handler/ / http/        → API层
├── service/ / usecase/            → 业务层
├── repository/ / store/           → 数据层
├── model/ / entity/               → 实体定义
├── pkg/ / internal/               → 内部包
└── config/                        → 配置
```

---

## 技术栈识别

### 依赖配置文件

| 语言 | 配置文件 | 提取内容 |
|------|---------|---------|
| JavaScript/TypeScript | package.json | dependencies, devDependencies, scripts |
| Java | pom.xml / build.gradle | groupId, artifactId, dependencies |
| Python | requirements.txt / pyproject.toml | dependencies |
| Go | go.mod | module, require |
| Rust | Cargo.toml | dependencies |
| Ruby | Gemfile | gems |
| PHP | composer.json | require |

### 框架识别

| 特征文件/目录 | 框架 |
|--------------|------|
| next.config.js | Next.js |
| nuxt.config.js | Nuxt.js |
| angular.json | Angular |
| vue.config.js | Vue CLI |
| tsconfig.json + src/main.ts | NestJS |
| application.properties + pom.xml | Spring Boot |
| manage.py | Django |
| app/main.py | FastAPI |
| main.go + gin | Gin |

---

## API 提取规则

### Express / Koa

```javascript
// 识别模式
router.get('/path', handler)
router.post('/path', handler)
app.get('/path', handler)

// 提取内容
{
  path: '/path',
  method: 'GET',
  handler: 'handlerName'
}
```

### Next.js App Router

```
// 识别模式
app/api/[...]/route.ts
  - GET(), POST(), PUT(), DELETE()

// 提取内容
{
  path: '/api/...',
  method: 'GET',
  handler: 'GET function in route.ts'
}
```

### Spring Boot

```java
// 识别模式
@RestController
@RequestMapping("/api")
class Controller {
  @GetMapping("/path")
  public Response method() {}
}

// 提取内容
{
  path: '/api/path',
  method: 'GET',
  handler: 'Controller.method'
}
```

### FastAPI

```python
# 识别模式
@app.get("/path")
async def endpoint():
    pass

# 提取内容
{
  path: '/path',
  method: 'GET',
  handler: 'endpoint'
}
```

---

## 数据模型提取规则

### Prisma

```prisma
// 识别模式
model User {
  id        String   @id
  email     String   @unique
  name      String?
  posts     Post[]
}

// 提取内容
{
  name: 'User',
  fields: [
    { name: 'id', type: 'String', required: true, primaryKey: true },
    { name: 'email', type: 'String', required: true, unique: true },
    { name: 'name', type: 'String', required: false }
  ],
  relations: [
    { type: 'hasMany', target: 'Post' }
  ]
}
```

### TypeORM

```typescript
// 识别模式
@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @OneToMany(() => Post, post => post.author)
  posts: Post[]
}

// 提取内容
{
  name: 'User',
  table: 'users',
  fields: [...],
  relations: [...]
}
```

### JPA / Hibernate

```java
// 识别模式
@Entity
@Table(name = "users")
class User {
  @Id @GeneratedValue
  private Long id;

  @Column(unique = true)
  private String email;

  @OneToMany
  private List<Post> posts;
}
```

### Django Model

```python
# 识别模式
class User(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, null=True)

# 提取内容
{
  name: 'User',
  fields: [
    { name: 'id', type: 'AutoField', required: true, primaryKey: true },
    { name: 'email', type: 'EmailField', required: true, unique: true },
    { name: 'name', type: 'CharField', required: false, maxLength: 100 }
  ]
}
```

---

## 模块依赖分析

### Import 语句分析

```typescript
// 识别模块边界
import { UserService } from './services/user.service'
import { UserRepository } from './repositories/user.repository'
```

### 依赖图生成

1. 扫描所有源文件
2. 提取 import/require 语句
3. 构建依赖图
4. 识别循环依赖
5. 标注外部依赖

---

## 代码规模统计

### 统计项

| 指标 | 计算方式 |
|------|---------|
| 文件数 | find . -type f \| wc -l |
| 代码行数 | cloc 或 wc -l |
| 目录数 | find . -type d \| wc -l |
| 最大文件 | 按行数排序 |
| 最大目录 | 按文件数排序 |

### 排除项

```
node_modules/
.git/
dist/ / build/
coverage/
.env*
*.min.js
*.d.ts
```

---

## 输出格式

### YAML 输出规范

```yaml
# 统一使用 snake_case
entity_name: value
field_list:
  - item1
  - item2
```

### Markdown 输出规范

- 使用表格展示结构化数据
- 使用代码块展示代码和配置
- 使用引用块展示重要说明
- 使用列表展示多项内容
