# 网上书店系统 - ER 图设计

## 实体关系总览

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   users     │         │   cart      │         │    books     │
├─────────────┤         ├─────────────┤         ├──────────────┤
│ id (PK)     │──┐      │ id (PK)     │         │ id (PK)      │
│ username    │  │      │ user_id (FK)│──┐      │ title        │
│ password    │  │      │ book_id (FK)│──┼─────→│ author       │
│ role        │  │      │ quantity    │  │      │ price        │
│ created_at  │  │      └─────────────┘  │      │ stock        │
└─────────────┘  │                       │      │ category_id  │
                 │                       │      │ description  │
                 │  ┌─────────────┐      │      │ cover_url    │
                 │  │   orders    │      │      │ status       │
                 │  ├─────────────┤      │      │ created_at   │
                 └─→│ id (PK)     │      │      └──────────────┘
                    │ user_id (FK)│──────┘             │
                    │ order_no    │                    │
                    │ total_amount│                    │
                    │ address     │      ┌─────────────┴──────┐
                    │ phone       │      │    categories      │
                    │ status      │      ├────────────────────┤
                    │ created_at  │      │ id (PK)            │
                    └─────────────┘      │ name               │
                         │              └────────────────────┘
                         │
                    ┌────┴──────────┐
                    │  order_items  │
                    ├───────────────┤
                    │ id (PK)       │
                    │ order_id (FK) │────→ orders
                    │ book_id (FK)  │────→ books
                    │ quantity      │
                    │ price         │
                    └───────────────┘
```

## 关系说明

| 关系         | 左表   | 右表        | 关系类型 | 说明                           |
| ------------ | ------ | ----------- | -------- | ------------------------------ |
| 用户→购物车 | users  | cart        | 1:N      | 一个用户可以有多个购物车记录   |
| 用户→订单   | users  | orders      | 1:N      | 一个用户可以有多个订单         |
| 图书→购物车 | books  | cart        | 1:N      | 一本图书可以出现在多个购物车中 |
| 图书→订单项 | books  | order_items | 1:N      | 一本图书可以被多次购买         |
| 图书→分类   | books  | categories  | N:1      | 多本图书属于同一分类           |
| 订单→订单项 | orders | order_items | 1:N      | 一个订单包含多个订单项         |

### 关系详细描述

**users ↔ cart（1:N）**

- 一个用户可以有零个或多个购物车记录
- 购物车记录必须属于一个用户
- 通过 `cart.user_id → users.id` 建立关联

**users ↔ orders（1:N）**

- 一个用户可以有零个或多个订单
- 订单必须属于一个用户
- 通过 `orders.user_id → users.id` 建立关联

**books ↔ cart（1:N）**

- 一本图书可以出现在零个或多个购物车中
- 购物车记录必须指向一本图书
- 通过 `cart.book_id → books.id` 建立关联

**books ↔ order_items（1:N）**

- 一本图书可以出现在零个或多个订单项中
- 订单项记录必须指向一本图书（快照单价）
- 通过 `order_items.book_id → books.id` 建立关联

**books → categories（N:1）**

- 多本图书可以属于同一个分类
- 图书的分类可以为空
- 通过 `books.category_id → categories.id` 建立关联

**orders ↔ order_items（1:N）**

- 一个订单包含一个或多个订单项
- 订单项必须属于一个订单（级联删除）
- 通过 `order_items.order_id → orders.id` 建立关联

## 约束说明

| 约束类型         | 表          | 字段               | 说明                          |
| ---------------- | ----------- | ------------------ | ----------------------------- |
| 主键             | 所有表      | id                 | 自增主键                      |
| 唯一             | users       | username           | 用户名唯一                    |
| 唯一             | orders      | order_no           | 订单号唯一                    |
| 唯一             | cart        | (user_id, book_id) | 同一用户不能重复添加同一图书  |
| 外键             | books       | category_id        | 引用 categories.id            |
| 外键（级联删除） | cart        | user_id, book_id   | 用户/图书删除时自动清空购物车 |
| 外键             | orders      | user_id            | 引用 users.id                 |
| 外键（级联删除） | order_items | order_id           | 订单删除时自动删除订单项      |
| 外键             | order_items | book_id            | 引用 books.id                 |

## 字段约束说明

| 表名        | 必填字段                                        | 说明                                             |
| ----------- | ----------------------------------------------- | ------------------------------------------------ |
| users       | username, password                              | role 默认 user，created_at 自动生成              |
| categories  | name                                            | -                                                |
| books       | title, author, price                            | stock 默认 0，status 默认 1，created_at 自动生成 |
| cart        | user_id, book_id                                | quantity 默认 1                                  |
| orders      | user_id, order_no, total_amount, address, phone | status 默认 0，created_at 自动生成               |
| order_items | order_id, book_id, quantity, price              | -                                                |

## 状态枚举

### 图书状态（books.status）

| 值 | 含义 | 说明         |
| -- | ---- | ------------ |
| 1  | 上架 | 在前端可见   |
| 0  | 下架 | 在前端不可见 |

### 订单状态（orders.status）

| 值 | 含义   | 可执行操作               |
| -- | ------ | ------------------------ |
| 0  | 待支付 | 模拟支付、取消订单       |
| 1  | 待发货 | 管理员发货、用户确认收货 |
| 2  | 已完成 | 无                       |
| 3  | 已取消 | 无                       |

### 用户角色（users.role）

| 值    | 含义     | 说明               |
| ----- | -------- | ------------------ |
| user  | 普通用户 | 可浏览、加购、下单 |
| admin | 管理员   | 可管理图书和订单   |
