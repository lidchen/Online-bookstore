两个问题已经修好了，现在新机器上的步骤很干净。给你一个完整的两平台指南。

---

## 新机器运行指南

### 第一步：安装前置软件

| 软件                     | macOS                                                              | Windows                  |
| ------------------------ | ------------------------------------------------------------------ | ------------------------ |
| **Docker Desktop** | [docker.com](https://www.docker.com/products/docker-desktop/)下载安装 | 同上                     |
| **Go**             | `brew install go`                                                | `winget install Go.Go` |

装完打开 Docker Desktop，等它启动完成。

---

### 第二步：启动数据库

```
# Mac / Windows 通用
cd database
docker compose up -d
```

第一次启动时会自动执行：

* `01_schema.sql` → 建 6 张表 + 初始分类 + 管理员
* `02_seed.sql` → 插入 10 本图书 + 3 个用户 + 购物车 + 4 个订单

验证：

```
docker exec bookstore-db psql -U postgres -d bookstore -c "\dt"
```

应该看到 6 张表。

---

### 第三步：启动后端

```
cd backend
go mod download
go run main.go
```

看到 `Server starting on :8080` 就说明起来了。

---

### 第四步：打开浏览器

访问 **[http://localhost:8080](http://localhost:8080/)**

---

### 登录账号

| 角色     | 用户名 | 密码     |
| -------- | ------ | -------- |
| 管理员   | admin  | admin123 |
| 普通用户 | user1  | user1    |
| 普通用户 | user2  | user2    |
| 普通用户 | user3  | user3    |

---

### 完整命令（Mac）

```
# 装 Go（如果没有）
brew install go

# 启动数据库
cd /path/to/bookstore/database
docker compose up -d

# 启动后端
cd ../backend
go mod download
go run main.go
```

### 完整命令（Windows PowerShell）

```
# 装 Go（如果没有）
winget install Go.Go

# 启动数据库
cd database
docker compose up -d

# 启动后端
cd ../backend
go mod download
go run main.go
```

---

### 如果需要重新初始化数据库

```
cd database
docker compose down -v   # 删掉数据卷重新来过
docker compose up -d      # 重新建库 + 灌数据
```

现在这个流程走完就能用了，有什么地方卡住的话随时告诉我。
