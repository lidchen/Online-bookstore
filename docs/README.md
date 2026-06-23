# 网上书店系统 - API设计文档

## 项目简介

本仓库是网上书店系统的API接口设计文档，属于成员B（接口开发）的产出物。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端语言 | Go | 1.21+ |
| Web框架 | Gin | v1.9+ |
| Session | gin-contrib/sessions | v0.0.5 |
| ORM | GORM | v1.25+ |
| 数据库 | PostgreSQL | 15+ |
| 认证方式 | Session（Cookie） | - |

## 目录结构
├── docs/
│ ├── api.md # API接口文档（22个接口完整定义）
│ ├── api_changelog.md # 接口变更日志
│ └── api_postman_collection.json # Postman测试集合（可选）
├── scripts/
│ ├── test_api.sh # API自动化测试脚本
│ └── mock_server/
│ └── mock_data.json # Mock模拟数据
└── README.md

text

## 接口总览

| 模块 | 数量 | 接口列表 |
|------|------|----------|
| 用户模块 | 3 | 注册、登录、退出 |
| 图书模块 | 2 | 图书列表（含搜索/分类）、图书详情 |
| 购物车模块 | 5 | 查看、加入、修改数量、删除商品、清空 |
| 订单模块 | 5 | 提交订单、我的订单、模拟支付、取消订单、确认收货 |
| 后台管理模块 | 7 | 图书列表、添加、编辑、删除、上下架、订单列表、发货 |
| **合计** | **22** | |

## 快速开始

### 使用Mock数据（前端独立开发时）

```bash
npx json-server --watch scripts/mock_server/mock_data.json --port 3000
运行API测试脚本（后端开发完成后）
bash
chmod +x scripts/test_api.sh
./scripts/test_api.sh
响应格式说明
成功响应
json
{
    "code": 200,
    "message": "success",
    "data": {}
}
失败响应
json
{
    "code": 400,
    "message": "错误信息"
}
未登录响应
json
{
    "code": 401,
    "message": "请先登录"
}
无权限响应
json
{
    "code": 403,
    "message": "无权限访问"
}
订单状态码
状态码	状态文本	说明
0	待支付	订单刚创建
1	待发货	用户已完成模拟支付
2	已完成	管理员发货或用户确认收货
3	已取消	用户在待支付状态下取消订单
图书状态码
状态码	状态文本	说明
0	下架	前端不显示
1	上架	前端正常显示