## 文件3：`docs/api.md`

**保存路径**：`bookstore-api-design/docs/api.md`

```markdown
# 网上书店系统——API接口文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | 1.0 |
| 最后更新 | 2026-06-23 |
| 基础URL | `http://localhost:8080/api` |
| 认证方式 | Session（Cookie） |

---

## 一、统一说明

### 1.1 响应格式

**成功响应**
```json
{
    "code": 200,
    "message": "success",
    "data": {}
}
```

**失败响应**
```json
{
    "code": 400,
    "message": "错误信息"
}
```

**未登录响应**
```json
{
    "code": 401,
    "message": "请先登录"
}
```

**无权限响应**
```json
{
    "code": 403,
    "message": "无权限访问"
}
```

### 1.2 错误码说明

| 错误码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 |
| 403 | 无权限（非管理员访问后台接口） |
| 500 | 服务器内部错误 |

### 1.3 Session说明

- 登录成功后，后端通过`Set-Cookie`下发Session ID
- 前端所有需要登录的请求，必须设置`credentials: 'include'`以自动携带Cookie
- 退出登录时，后端清除Session

### 1.4 分页说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码，从1开始 |
| page_size | int | 12 | 每页数量 |

---

## 二、用户模块（3个接口）

---

### 2.1 用户注册

| 属性 | 内容 |
|------|------|
| URL | `/api/register` |
| 方法 | POST |
| 需登录 | 否 |

**请求参数（JSON）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| confirm_password | string | 是 | 确认密码，需与password一致 |

**请求示例**
```json
{
    "username": "testuser",
    "password": "123456",
    "confirm_password": "123456"
}
```

**成功响应**
```json
{
    "code": 200,
    "message": "注册成功",
    "data": {
        "id": 1,
        "username": "testuser",
        "role": "user",
        "created_at": "2026-06-23T10:00:00Z"
    }
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "用户名已存在"
}
```
```json
{
    "code": 400,
    "message": "两次输入的密码不一致"
}
```

---

### 2.2 用户登录

| 属性 | 内容 |
|------|------|
| URL | `/api/login` |
| 方法 | POST |
| 需登录 | 否 |

**请求参数（JSON）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**
```json
{
    "username": "testuser",
    "password": "123456"
}
```

**成功响应**
```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "id": 1,
        "username": "testuser",
        "role": "user"
    }
}
```

**失败响应示例**
```json
{
    "code": 401,
    "message": "用户名或密码错误"
}
```

**说明**
- 登录成功后，后端在Session中存储`user_id`、`username`、`role`
- 响应头包含`Set-Cookie`，前端需保存此Cookie用于后续请求

---

### 2.3 退出登录

| 属性 | 内容 |
|------|------|
| URL | `/api/logout` |
| 方法 | POST |
| 需登录 | 是 |

**请求参数**
无

**成功响应**
```json
{
    "code": 200,
    "message": "已退出登录"
}
```

**说明**
- 后端清除当前用户的Session
- 前端应同时清除localStorage中的用户信息

---

## 三、图书模块（2个接口）

---

### 3.1 图书列表

| 属性 | 内容 |
|------|------|
| URL | `/api/books` |
| 方法 | GET |
| 需登录 | 否 |

**查询参数**

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 12 | 每页数量 |
| keyword | string | 否 | - | 按书名搜索 |
| category_id | int | 否 | 0 | 分类ID筛选，0表示全部 |

**请求示例**
```
GET /api/books?page=1&page_size=12&keyword=三体&category_id=1
```

**成功响应**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 100,
        "page": 1,
        "page_size": 12,
        "list": [
            {
                "id": 1,
                "title": "三体",
                "author": "刘慈欣",
                "price": 68.00,
                "stock": 100,
                "category_id": 1,
                "description": "《三体》是刘慈欣创作的系列长篇科幻小说...",
                "cover_url": "/static/uploads/santi.jpg",
                "status": 1,
                "created_at": "2026-06-23T10:00:00Z"
            }
        ]
    }
}
```

**说明**
- 仅返回`status=1`（上架）的图书
- 按`created_at`倒序排列
- `keyword`搜索为模糊匹配书名

---

### 3.2 图书详情

| 属性 | 内容 |
|------|------|
| URL | `/api/books/:id` |
| 方法 | GET |
| 需登录 | 否 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 图书ID |

**请求示例**
```
GET /api/books/1
```

**成功响应**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "title": "三体",
        "author": "刘慈欣",
        "price": 68.00,
        "stock": 100,
        "category_id": 1,
        "description": "《三体》是刘慈欣创作的系列长篇科幻小说...",
        "cover_url": "/static/uploads/santi.jpg",
        "status": 1,
        "created_at": "2026-06-23T10:00:00Z"
    }
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "图书不存在"
}
```

---

## 四、购物车模块（5个接口）

---

### 4.1 查看购物车

| 属性 | 内容 |
|------|------|
| URL | `/api/cart` |
| 方法 | GET |
| 需登录 | 是 |

**请求参数**
无

**成功响应**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "items": [
            {
                "id": 1,
                "user_id": 1,
                "book_id": 1,
                "quantity": 2,
                "book": {
                    "id": 1,
                    "title": "三体",
                    "author": "刘慈欣",
                    "price": 68.00,
                    "cover_url": "/static/uploads/santi.jpg",
                    "stock": 100
                }
            }
        ],
        "total_amount": 136.00
    }
}
```

**说明**
- `items`为购物车商品列表
- `total_amount`为所有商品小计之和
- `book`为关联的图书信息

---

### 4.2 加入购物车

| 属性 | 内容 |
|------|------|
| URL | `/api/cart` |
| 方法 | POST |
| 需登录 | 是 |

**请求参数（JSON）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| book_id | int | 是 | 图书ID |
| quantity | int | 否 | 数量，默认1 |

**请求示例**
```json
{
    "book_id": 1,
    "quantity": 1
}
```

**成功响应**
```json
{
    "code": 200,
    "message": "已加入购物车"
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "库存不足"
}
```

**说明**
- 若购物车中已存在该图书，则数量累加（`quantity = 原quantity + 新quantity`）
- 累加后的数量不能超过库存

---

### 4.3 修改购物车数量

| 属性 | 内容 |
|------|------|
| URL | `/api/cart/:book_id` |
| 方法 | PUT |
| 需登录 | 是 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| book_id | int | 是 | 图书ID |

**请求参数（JSON）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| quantity | int | 是 | 新数量，必须大于0，不能超过库存 |

**请求示例**
```
PUT /api/cart/1
```
```json
{
    "quantity": 3
}
```

**成功响应**
```json
{
    "code": 200,
    "message": "购物车已更新"
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "数量不能超过库存"
}
```

---

### 4.4 删除购物车商品

| 属性 | 内容 |
|------|------|
| URL | `/api/cart/:book_id` |
| 方法 | DELETE |
| 需登录 | 是 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| book_id | int | 是 | 要删除的图书ID |

**请求示例**
```
DELETE /api/cart/1
```

**成功响应**
```json
{
    "code": 200,
    "message": "商品已移除"
}
```

---

### 4.5 清空购物车

| 属性 | 内容 |
|------|------|
| URL | `/api/cart` |
| 方法 | DELETE |
| 需登录 | 是 |

**请求参数**
无

**成功响应**
```json
{
    "code": 200,
    "message": "购物车已清空"
}
```

**说明**
- 清空当前用户的所有购物车记录

---

## 五、订单模块（5个接口）

---

### 5.1 提交订单

| 属性 | 内容 |
|------|------|
| URL | `/api/orders` |
| 方法 | POST |
| 需登录 | 是 |

**请求参数（JSON）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| address | string | 是 | 收货地址 |
| phone | string | 是 | 联系电话 |

**请求示例**
```json
{
    "address": "北京市朝阳区xxx路123号",
    "phone": "13800138000"
}
```

**成功响应**
```json
{
    "code": 200,
    "message": "订单创建成功",
    "data": {
        "id": 1001,
        "order_no": "20260623123456",
        "total_amount": 136.00,
        "status": 0,
        "status_text": "待支付",
        "created_at": "2026-06-23T12:00:00Z"
    }
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "购物车为空"
}
```
```json
{
    "code": 400,
    "message": "库存不足"
}
```

**说明（事务操作）**
1. 校验购物车是否为空
2. 遍历购物车商品，校验库存
3. 扣减库存（`UPDATE books SET stock = stock - quantity`）
4. 生成订单号（`yyyyMMddHHmmss` + 6位随机数）
5. 插入`orders`表（`status=0`）
6. 插入`order_items`表（快照价格）
7. 清空该用户的购物车
8. 以上操作在同一个数据库事务中

---

### 5.2 我的订单

| 属性 | 内容 |
|------|------|
| URL | `/api/orders` |
| 方法 | GET |
| 需登录 | 是 |

**请求参数**
无（返回当前用户的所有订单）

**成功响应**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "list": [
            {
                "id": 1001,
                "order_no": "20260623123456",
                "total_amount": 136.00,
                "status": 0,
                "status_text": "待支付",
                "address": "北京市朝阳区xxx路123号",
                "phone": "13800138000",
                "created_at": "2026-06-23T12:00:00Z"
            }
        ]
    }
}
```

---

### 5.3 模拟支付

| 属性 | 内容 |
|------|------|
| URL | `/api/orders/:id/pay` |
| 方法 | PUT |
| 需登录 | 是 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 订单ID |

**请求参数**
无

**请求示例**
```
PUT /api/orders/1001/pay
```

**成功响应**
```json
{
    "code": 200,
    "message": "支付成功"
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "订单状态不允许支付"
}
```

**说明**
- 仅`status=0`（待支付）的订单可支付
- 支付后状态变为`status=1`（待发货）

---

### 5.4 取消订单

| 属性 | 内容 |
|------|------|
| URL | `/api/orders/:id/cancel` |
| 方法 | PUT |
| 需登录 | 是 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 订单ID |

**请求参数**
无

**请求示例**
```
PUT /api/orders/1001/cancel
```

**成功响应**
```json
{
    "code": 200,
    "message": "订单已取消"
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "订单状态不允许取消"
}
```

**说明（事务操作）**
- 仅`status=0`（待支付）的订单可取消
- 取消后`status=3`（已取消）
- 恢复库存（`UPDATE books SET stock = stock + quantity`）

---

### 5.5 确认收货

| 属性 | 内容 |
|------|------|
| URL | `/api/orders/:id/confirm` |
| 方法 | PUT |
| 需登录 | 是 |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 订单ID |

**请求参数**
无

**请求示例**
```
PUT /api/orders/1001/confirm
```

**成功响应**
```json
{
    "code": 200,
    "message": "已确认收货"
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "订单状态不允许确认收货"
}
```

**说明**
- 仅`status=1`（待发货）的订单可确认收货
- 确认后`status=2`（已完成）

---

## 六、后台管理模块（7个接口）

**通用说明**
- 所有后台接口需要管理员权限（`role=admin`）
- 非管理员访问返回 `{"code": 403, "message": "无权限访问"}`

---

### 6.1 后台图书列表

| 属性 | 内容 |
|------|------|
| URL | `/api/admin/books` |
| 方法 | GET |
| 需登录 | 是（管理员） |

**查询参数**

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 12 | 每页数量 |
| keyword | string | 否 | - | 按书名搜索 |
| status | int | 否 | - | 按状态筛选，不传则返回全部 |

**请求示例**
```
GET /api/admin/books?page=1&page_size=12&keyword=三体
```

**成功响应**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 150,
        "page": 1,
        "page_size": 12,
        "list": [
            {
                "id": 1,
                "title": "三体",
                "author": "刘慈欣",
                "price": 68.00,
                "stock": 100,
                "category_id": 1,
                "description": "《三体》是刘慈欣创作的系列长篇科幻小说...",
                "cover_url": "/static/uploads/santi.jpg",
                "status": 1,
                "created_at": "2026-06-23T10:00:00Z"
            }
        ]
    }
}
```

**说明**
- 与前台图书列表不同，后台返回所有状态的图书（包括下架的）

---

### 6.2 添加图书

| 属性 | 内容 |
|------|------|
| URL | `/api/admin/books` |
| 方法 | POST |
| 需登录 | 是（管理员） |
| Content-Type | multipart/form-data |

**请求参数（Form-Data）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 书名 |
| author | string | 是 | 作者 |
| price | float | 是 | 价格 |
| stock | int | 是 | 库存数量 |
| category_id | int | 是 | 分类ID |
| description | string | 否 | 简介 |
| cover | file | 否 | 封面图片文件 |

**请求示例（伪代码）**
```javascript
const formData = new FormData();
formData.append('title', '新书书名');
formData.append('author', '作者名');
formData.append('price', '99.00');
formData.append('stock', '50');
formData.append('category_id', '1');
formData.append('description', '这是一本好书...');
formData.append('cover', fileInput.files[0]);

fetch('/api/admin/books', {
    method: 'POST',
    body: formData,
    credentials: 'include'
});
```

**成功响应**
```json
{
    "code": 200,
    "message": "图书添加成功",
    "data": {
        "id": 200
    }
}
```

**说明**
- 封面图片上传后存储在`/static/uploads/`目录
- 若未上传封面，使用默认封面`default_cover.jpg`

---

### 6.3 编辑图书

| 属性 | 内容 |
|------|------|
| URL | `/api/admin/books/:id` |
| 方法 | PUT |
| 需登录 | 是（管理员） |
| Content-Type | multipart/form-data |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 图书ID |

**请求参数（Form-Data）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 否 | 书名 |
| author | string | 否 | 作者 |
| price | float | 否 | 价格 |
| stock | int | 否 | 库存数量 |
| category_id | int | 否 | 分类ID |
| description | string | 否 | 简介 |
| cover | file | 否 | 封面图片（上传则替换旧图） |

**请求示例**
```
PUT /api/admin/books/1
```
Form-Data同添加图书，只需传要修改的字段。

**成功响应**
```json
{
    "code": 200,
    "message": "图书信息已更新"
}
```

---

### 6.4 删除图书

| 属性 | 内容 |
|------|------|
| URL | `/api/admin/books/:id` |
| 方法 | DELETE |
| 需登录 | 是（管理员） |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 图书ID |

**请求示例**
```
DELETE /api/admin/books/1
```

**成功响应**
```json
{
    "code": 200,
    "message": "图书已删除"
}
```

**说明**
- 物理删除，从数据库中移除记录

---

### 6.5 上架/下架图书

| 属性 | 内容 |
|------|------|
| URL | `/api/admin/books/:id/status` |
| 方法 | PATCH |
| 需登录 | 是（管理员） |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 图书ID |

**请求参数（JSON）**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | int | 是 | 1=上架，0=下架 |

**请求示例**
```
PATCH /api/admin/books/1/status
```
```json
{
    "status": 1
}
```

**成功响应**
```json
{
    "code": 200,
    "message": "图书状态已更新"
}
```

---

### 6.6 后台订单列表

| 属性 | 内容 |
|------|------|
| URL | `/api/admin/orders` |
| 方法 | GET |
| 需登录 | 是（管理员） |

**查询参数**

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 12 | 每页数量 |
| status | int | 否 | - | 按订单状态筛选 |

**请求示例**
```
GET /api/admin/orders?page=1&page_size=12&status=0
```

**成功响应**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 50,
        "page": 1,
        "page_size": 12,
        "list": [
            {
                "id": 1001,
                "order_no": "20260623123456",
                "user_id": 1,
                "username": "testuser",
                "total_amount": 136.00,
                "status": 0,
                "status_text": "待支付",
                "address": "北京市朝阳区xxx路123号",
                "phone": "13800138000",
                "created_at": "2026-06-23T12:00:00Z"
            }
        ]
    }
}
```

**说明**
- 返回所有用户的订单（与前台"我的订单"不同）
- 包含`username`字段，便于管理员查看下单用户

---

### 6.7 发货

| 属性 | 内容 |
|------|------|
| URL | `/api/admin/orders/:id/ship` |
| 方法 | PATCH |
| 需登录 | 是（管理员） |

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 订单ID |

**请求参数**
无

**请求示例**
```
PATCH /api/admin/orders/1001/ship
```

**成功响应**
```json
{
    "code": 200,
    "message": "已发货"
}
```

**失败响应示例**
```json
{
    "code": 400,
    "message": "订单状态不允许发货"
}
```

**说明**
- 仅`status=1`（待发货）的订单可发货
- 发货后`status=2`（已完成）

---

## 七、订单状态流转

| 当前状态 | 操作 | 新状态 | 操作者 | 额外动作 |
|----------|------|--------|--------|----------|
| 待支付(0) | 模拟支付 | 待发货(1) | 用户 | 无 |
| 待支付(0) | 取消订单 | 已取消(3) | 用户 | 恢复库存 |
| 待发货(1) | 管理员发货 | 已完成(2) | 管理员 | 无 |
| 待发货(1) | 确认收货 | 已完成(2) | 用户 | 无 |

---

## 八、附录

### 附录A：数据库表名与字段命名

| 表名 | 对应模型 | 主要字段 |
|------|----------|----------|
| users | 用户 | id, username, password, role, created_at |
| categories | 分类 | id, name |
| books | 图书 | id, title, author, price, stock, category_id, description, cover_url, status, created_at |
| cart | 购物车 | id, user_id, book_id, quantity |
| orders | 订单 | id, user_id, order_no, total_amount, address, phone, status, created_at |
| order_items | 订单项 | id, order_id, book_id, quantity, price |

### 附录B：初始管理员账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | admin |

### 附录C：初始化分类

| ID | 分类名 |
|----|--------|
| 1 | 文学 |
| 2 | 科技 |
| 3 | 少儿 |
| 4 | 教育 |
| 5 | 网络文学 |
```

---

文件3完成，这是核心文件。确认后发文件4。