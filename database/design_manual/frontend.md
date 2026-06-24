好的，以下是**成员A（前端开发）** 的详细任务清单，包括具体要写的每个文件、每个函数、每个页面的详细说明。

---

# 成员A（前端开发）——详细任务清单

## 一、任务总览

| 类别 | 文件数量 | 预估工时 |
|------|----------|----------|
| HTML页面 | 11个 | 2天 |
| CSS样式 | 6个 | 1.5天 |
| JS核心模块 | 3个 | 0.5天 |
| JS页面模块 | 5个 | 2天 |
| JS组件 | 5个 | 1天 |
| 图片资源 | 若干 | 0.5天 |
| 联调测试 | - | 1.5天 |
| **合计** | | **约9天** |

---

## 二、HTML页面开发（11个页面）

### 2.1 页面清单

```
frontend/
│
├── index.html                    # 首页（图书列表）
├── login.html                    # 登录页
├── register.html                 # 注册页
├── book_detail.html              # 图书详情页
├── cart.html                     # 购物车页
├── order_confirm.html            # 订单确认页
├── order_pay.html                # 模拟支付页
├── my_orders.html                # 我的订单页
├── 404.html                      # 404错误页
│
└── admin/
    ├── books.html                # 后台图书管理页
    └── orders.html               # 后台订单管理页
```

### 2.2 各页面详细要求

#### 页面1：`index.html`（首页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 头部导航栏 | Logo、搜索框、购物车图标、用户昵称、退出按钮 | 搜索框支持回车搜索；点击购物车跳转cart.html；未登录显示“登录/注册” |
| 左侧分类栏 | 全部分类、文学、科技、少儿、教育、网络文学 | 点击分类筛选图书，高亮当前选中分类 |
| 图书列表区 | 网格展示图书（封面、书名、作者、价格） | 每行4个，支持分页，点击图书跳转详情页 |
| 底部 | 版权信息 | 固定显示 |

**需要调用的API**：
- `GET /api/books?page=1&size=12`（首页加载）
- `GET /api/books?category_id=1`（分类筛选）
- `GET /api/books?keyword=xxx`（搜索）

#### 页面2：`login.html`（登录页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 登录表单 | 用户名输入框、密码输入框、登录按钮 | 表单非空校验；提交后调用登录API |
| 注册链接 | 跳转到register.html | 点击跳转 |

**需要调用的API**：
- `POST /api/login`

#### 页面3：`register.html`（注册页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 注册表单 | 用户名、密码、确认密码 | 非空校验；两次密码一致校验；提交后调用注册API |
| 登录链接 | 跳转到login.html | 点击跳转 |

**需要调用的API**：
- `POST /api/register`

#### 页面4：`book_detail.html`（图书详情页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 图书信息 | 封面大图、书名、作者、价格、库存、简介 | 从URL获取bookId，加载图书详情 |
| 加入购物车按钮 | “加入购物车”按钮 | 点击调用加购API，提示成功 |
| 数量选择器 | 数字输入框（默认1，最小1，最大库存） | 可选功能 |

**需要调用的API**：
- `GET /api/books/:id`（加载详情）
- `POST /api/cart`（加入购物车）

#### 页面5：`cart.html`（购物车页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 购物车表格 | 封面、书名、单价、数量、小计、操作 | 动态渲染购物车数据 |
| 数量调节器 | +/-按钮 + 数字输入框 | 修改数量时自动更新小计和总金额 |
| 删除按钮 | 每行一个删除按钮 | 点击删除该商品 |
| 清空购物车 | “清空购物车”按钮 | 需二次确认 |
| 底部结算 | 显示总金额、“去结算”按钮 | 点击跳转order_confirm.html |

**需要调用的API**：
- `GET /api/cart`（加载购物车）
- `PUT /api/cart/:book_id`（修改数量）
- `DELETE /api/cart/:book_id`（删除商品）
- `DELETE /api/cart`（清空购物车）

#### 页面6：`order_confirm.html`（订单确认页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 收货信息 | 收货地址输入框、手机号输入框 | 表单非空校验 |
| 订单商品列表 | 商品名称、单价、数量、小计 | 从购物车传递数据 |
| 订单总额 | 显示总金额 | 自动计算 |
| 提交订单按钮 | “提交订单”按钮 | 点击提交，成功后跳转order_pay.html |

**需要调用的API**：
- `POST /api/orders`（提交订单）

#### 页面7：`order_pay.html`（模拟支付页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 订单信息 | 显示订单号、金额 | 从URL获取orderId |
| 二维码 | 显示固定二维码图片 | 图片路径：`/images/pay_qrcode.jpg` |
| 支付按钮 | “我已支付”按钮 | 点击调用支付API，成功后跳转my_orders.html |

**需要调用的API**：
- `PUT /api/orders/:id/pay`（模拟支付）

#### 页面8：`my_orders.html`（我的订单页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 订单列表 | 每个订单显示订单号、金额、状态、商品列表 | 动态渲染 |
| 取消订单按钮 | 仅“待支付”状态的订单显示 | 点击调用取消API，刷新列表 |
| 确认收货按钮 | 仅“待发货”状态的订单显示 | 点击调用确认收货API，刷新列表 |
| 去支付按钮 | 仅“待支付”状态的订单显示 | 点击跳转order_pay.html |

**需要调用的API**：
- `GET /api/orders`（加载订单列表）
- `PUT /api/orders/:id/cancel`（取消订单）
- `PUT /api/orders/:id/confirm`（确认收货）

#### 页面9：`404.html`（错误页）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 提示信息 | “页面不存在” | 返回首页链接 |

#### 页面10：`admin/books.html`（后台图书管理）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 图书表格 | ID、书名、作者、价格、库存、状态、操作 | 动态渲染，支持分页 |
| 添加按钮 | “添加图书”按钮 | 打开弹窗表单 |
| 编辑按钮 | 每行一个编辑按钮 | 打开弹窗回填数据 |
| 删除按钮 | 每行一个删除按钮 | 需二次确认 |
| 上架/下架按钮 | 切换状态 | 点击调用状态切换API |

**需要调用的API**：
- `GET /api/admin/books`（加载图书列表）
- `POST /api/admin/books`（添加图书）
- `PUT /api/admin/books/:id`（编辑图书）
- `DELETE /api/admin/books/:id`（删除图书）
- `PATCH /api/admin/books/:id/status`（上架/下架）

#### 页面11：`admin/orders.html`（后台订单管理）

| 区域 | 内容 | 交互要求 |
|------|------|----------|
| 订单表格 | 订单号、用户名、金额、地址、手机号、状态、操作 | 动态渲染，支持分页 |
| 发货按钮 | 仅“待发货”状态的订单显示 | 点击调用发货API，刷新列表 |

**需要调用的API**：
- `GET /api/admin/orders`（加载订单列表）
- `PATCH /api/admin/orders/:id/ship`（发货）

---

## 三、CSS样式开发

### 3.1 样式文件清单

```
frontend/css/
│
├── common.css                    # 全局公共样式
├── components.css                # 组件样式
├── layout.css                    # 布局样式
│
└── pages/
    ├── home.css                  # 首页样式
    ├── cart.css                  # 购物车样式
    └── admin.css                 # 后台样式
```

### 3.2 各样式文件详细要求

#### `common.css`（全局公共样式）

| 样式类别 | 内容 |
|----------|------|
| 重置样式 | margin/padding归零、box-sizing统一 |
| 字体设置 | 全局字体、行高、颜色 |
| 颜色变量 | 主色、辅色、边框色、背景色 |
| 通用类 | 容器(.container)、弹性布局(.flex)、文本工具(.text-center) |

#### `components.css`（组件样式）

| 组件 | 样式内容 |
|------|----------|
| 按钮 | 主要按钮(.btn-primary)、次要按钮、危险按钮 |
| 卡片 | 图书卡片(.book-card) |
| 表格 | 数据表格(.data-table) |
| 表单 | 输入框、表单组 |
| 弹窗 | 模态框(.modal) |
| 分页 | 分页组件(.pagination) |

#### `layout.css`（布局样式）

| 布局 | 样式内容 |
|------|----------|
| 头部 | 导航栏(.header)、Logo、菜单 |
| 底部 | 版权栏(.footer) |
| 侧边栏 | 分类导航(.sidebar) |
| 主内容区 | 内容区域(.main-content) |

#### `pages/home.css`（首页样式）

| 元素 | 样式内容 |
|------|----------|
| 图书网格 | 网格布局(grid)、每行4列 |
| 图书卡片 | 封面尺寸、标题截断、价格高亮 |
| 分类栏 | 分类列表、选中高亮 |
| 搜索框 | 搜索条样式 |

#### `pages/cart.css`（购物车样式）

| 元素 | 样式内容 |
|------|----------|
| 购物车表格 | 表格样式、图片缩略图 |
| 数量调节器 | +/-按钮样式 |
| 结算栏 | 底部固定结算条 |

#### `pages/admin.css`（后台样式）

| 元素 | 样式内容 |
|------|----------|
| 管理表格 | 紧凑表格、操作按钮组 |
| 表单弹窗 | 编辑弹窗样式 |
| 状态标签 | 上架/下架标签样式 |

---

## 四、JavaScript核心模块（core/）

### 4.1 `core/config.js`

```javascript
// 全局配置
const CONFIG = {
    API_BASE: 'http://localhost:8080/api',
    PAGE_SIZE: 12,
    DEFAULT_COVER: '/images/default_cover.jpg'
};
```

### 4.2 `core/api.js`

需要实现的函数：

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `request(url, options)` | 通用请求函数 | 统一添加Content-Type、携带Cookie、处理401 |
| `get(url)` | GET请求 | 调用request |
| `post(url, body)` | POST请求 | 调用request |
| `put(url, body)` | PUT请求 | 调用request |
| `del(url)` | DELETE请求 | 调用request |
| `patch(url, body)` | PATCH请求 | 调用request |

**关键实现**：
- 所有请求自动携带 `credentials: 'include'`
- 401响应自动跳转到 `/login.html`
- 统一错误处理，弹出提示框

### 4.3 `core/utils.js`

需要实现的工具函数：

| 函数 | 功能 | 示例 |
|------|------|------|
| `formatPrice(price)` | 格式化金额 | 19.9 → "¥19.90" |
| `formatDate(dateStr)` | 格式化日期 | "2024-01-01T00:00:00Z" → "2024-01-01" |
| `formatStatus(status)` | 格式化订单状态 | 0→"待支付"、1→"待发货"、2→"已完成"、3→"已取消" |
| `debounce(fn, delay)` | 防抖函数 | 搜索输入防抖 |
| `showMessage(msg, type)` | 提示消息 | type: success/error/warning |
| `getQueryParam(param)` | 获取URL参数 | ?id=1 → 返回1 |

---

## 五、JavaScript页面模块（modules/）

### 5.1 `modules/auth.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `login(username, password)` | 登录 | 调用POST /api/login，成功后保存用户信息到localStorage |
| `register(username, password)` | 注册 | 调用POST /api/register，成功后跳转登录页 |
| `logout()` | 退出 | 调用POST /api/logout，清除localStorage，跳转登录页 |
| `getCurrentUser()` | 获取当前用户 | 从localStorage读取 |
| `checkAuth()` | 检查登录状态 | 返回是否已登录 |
| `isAdmin()` | 检查是否管理员 | 返回role是否为admin |

### 5.2 `modules/books.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `loadBooks(page, categoryId, keyword)` | 加载图书列表 | 调用GET /api/books，返回数据 |
| `renderBooks(books)` | 渲染图书列表 | 动态生成HTML |
| `renderPagination(total, currentPage)` | 渲染分页 | 调用分页组件 |
| `loadBookDetail(bookId)` | 加载图书详情 | 调用GET /api/books/:id |
| `renderBookDetail(book)` | 渲染图书详情 | 填充页面元素 |
| `searchBooks(keyword)` | 搜索图书 | 调用loadBooks，传入keyword |
| `filterByCategory(categoryId)` | 分类筛选 | 调用loadBooks，传入categoryId |

### 5.3 `modules/cart.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `loadCart()` | 加载购物车 | 调用GET /api/cart |
| `renderCart(cartItems)` | 渲染购物车 | 生成表格、计算总金额 |
| `addToCart(bookId, quantity)` | 加入购物车 | 调用POST /api/cart |
| `updateQuantity(bookId, quantity)` | 修改数量 | 调用PUT /api/cart/:book_id |
| `removeItem(bookId)` | 删除商品 | 调用DELETE /api/cart/:book_id |
| `clearCart()` | 清空购物车 | 调用DELETE /api/cart，需二次确认 |
| `getCartTotal(cartItems)` | 计算总金额 | 遍历累加 |

### 5.4 `modules/order.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `createOrder(address, phone)` | 提交订单 | 调用POST /api/orders |
| `loadOrders()` | 加载订单列表 | 调用GET /api/orders |
| `renderOrders(orders)` | 渲染订单列表 | 分组展示每个订单及其商品 |
| `payOrder(orderId)` | 模拟支付 | 调用PUT /api/orders/:id/pay |
| `cancelOrder(orderId)` | 取消订单 | 调用PUT /api/orders/:id/cancel |
| `confirmOrder(orderId)` | 确认收货 | 调用PUT /api/orders/:id/confirm |
| `canCancel(status)` | 判断是否可取消 | status === 0 |
| `canConfirm(status)` | 判断是否可确认 | status === 1 |

### 5.5 `modules/admin.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `loadBooks(page, keyword)` | 加载图书列表 | 调用GET /api/admin/books |
| `renderBooksTable(books)` | 渲染图书表格 | 生成表格HTML |
| `createBook(formData)` | 添加图书 | 调用POST /api/admin/books（FormData） |
| `updateBook(id, formData)` | 编辑图书 | 调用PUT /api/admin/books/:id |
| `deleteBook(id)` | 删除图书 | 调用DELETE /api/admin/books/:id，需二次确认 |
| `updateBookStatus(id, status)` | 上下架 | 调用PATCH /api/admin/books/:id/status |
| `loadOrders()` | 加载订单列表 | 调用GET /api/admin/orders |
| `renderOrdersTable(orders)` | 渲染订单表格 | 生成表格HTML |
| `shipOrder(orderId)` | 发货 | 调用PATCH /api/admin/orders/:id/ship |

---

## 六、JavaScript组件（components/）

### 6.1 `components/header.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `renderHeader()` | 渲染头部导航栏 | 根据登录状态显示不同内容 |
| `updateCartBadge(count)` | 更新购物车角标 | 显示购物车商品数量 |
| `bindHeaderEvents()` | 绑定头部事件 | 退出按钮、搜索提交 |

**导航栏内容**：
- 已登录：显示用户名、购物车图标、退出按钮
- 未登录：显示“登录”和“注册”链接

### 6.2 `components/footer.js`

| 函数 | 功能 |
|------|------|
| `renderFooter()` | 渲染底部版权信息 |

### 6.3 `components/pagination.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `renderPagination(currentPage, totalPages, onPageChange)` | 渲染分页组件 | 生成页码按钮，绑定点击事件 |

**分页样式**：
- 上一页、页码（最多显示5个）、下一页
- 当前页高亮

### 6.4 `components/modal.js`

| 函数 | 功能 | 实现要点 |
|------|------|----------|
| `showModal(options)` | 显示弹窗 | options: title, content, onConfirm |
| `closeModal()` | 关闭弹窗 | 移除弹窗DOM |
| `showConfirm(message, onConfirm)` | 确认弹窗 | 二次确认用 |

### 6.5 `components/loading.js`

| 函数 | 功能 |
|------|------|
| `showLoading()` | 显示加载动画 |
| `hideLoading()` | 隐藏加载动画 |

---

## 七、应用入口（app.js）

### 7.1 主要职责

| 功能 | 实现要点 |
|------|----------|
| 页面初始化 | 根据当前页面URL，执行对应的初始化函数 |
| 路由守卫 | 检查页面是否需要登录，未登录跳转 |
| 公共组件渲染 | 渲染头部和底部 |
| 全局事件绑定 | 分类点击、搜索提交等 |

### 7.2 页面路由映射

| URL路径 | 页面 | 是否需要登录 | 是否需要admin |
|---------|------|--------------|----------------|
| / | index.html | 否 | 否 |
| /login.html | login.html | 否（已登录则跳转首页） | 否 |
| /register.html | register.html | 否（已登录则跳转首页） | 否 |
| /book_detail.html | book_detail.html | 否 | 否 |
| /cart.html | cart.html | 是 | 否 |
| /order_confirm.html | order_confirm.html | 是 | 否 |
| /order_pay.html | order_pay.html | 是 | 否 |
| /my_orders.html | my_orders.html | 是 | 否 |
| /admin/* | admin/* | 是 | 是 |

### 7.3 `app.js`核心代码结构

```javascript
// 页面路由映射表
const routes = {
    '/': { init: initHome, needAuth: false },
    '/login.html': { init: initLogin, needAuth: false, redirectIfAuth: true },
    '/cart.html': { init: initCart, needAuth: true },
    // ... 其他页面
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    // 1. 渲染公共组件
    renderHeader();
    renderFooter();
    
    // 2. 获取当前路径，执行对应初始化
    const path = window.location.pathname;
    const route = routes[path];
    
    // 3. 路由守卫检查
    if (route?.needAuth && !checkAuth()) {
        window.location.href = '/login.html';
        return;
    }
    
    // 4. 执行页面初始化
    if (route?.init) {
        route.init();
    }
});
```

---

## 八、图片资源

| 文件 | 用途 | 要求 |
|------|------|------|
| `images/logo.png` | 网站Logo | 尺寸：120x40px |
| `images/default_cover.jpg` | 默认图书封面 | 尺寸：200x260px |
| `images/pay_qrcode.jpg` | 模拟支付二维码 | 固定图片，尺寸：200x200px |
| `images/icons/cart.svg` | 购物车图标 | 24x24px |
| `images/icons/user.svg` | 用户图标 | 24x24px |
| `images/icons/close.svg` | 关闭图标 | 16x16px |

---

## 九、开发顺序建议（成员A）

| 顺序 | 任务 | 预估时间 | 产出 |
|------|------|----------|------|
| 1 | 搭建目录结构 | 0.5小时 | 所有文件夹创建完成 |
| 2 | 编写公共样式（common.css + layout.css） | 4小时 | 基础样式 |
| 3 | 编写header.js + footer.js | 2小时 | 公共组件 |
| 4 | 开发login.html + register.html | 3小时 | 登录注册页 |
| 5 | 开发index.html + 图书列表功能 | 6小时 | 首页 |
| 6 | 开发book_detail.html | 3小时 | 详情页 |
| 7 | 开发cart.html + 购物车功能 | 6小时 | 购物车页 |
| 8 | 开发order_confirm.html + order_pay.html | 4小时 | 订单页面 |
| 9 | 开发my_orders.html | 4小时 | 我的订单页 |
| 10 | 开发admin/books.html + admin/orders.html | 6小时 | 后台页面 |
| 11 | 编写404.html + 剩余样式 | 2小时 | 错误页 |
| 12 | 整体联调测试 | 8小时 | 修复bug |

---

## 十、验收标准

| 检查项 | 标准 |
|--------|------|
| 页面完整性 | 11个HTML页面均能正常访问 |
| 样式一致性 | 所有页面风格统一，响应式适配移动端 |
| 交互流畅性 | 按钮点击、表单提交、弹窗都有响应反馈 |
| API调用 | 所有API调用成功，错误提示友好 |
| 路由守卫 | 未登录状态访问需登录页面自动跳转 |
| 管理员权限 | 普通用户无法访问后台页面 |

---

这份清单中，成员A需要完成的所有文件、函数、页面都已详细列出。需要我进一步展开**某个具体的HTML文件**或**某个JS模块**的完整代码吗？