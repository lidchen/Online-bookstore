好的，以下是**成员D（数据库开发）** 的详细任务清单，**侧重每个文件/脚本要实现的具体功能**，采用树形目录结构。

---

# 成员D（数据库开发）——详细任务清单

## 目录结构

```
docs/
├── database.sql                  # 数据库建表SQL脚本
├── er_diagram.md                 # ER图设计文档（可选）
└── data_dictionary.md            # 数据字典文档

scripts/
├── init_db.sh                    # 初始化数据库脚本（Linux/Mac）
├── init_db.bat                   # 初始化数据库脚本（Windows）
├── seed_data.sh                  # 插入测试数据脚本
├── backup_db.sh                  # 数据库备份脚本
└── migrate.sql                   # 数据库迁移脚本（后续迭代用）
```

---

## 一、任务总览

| 类别 | 文件数量 | 预估工时 |
|------|----------|----------|
| 数据库设计 | 6张表 | 0.5天 |
| 建表SQL编写 | 1个文件 | 0.5天 |
| 初始化脚本 | 2个脚本 | 0.5天 |
| 测试数据脚本 | 1个脚本 | 0.5天 |
| 备份脚本 | 1个脚本 | 0.5天 |
| 协助后端验证 | - | 0.5天 |
| **合计** | | **约3天** |

---

## 二、数据库设计

### 2.1 表结构设计（6张表）

```
数据库: bookstore
│
├── users                        # 用户表
├── categories                   # 分类表
├── books                        # 图书表
├── cart                         # 购物车表
├── orders                       # 订单表
└── order_items                  # 订单项表
```

### 2.2 各表详细设计

#### `users` - 用户表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 用户ID（自增） |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(100) | NOT NULL | 密码（明文存储） |
| role | VARCHAR(20) | DEFAULT 'user' | 角色：user/admin |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 注册时间 |

**索引设计**：
- 主键索引：`id`
- 唯一索引：`username`

---

#### `categories` - 分类表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 分类ID（自增） |
| name | VARCHAR(50) | NOT NULL | 分类名称 |

**初始化数据**：
```sql
('文学'), ('科技'), ('少儿'), ('教育'), ('网络文学')
```

---

#### `books` - 图书表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 图书ID（自增） |
| title | VARCHAR(200) | NOT NULL | 书名 |
| author | VARCHAR(100) | NOT NULL | 作者 |
| price | DECIMAL(10,2) | NOT NULL | 价格 |
| stock | INT | NOT NULL, DEFAULT 0 | 库存数量 |
| category_id | INT | FOREIGN KEY → categories(id) | 分类ID |
| description | TEXT | - | 图书简介 |
| cover_url | VARCHAR(500) | - | 封面图片路径 |
| status | SMALLINT | DEFAULT 1 | 状态：1上架/0下架 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 上架时间 |

**索引设计**：
- 主键索引：`id`
- 外键索引：`category_id`
- 普通索引：`title`（用于搜索优化）、`status`（用于筛选上架图书）

---

#### `cart` - 购物车表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 记录ID（自增） |
| user_id | INT | FOREIGN KEY → users(id), ON DELETE CASCADE | 用户ID |
| book_id | INT | FOREIGN KEY → books(id), ON DELETE CASCADE | 图书ID |
| quantity | INT | NOT NULL, DEFAULT 1 | 数量 |

**索引设计**：
- 主键索引：`id`
- 联合唯一索引：`(user_id, book_id)`（防止重复添加）
- 外键索引：`user_id`、`book_id`

---

#### `orders` - 订单表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 订单ID（自增） |
| user_id | INT | FOREIGN KEY → users(id) | 用户ID |
| order_no | VARCHAR(32) | UNIQUE, NOT NULL | 订单号 |
| total_amount | DECIMAL(10,2) | NOT NULL | 订单总金额 |
| address | VARCHAR(200) | NOT NULL | 收货地址 |
| phone | VARCHAR(20) | NOT NULL | 联系电话 |
| status | SMALLINT | DEFAULT 0 | 状态：0待支付/1待发货/2已完成/3已取消 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 下单时间 |

**订单状态说明**：

| 状态码 | 含义 | 可执行操作 |
|--------|------|------------|
| 0 | 待支付 | 支付、取消 |
| 1 | 待发货 | 管理员发货、用户确认收货 |
| 2 | 已完成 | 无 |
| 3 | 已取消 | 无 |

**索引设计**：
- 主键索引：`id`
- 唯一索引：`order_no`
- 外键索引：`user_id`
- 普通索引：`status`、`created_at`

---

#### `order_items` - 订单项表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 记录ID（自增） |
| order_id | INT | FOREIGN KEY → orders(id), ON DELETE CASCADE | 订单ID |
| book_id | INT | FOREIGN KEY → books(id) | 图书ID |
| quantity | INT | NOT NULL | 购买数量 |
| price | DECIMAL(10,2) | NOT NULL | 购买时单价（快照） |

**索引设计**：
- 主键索引：`id`
- 外键索引：`order_id`、`book_id`
- 联合索引：`(order_id, book_id)`

---

### 2.3 ER图设计

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │   cart      │     │   books     │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │──┐  │ id (PK)     │     │ id (PK)     │
│ username    │  │  │ user_id (FK)│──┐  │ title       │
│ password    │  │  │ book_id (FK)│──┼─→│ author      │
│ role        │  │  │ quantity    │  │  │ price       │
│ created_at  │  │  └─────────────┘  │  │ stock       │
└─────────────┘  │                   │  │ category_id │
                 │                   │  │ description │
                 │  ┌─────────────┐  │  │ cover_url   │
                 │  │   orders    │  │  │ status      │
                 │  ├─────────────┤  │  │ created_at  │
                 └─→│ id (PK)     │  │  └─────────────┘
                    │ user_id (FK)│──┘
                    │ order_no    │
                    │ total_amount│     ┌─────────────┐
                    │ address     │     │ order_items │
                    │ phone       │     ├─────────────┤
                    │ status      │──┐  │ id (PK)     │
                    │ created_at  │  │  │ order_id(FK)│←─┐
                    └─────────────┘  │  │ book_id(FK) │──┼─→ books
                                     └─→│ quantity    │  │
                                        │ price       │  │
                                        └─────────────┘  │
                                                         │
                                    ┌─────────────┐      │
                                    │ categories  │      │
                                    ├─────────────┤      │
                                    │ id (PK)     │←─────┘
                                    │ name        │
                                    └─────────────┘
```

---

## 三、SQL脚本编写

### 3.1 `docs/database.sql` - 建表SQL

| 功能 | 说明 |
|------|------|
| 创建数据库 | `CREATE DATABASE bookstore;` |
| 创建6张表 | 按依赖顺序创建（先创建无外键的表） |
| 添加注释 | 为表和字段添加中文注释 |
| 创建索引 | 为常用查询字段创建索引 |
| 初始化分类数据 | 插入5个固定分类 |
| 初始化管理员账号 | 插入admin用户（密码: admin123） |

**建表顺序**（依赖关系）：
```
1. users      （无外键依赖）
2. categories （无外键依赖）
3. books      （依赖 categories）
4. cart       （依赖 users、books）
5. orders     （依赖 users）
6. order_items（依赖 orders、books）
```

### 3.2 `scripts/init_db.sh` - Linux/Mac初始化脚本

| 功能 | 说明 |
|------|------|
| 检查PostgreSQL是否运行 | `pg_isready` 命令 |
| 创建数据库 | `createdb bookstore` |
| 执行建表SQL | `psql -d bookstore -f ../docs/database.sql` |
| 验证表创建成功 | 列出所有表 |
| 输出结果 | 显示"初始化完成" |

### 3.3 `scripts/init_db.bat` - Windows初始化脚本

| 功能 | 说明 |
|------|------|
| 检查PostgreSQL环境 | 验证PATH中是否有psql |
| 创建数据库 | `createdb bookstore` |
| 执行建表SQL | `psql -d bookstore -f ..\docs\database.sql` |
| 验证表创建成功 | 查询表列表 |
| 输出结果 | 显示"初始化完成" |

### 3.4 `scripts/seed_data.sh` - 测试数据脚本

| 数据 | 数量 | 说明 |
|------|------|------|
| 普通用户 | 3个 | user1/user1，user2/user2，user3/user3 |
| 管理员 | 已创建 | admin/admin123 |
| 图书 | 10本 | 覆盖5个分类，不同价格和库存 |
| 购物车 | 若干 | 为测试用户添加购物车数据 |
| 订单 | 若干 | 不同状态的订单（待支付、待发货、已完成、已取消） |

**测试图书示例**：

| 书名 | 作者 | 价格 | 库存 | 分类 |
|------|------|------|------|------|
| 三体 | 刘慈欣 | 68.00 | 100 | 文学 |
| 解忧杂货店 | 东野圭吾 | 49.90 | 50 | 文学 |
| Go语言编程 | 李文塔 | 89.00 | 30 | 科技 |
| 深入理解计算机系统 | 布莱恩特 | 139.00 | 20 | 科技 |
| 小王子 | 圣埃克苏佩里 | 35.00 | 80 | 少儿 |
| 新华字典 | 商务印书馆 | 25.00 | 200 | 教育 |
| 全职高手 | 蝴蝶蓝 | 120.00 | 40 | 网络文学 |

### 3.5 `scripts/backup_db.sh` - 数据库备份脚本

| 功能 | 说明 |
|------|------|
| 创建备份目录 | `mkdir -p ./backups` |
| 生成备份文件名 | 格式：`bookstore_YYYYMMDD_HHMMSS.sql` |
| 执行备份 | `pg_dump bookstore > backup.sql` |
| 压缩备份文件 | `gzip backup.sql` |
| 删除旧备份 | 保留最近7天的备份 |
| 输出结果 | 显示备份完成信息 |

### 3.6 `scripts/migrate.sql` - 数据库迁移脚本（可选）

| 功能 | 说明 |
|------|------|
| 版本管理 | 记录每次数据库变更 |
| 新增字段 | 例如：为books表添加publisher字段 |
| 修改字段 | 例如：扩大password字段长度 |
| 新增索引 | 例如：为搜索功能添加联合索引 |

---

## 四、辅助文档

### 4.1 `docs/er_diagram.md` - ER图文档

| 内容 | 说明 |
|------|------|
| 实体说明 | 每个表的含义和用途 |
| 关系说明 | 表之间的关联关系（1:N，N:N） |
| 字段说明 | 每个字段的业务含义 |
| 状态说明 | 订单状态、图书状态的取值含义 |

### 4.2 `docs/data_dictionary.md` - 数据字典

| 内容 | 说明 |
|------|------|
| 表名 | 每张表的英文名和中文名 |
| 字段名 | 每个字段的英文名和中文名 |
| 数据类型 | 字段的数据类型及长度 |
| 是否可空 | NULL/NOT NULL |
| 默认值 | 字段的默认值 |
| 约束 | PRIMARY KEY、FOREIGN KEY、UNIQUE |
| 说明 | 字段的业务含义 |

---

## 五、协助后端开发

### 5.1 需要协助后端（成员C）的内容

| 任务 | 说明 |
|------|------|
| 验证GORM模型 | 确保后端模型的字段类型、标签与数据库一致 |
| 测试SQL语句 | 协助验证复杂查询（如分页、搜索）的SQL正确性 |
| 事务验证 | 验证下单事务中的库存扣减、数据一致性 |
| 性能优化 | 添加必要的索引，分析慢查询 |
| 数据验证 | 确保插入/更新的数据符合业务规则 |

### 5.2 与后端的协作接口

| 协作点 | 输出给后端 | 从后端接收 |
|--------|------------|------------|
| 表结构 | 最终确认的SQL | 模型定义 |
| 索引设计 | 索引创建SQL | 查询模式分析 |
| 测试数据 | seed_data.sql | 功能测试反馈 |
| 迁移脚本 | migrate.sql | 版本变更需求 |

---

## 六、开发顺序（成员D）

| 顺序 | 任务 | 预估时间 | 产出 |
|------|------|----------|------|
| 1 | 设计6张表结构 | 2小时 | ER图、字段定义 |
| 2 | 编写 `database.sql` | 2小时 | 完整的建表SQL |
| 3 | 编写 `init_db.sh` / `init_db.bat` | 1小时 | 初始化脚本 |
| 4 | 本地执行验证 | 1小时 | 验证表创建成功 |
| 5 | 编写 `seed_data.sh` | 2小时 | 测试数据 |
| 6 | 编写 `backup_db.sh` | 1小时 | 备份脚本 |
| 7 | 编写 `data_dictionary.md` | 1小时 | 数据字典 |
| 8 | 协助后端验证模型 | 2小时 | 模型与表结构匹配 |
| 9 | 协助验证事务SQL | 1小时 | 下单、取消订单SQL正确 |

**总计：约13小时（1.5-2天）**

---

## 七、验收标准（成员D）

| 检查项 | 标准 |
|--------|------|
| 表结构完整性 | 6张表全部创建，字段类型正确 |
| 约束正确性 | 主键、外键、唯一约束、默认值都正确 |
| 索引合理性 | 常用查询字段都有索引 |
| 初始化脚本 | 一键执行能创建完整的数据库 |
| 测试数据 | 至少10本图书、3个用户、若干订单 |
| 数据字典 | 每张表、每个字段都有说明 |
| 与后端协作 | 模型与表结构100%匹配 |
| 事务验证 | 下单、取消订单的数据一致性正确 |

---

## 八、每个文件的输出总结

| 文件 | 输出内容 |
|------|----------|
| `docs/database.sql` | 完整的建表SQL（6张表 + 索引 + 初始数据） |
| `docs/er_diagram.md` | ER图 + 关系说明 |
| `docs/data_dictionary.md` | 数据字典（字段说明） |
| `scripts/init_db.sh` | Linux/Mac一键初始化脚本 |
| `scripts/init_db.bat` | Windows一键初始化脚本 |
| `scripts/seed_data.sh` | 测试数据插入脚本 |
| `scripts/backup_db.sh` | 数据库备份脚本 |
| `scripts/migrate.sql` | 数据库迁移脚本（模板） |

---

## 九、常用SQL命令（供成员D使用）

### 9.1 连接数据库

```bash
psql -U postgres -d bookstore
```

### 9.2 查看所有表

```sql
\dt
```

### 9.3 查看表结构

```sql
\d users
\d books
\d orders
```

### 9.4 查看索引

```sql
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'books';
```

### 9.5 导出数据

```bash
pg_dump bookstore > backup.sql
```

### 9.6 导入数据

```bash
psql -d bookstore < backup.sql
```

---

这份清单**侧重每个文件/脚本要实现的具体功能**，成员D可以按照这个清单逐项完成数据库相关任务。需要我进一步展开**某个具体SQL文件的完整内容**吗？