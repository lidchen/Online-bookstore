好的，以下是**成员C（后端开发）** 的任务清单，**侧重每个文件要实现的具体功能**，采用树形目录结构。

---

# 成员C（后端开发）——详细任务清单

## 目录结构

```
backend/                          # 【根目录】Go后端服务
│
├── main.go                       # 【入口】程序启动入口
├── go.mod                        # 【配置】Go模块依赖管理
├── .env                          # 【配置】环境变量
│
├── config/                       # 【配置层】
│   └── database.go               # 数据库连接配置
│
├── models/                       # 【模型层】数据模型（ORM映射）
│   ├── user.go                   # 用户模型
│   ├── category.go               # 分类模型
│   ├── book.go                   # 图书模型
│   ├── cart.go                   # 购物车模型
│   ├── order.go                  # 订单模型
│   └── order_item.go             # 订单项模型
│
├── controllers/                  # 【控制器层】处理HTTP请求
│   ├── user.go                   # 用户控制器
│   ├── book.go                   # 图书控制器
│   ├── cart.go                   # 购物车控制器
│   ├── order.go                  # 订单控制器
│   └── admin.go                  # 后台控制器
│
├── middleware/                   # 【中间件层】
│   └── auth.go                   # 认证中间件
│
├── routes/                       # 【路由层】
│   └── routes.go                 # 路由注册
│
├── utils/                        # 【工具层】
│   ├── response.go               # 统一响应格式
│   └── validator.go              # 输入校验工具
│
└── static/                       # 【静态资源】
    └── uploads/                  # 图书封面图片存储目录
```

---

## 一、项目初始化

### `main.go` - 程序入口

| 功能 | 说明 |
|------|------|
| 加载环境变量 | 读取 `.env` 文件中的配置 |
| 连接数据库 | 调用 `config.ConnectDB()` 初始化数据库连接 |
| 自动迁移 | 使用GORM自动创建/更新表结构 |
| 配置Session | 设置Cookie存储的Session中间件 |
| 配置CORS | 允许前端跨域访问，允许携带Cookie |
| 注册路由 | 调用 `routes.SetupRoutes()` 注册所有路由 |
| 启动服务器 | 在 `:8080` 端口启动Gin服务器 |

### `config/database.go` - 数据库连接

| 功能 | 说明 |
|------|------|
| 连接数据库 | 根据环境变量连接PostgreSQL |
| 连接池配置 | 设置最大打开连接数、最大空闲连接数 |
| 提供DB实例 | 返回GORM的DB对象供其他层使用 |

### `.env` - 环境变量

| 变量 | 说明 |
|------|------|
| `DB_HOST` | 数据库主机地址 |
| `DB_PORT` | 数据库端口 |
| `DB_USER` | 数据库用户名 |
| `DB_PASSWORD` | 数据库密码 |
| `DB_NAME` | 数据库名称 |
| `SERVER_PORT` | 服务器端口 |
| `SESSION_SECRET` | Session加密密钥 |

---

## 二、数据模型层（models/）

### `models/user.go` - 用户模型

| 功能 | 说明 |
|------|------|
| 定义User结构体 | 映射数据库users表 |
| `CheckUsernameExists()` | 检查用户名是否已被注册 |
| `GetUserByUsername()` | 根据用户名查询用户（用于登录） |
| `GetUserByID()` | 根据ID查询用户（用于Session） |
| `CreateUser()` | 创建新用户（注册） |

### `models/category.go` - 分类模型

| 功能 | 说明 |
|------|------|
| 定义Category结构体 | 映射数据库categories表 |
| `GetAllCategories()` | 获取所有图书分类 |
| `GetCategoryByID()` | 根据ID获取分类信息 |

### `models/book.go` - 图书模型

| 功能 | 说明 |
|------|------|
| 定义Book结构体 | 映射数据库books表 |
| `GetBooks()` | 分页获取图书列表（支持搜索关键词、分类筛选） |
| `GetBookByID()` | 根据ID获取图书详情（预加载分类信息） |
| `CreateBook()` | 创建新图书 |
| `UpdateBook()` | 更新图书信息 |
| `DeleteBook()` | 删除图书 |
| `UpdateBookStatus()` | 更新图书状态（上架/下架） |
| `UpdateStock()` | 扣减图书库存（下单时调用） |

### `models/cart.go` - 购物车模型

| 功能 | 说明 |
|------|------|
| 定义Cart结构体 | 映射数据库cart表 |
| `GetCartByUserID()` | 获取用户购物车（预加载图书信息） |
| `AddToCart()` | 加入购物车（已存在则数量+1） |
| `UpdateCartQuantity()` | 修改购物车商品数量 |
| `RemoveFromCart()` | 删除购物车中的商品 |
| `ClearCart()` | 清空用户购物车 |
| `GetCartItem()` | 获取购物车中的某个商品 |

### `models/order.go` - 订单模型

| 功能 | 说明 |
|------|------|
| 定义Order结构体 | 映射数据库orders表 |
| 定义状态常量 | `OrderStatusPending=0`、`OrderStatusPaid=1`、`OrderStatusCompleted=2`、`OrderStatusCancelled=3` |
| `CreateOrder()` | 创建订单 |
| `GetOrdersByUserID()` | 获取用户的订单列表 |
| `GetOrderByID()` | 根据ID获取订单 |
| `UpdateOrderStatus()` | 更新订单状态 |
| `GetAllOrders()` | 获取所有订单（管理员用） |
| `GenerateOrderNo()` | 生成唯一订单号（格式：yyyyMMdd+6位随机数） |

### `models/order_item.go` - 订单项模型

| 功能 | 说明 |
|------|------|
| 定义OrderItem结构体 | 映射数据库order_items表 |
| `CreateOrderItem()` | 创建单个订单项 |
| `GetOrderItemsByOrderID()` | 获取订单的所有订单项 |
| `BatchCreateOrderItems()` | 批量创建订单项（下单时一次性插入） |

---

## 三、工具函数层（utils/）

### `utils/response.go` - 统一响应格式

| 功能 | 说明 |
|------|------|
| `Success()` | 返回成功响应 `{"code":200,"message":"success","data":{}}` |
| `Error()` | 返回错误响应 `{"code":400,"message":"错误信息"}` |
| `Unauthorized()` | 返回未登录响应 `{"code":401,"message":"请先登录"}` |
| `Forbidden()` | 返回无权限响应 `{"code":403,"message":"无权限访问"}` |

### `utils/validator.go` - 输入校验工具

| 功能 | 说明 |
|------|------|
| `ValidateUsername()` | 验证用户名：非空，长度3-20字符 |
| `ValidatePassword()` | 验证密码：非空，长度6-20字符 |
| `ValidatePhone()` | 验证手机号：11位数字，以1开头 |
| `ValidateAddress()` | 验证地址：非空 |

---

## 四、中间件层（middleware/）

### `middleware/auth.go` - 认证中间件

| 功能 | 说明 |
|------|------|
| `AuthMiddleware()` | 登录检查中间件：从Session读取user_id，不存在则返回401 |
| `AdminMiddleware()` | 管理员检查中间件：检查role是否为admin，不是则返回403 |
| `GetCurrentUserID()` | 从Context获取当前登录用户ID |
| `GetCurrentUserRole()` | 从Context获取当前登录用户角色 |

---

## 五、控制器层（controllers/）

### `controllers/user.go` - 用户控制器

| 功能 | URL | 说明 |
|------|-----|------|
| `Register()` | POST /api/register | 接收用户名密码 → 校验格式 → 检查是否已存在 → 创建用户（明文密码）→ 返回成功 |
| `Login()` | POST /api/login | 接收用户名密码 → 查询用户 → 比对密码（明文）→ 正确则设置Session → 返回用户信息 |
| `Logout()` | POST /api/logout | 清除Session → 返回成功 |

### `controllers/book.go` - 图书控制器

| 功能 | URL | 说明 |
|------|-----|------|
| `GetBooks()` | GET /api/books | 接收分页参数(page, pageSize)、搜索关键词(keyword)、分类ID(category_id) → 调用模型查询 → 返回图书列表 |
| `GetBook()` | GET /api/books/:id | 接收图书ID → 调用模型查询详情 → 返回图书信息 |

### `controllers/cart.go` - 购物车控制器

| 功能 | URL | 说明 |
|------|-----|------|
| `GetCart()` | GET /api/cart | 从Session获取user_id → 查询购物车 → 返回购物车列表 |
| `AddToCart()` | POST /api/cart | 接收book_id和quantity → 校验库存 → 加入购物车（已存在则增加数量） |
| `UpdateCart()` | PUT /api/cart/:book_id | 接收quantity → 更新购物车商品数量 |
| `RemoveFromCart()` | DELETE /api/cart/:book_id | 删除购物车中的指定商品 |
| `ClearCart()` | DELETE /api/cart | 清空当前用户的所有购物车商品 |

### `controllers/order.go` - 订单控制器

| 功能 | URL | 说明 |
|------|-----|------|
| `CreateOrder()` | POST /api/orders | **事务处理**：获取购物车 → 检查库存 → 扣减库存 → 生成订单号 → 创建订单 → 创建订单项 → 清空购物车 → 返回订单信息 |
| `GetMyOrders()` | GET /api/orders | 从Session获取user_id → 查询订单列表（关联订单项和图书）→ 返回 |
| `PayOrder()` | PUT /api/orders/:id/pay | 模拟支付：更新订单状态从0（待支付）变为1（待发货） |
| `CancelOrder()` | PUT /api/orders/:id/cancel | **事务处理**：检查订单状态是否为待支付 → 恢复库存 → 更新订单状态为3（已取消） |
| `ConfirmOrder()` | PUT /api/orders/:id/confirm | 确认收货：更新订单状态从1（待发货）变为2（已完成） |

### `controllers/admin.go` - 后台控制器（需admin权限）

| 功能 | URL | 说明 |
|------|-----|------|
| `AdminGetBooks()` | GET /api/admin/books | 获取所有图书（不过滤status，包含下架图书），支持分页和搜索 |
| `AdminCreateBook()` | POST /api/admin/books | 接收表单数据 → 保存上传的封面图片 → 创建图书记录 |
| `AdminUpdateBook()` | PUT /api/admin/books/:id | 更新图书信息（标题、作者、价格、库存、分类、简介、封面） |
| `AdminDeleteBook()` | DELETE /api/admin/books/:id | 删除图书（物理删除） |
| `AdminUpdateBookStatus()` | PATCH /api/admin/books/:id/status | 更新图书状态（1上架/0下架） |
| `AdminGetOrders()` | GET /api/admin/orders | 获取所有订单列表（包含用户信息），支持分页 |
| `AdminShipOrder()` | PATCH /api/admin/orders/:id/ship | 发货：更新订单状态从1（待发货）变为2（已完成） |

---

## 六、路由注册层（routes/）

### `routes/routes.go` - 路由注册

| 分组 | 路径 | 中间件 | 包含路由 |
|------|------|--------|----------|
| 公开路由 | `/api` | 无 | 注册、登录、图书列表、图书详情 |
| 登录路由 | `/api` | `AuthMiddleware()` | 退出、购物车所有接口、订单所有接口 |
| 管理员路由 | `/api/admin` | `AuthMiddleware()` + `AdminMiddleware()` | 后台图书管理、后台订单管理 |
| 静态文件 | `/uploads` | 无 | 提供上传图片的访问服务 |

---

## 七、开发顺序

| 顺序 | 文件 | 功能概要 | 时间 |
|------|------|----------|------|
| 1 | `go.mod`、`.env`、`main.go`、`config/database.go` | 项目初始化 | 2h |
| 2 | `models/user.go`、`category.go`、`book.go` | 基础模型 | 2h |
| 3 | `models/cart.go`、`order.go`、`order_item.go` | 交易模型 | 2h |
| 4 | `utils/response.go`、`validator.go` | 工具函数 | 2h |
| 5 | `middleware/auth.go` | 认证中间件 | 2h |
| 6 | `controllers/user.go` | 注册/登录/退出 | 3h |
| 7 | `controllers/book.go` | 图书列表/详情 | 2h |
| 8 | `controllers/cart.go` | 购物车CRUD | 3h |
| 9 | `controllers/order.go` | 订单+事务 | 5h |
| 10 | `controllers/admin.go` | 后台管理 | 3h |
| 11 | `routes/routes.go` | 路由注册 | 1h |
| 12 | 联调测试 | 修复bug | 6h |

---

## 八、每个文件的输出总结

| 文件 | 输出内容 |
|------|----------|
| `main.go` | 可启动的Gin服务器 |
| `config/database.go` | 可用的数据库连接 |
| `models/*.go` | 6个数据结构和对应的CRUD函数 |
| `utils/response.go` | 4个统一响应函数 |
| `utils/validator.go` | 4个输入校验函数 |
| `middleware/auth.go` | 2个中间件 + 2个辅助函数 |
| `controllers/user.go` | 3个API接口 |
| `controllers/book.go` | 2个API接口 |
| `controllers/cart.go` | 5个API接口 |
| `controllers/order.go` | 5个API接口 |
| `controllers/admin.go` | 7个API接口 |
| `routes/routes.go` | 22个路由注册 |
| `static/uploads/` | 图片存储目录 |

---

这份清单**侧重每个文件要实现的具体功能**，成员C可以按照这个清单逐文件开发。需要我进一步展开**某个具体文件的完整代码**吗？