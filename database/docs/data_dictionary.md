# 网上书店系统 - 数据字典

## 数据库概要

| 数据库名 | 用途 | 字符集 | 排序规则 |
|----------|------|--------|----------|
| bookstore | 网上书店系统 | UTF8 | en_US.UTF-8 |

| 表名 | 中文名 | 记录数（预估） | 说明 |
|------|--------|----------------|------|
| users | 用户表 | 小 | 存储用户账号信息 |
| categories | 分类表 | 小 | 图书分类（固定5个） |
| books | 图书表 | 中 | 图书基本信息 |
| cart | 购物车表 | 中 | 用户购物车记录 |
| orders | 订单表 | 中 | 订单主表 |
| order_items | 订单项表 | 大 | 订单明细（快照价格） |

---

## 1. users（用户表）

| 字段名 | 中文名 | 类型 | 长度 | 可空 | 默认值 | 约束 | 说明 |
|--------|--------|------|------|------|--------|------|------|
| id | 用户ID | INTEGER | - | NOT NULL | - | PK | 自增主键 |
| username | 用户名 | VARCHAR | 50 | NOT NULL | - | UNIQUE | 登录用用户名 |
| password | 密码 | VARCHAR | 100 | NOT NULL | - | - | 明文存储 |
| role | 角色 | VARCHAR | 20 | - | 'user' | - | user=普通用户, admin=管理员 |
| created_at | 注册时间 | TIMESTAMP | - | - | CURRENT_TIMESTAMP | - | 自动生成 |

**索引**：`idx_users_username`（唯一索引）

---

## 2. categories（分类表）

| 字段名 | 中文名 | 类型 | 长度 | 可空 | 默认值 | 约束 | 说明 |
|--------|--------|------|------|------|--------|------|------|
| id | 分类ID | INTEGER | - | NOT NULL | - | PK | 自增主键 |
| name | 分类名称 | VARCHAR | 50 | NOT NULL | - | - | 如：文学、科技 |

**初始化数据**：文学、科技、少儿、教育、网络文学

---

## 3. books（图书表）

| 字段名 | 中文名 | 类型 | 长度 | 可空 | 默认值 | 约束 | 说明 |
|--------|--------|------|------|------|--------|------|------|
| id | 图书ID | INTEGER | - | NOT NULL | - | PK | 自增主键 |
| title | 书名 | VARCHAR | 200 | NOT NULL | - | - | 图书全名 |
| author | 作者 | VARCHAR | 100 | NOT NULL | - | - | 作者名 |
| price | 价格 | DECIMAL | 10,2 | NOT NULL | - | - | 保留两位小数 |
| stock | 库存 | INTEGER | - | NOT NULL | 0 | - | 当前库存数量 |
| category_id | 分类ID | INTEGER | - | - | - | FK→categories(id) | 所属分类 |
| description | 简介 | TEXT | - | - | - | - | 图书内容简介 |
| cover_url | 封面路径 | VARCHAR | 500 | - | - | - | 封面图片文件路径 |
| status | 状态 | SMALLINT | - | - | 1 | - | 1=上架, 0=下架 |
| created_at | 上架时间 | TIMESTAMP | - | - | CURRENT_TIMESTAMP | - | 自动生成 |

**索引**：
- `idx_books_category_id` - 分类查询
- `idx_books_status` - 上架/下架筛选
- `idx_books_title` - 书名搜索

---

## 4. cart（购物车表）

| 字段名 | 中文名 | 类型 | 长度 | 可空 | 默认值 | 约束 | 说明 |
|--------|--------|------|------|------|--------|------|------|
| id | 记录ID | INTEGER | - | NOT NULL | - | PK | 自增主键 |
| user_id | 用户ID | INTEGER | - | NOT NULL | - | FK→users(id), ON DELETE CASCADE | 所属用户 |
| book_id | 图书ID | INTEGER | - | NOT NULL | - | FK→books(id), ON DELETE CASCADE | 加入的图书 |
| quantity | 数量 | INTEGER | - | NOT NULL | 1 | - | 购买数量 |

**约束**：`(user_id, book_id)` 联合唯一，防止重复添加
**索引**：`idx_cart_user_id`, `idx_cart_book_id`, `idx_cart_user_book`（唯一）

---

## 5. orders（订单表）

| 字段名 | 中文名 | 类型 | 长度 | 可空 | 默认值 | 约束 | 说明 |
|--------|--------|------|------|------|--------|------|------|
| id | 订单ID | INTEGER | - | NOT NULL | - | PK | 自增主键 |
| user_id | 用户ID | INTEGER | - | NOT NULL | - | FK→users(id) | 下单用户 |
| order_no | 订单号 | VARCHAR | 32 | NOT NULL | - | UNIQUE | 唯一订单编号 |
| total_amount | 总金额 | DECIMAL | 10,2 | NOT NULL | - | - | 订单总价 |
| address | 收货地址 | VARCHAR | 200 | NOT NULL | - | - | 用户手动填写 |
| phone | 联系电话 | VARCHAR | 20 | NOT NULL | - | - | 用户手动填写 |
| status | 订单状态 | SMALLINT | - | - | 0 | - | 0=待支付,1=待发货,2=已完成,3=已取消 |
| created_at | 下单时间 | TIMESTAMP | - | - | CURRENT_TIMESTAMP | - | 自动生成 |

**索引**：`idx_orders_order_no`（唯一）, `idx_orders_user_id`, `idx_orders_status`, `idx_orders_created_at`

---

## 6. order_items（订单项表）

| 字段名 | 中文名 | 类型 | 长度 | 可空 | 默认值 | 约束 | 说明 |
|--------|--------|------|------|------|--------|------|------|
| id | 记录ID | INTEGER | - | NOT NULL | - | PK | 自增主键 |
| order_id | 订单ID | INTEGER | - | NOT NULL | - | FK→orders(id), ON DELETE CASCADE | 所属订单 |
| book_id | 图书ID | INTEGER | - | NOT NULL | - | FK→books(id) | 购买的图书 |
| quantity | 数量 | INTEGER | - | NOT NULL | - | - | 本次购买数量 |
| price | 单价 | DECIMAL | 10,2 | NOT NULL | - | - | 购买时的价格（快照） |

**索引**：`idx_order_items_order_id`, `idx_order_items_book_id`, `idx_order_items_order_book`

---

## 建表顺序（按依赖关系）

```
1. users      （无外键依赖）
2. categories （无外键依赖）
3. books      （依赖 categories）
4. cart       （依赖 users、books）
5. orders     （依赖 users）
6. order_items（依赖 orders、books）
```
