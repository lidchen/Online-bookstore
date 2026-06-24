-- =====================================================
-- 网上书店系统 - 数据库建表脚本
-- 数据库: bookstore
-- PostgreSQL 15+
-- =====================================================

-- 创建数据库（如果不存在）
-- CREATE DATABASE bookstore;
-- \c bookstore

-- =====================================================
-- 1. 用户表
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL          PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL,
    password    VARCHAR(100)    NOT NULL,
    role        VARCHAR(20)     DEFAULT 'user',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  users    IS '用户表';
COMMENT ON COLUMN users.id         IS '用户ID（自增主键）';
COMMENT ON COLUMN users.username   IS '用户名';
COMMENT ON COLUMN users.password   IS '密码（明文存储）';
COMMENT ON COLUMN users.role       IS '角色：user=普通用户，admin=管理员';
COMMENT ON COLUMN users.created_at IS '注册时间';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =====================================================
-- 2. 图书分类表
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id      SERIAL          PRIMARY KEY,
    name    VARCHAR(50)     NOT NULL
);

COMMENT ON TABLE  categories   IS '图书分类表';
COMMENT ON COLUMN categories.id   IS '分类ID（自增主键）';
COMMENT ON COLUMN categories.name IS '分类名称';

-- =====================================================
-- 3. 图书表
-- =====================================================
CREATE TABLE IF NOT EXISTS books (
    id            SERIAL          PRIMARY KEY,
    title         VARCHAR(200)    NOT NULL,
    author        VARCHAR(100)    NOT NULL,
    price         DECIMAL(10,2)   NOT NULL,
    stock         INT             NOT NULL DEFAULT 0,
    category_id   INT             REFERENCES categories(id),
    description   TEXT,
    cover_url     VARCHAR(500),
    status        SMALLINT        DEFAULT 1,
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  books            IS '图书表';
COMMENT ON COLUMN books.id           IS '图书ID（自增主键）';
COMMENT ON COLUMN books.title        IS '书名';
COMMENT ON COLUMN books.author       IS '作者';
COMMENT ON COLUMN books.price        IS '价格';
COMMENT ON COLUMN books.stock        IS '库存数量';
COMMENT ON COLUMN books.category_id  IS '分类ID（外键→categories.id）';
COMMENT ON COLUMN books.description  IS '图书简介';
COMMENT ON COLUMN books.cover_url    IS '封面图片路径';
COMMENT ON COLUMN books.status       IS '状态：1=上架，0=下架';
COMMENT ON COLUMN books.created_at   IS '上架时间';

CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status      ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_title       ON books(title);

-- =====================================================
-- 4. 购物车表
-- =====================================================
CREATE TABLE IF NOT EXISTS cart (
    id          SERIAL          PRIMARY KEY,
    user_id     INT             NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    book_id     INT             NOT NULL REFERENCES books(id)   ON DELETE CASCADE,
    quantity    INT             NOT NULL DEFAULT 1
);

COMMENT ON TABLE  cart          IS '购物车表';
COMMENT ON COLUMN cart.id         IS '记录ID（自增主键）';
COMMENT ON COLUMN cart.user_id    IS '用户ID（外键→users.id）';
COMMENT ON COLUMN cart.book_id    IS '图书ID（外键→books.id）';
COMMENT ON COLUMN cart.quantity   IS '数量';

CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_book_id ON cart(book_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_user_book ON cart(user_id, book_id);

-- =====================================================
-- 5. 订单表
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL          PRIMARY KEY,
    user_id         INT             NOT NULL REFERENCES users(id),
    order_no        VARCHAR(32)     NOT NULL,
    total_amount    DECIMAL(10,2)   NOT NULL,
    address         VARCHAR(200)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    status          SMALLINT        DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  orders              IS '订单表';
COMMENT ON COLUMN orders.id             IS '订单ID（自增主键）';
COMMENT ON COLUMN orders.user_id        IS '用户ID（外键→users.id）';
COMMENT ON COLUMN orders.order_no       IS '订单号（唯一）';
COMMENT ON COLUMN orders.total_amount   IS '订单总金额';
COMMENT ON COLUMN orders.address        IS '收货地址';
COMMENT ON COLUMN orders.phone          IS '联系电话';
COMMENT ON COLUMN orders.status         IS '状态：0=待支付，1=待发货，2=已完成，3=已取消';
COMMENT ON COLUMN orders.created_at     IS '下单时间';

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_no   ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_user_id           ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at        ON orders(created_at);

-- =====================================================
-- 6. 订单项表
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL          PRIMARY KEY,
    order_id    INT             NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    book_id     INT             NOT NULL REFERENCES books(id),
    quantity    INT             NOT NULL,
    price       DECIMAL(10,2)   NOT NULL
);

COMMENT ON TABLE  order_items           IS '订单项表';
COMMENT ON COLUMN order_items.id          IS '记录ID（自增主键）';
COMMENT ON COLUMN order_items.order_id    IS '订单ID（外键→orders.id）';
COMMENT ON COLUMN order_items.book_id     IS '图书ID（外键→books.id）';
COMMENT ON COLUMN order_items.quantity    IS '购买数量';
COMMENT ON COLUMN order_items.price       IS '购买时单价（快照）';

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_book_id  ON order_items(book_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_book ON order_items(order_id, book_id);

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入 5 个固定分类
INSERT INTO categories (name) VALUES
    ('文学'),
    ('科技'),
    ('少儿'),
    ('教育'),
    ('网络文学')
ON CONFLICT DO NOTHING;

-- 插入管理员账号（密码：admin123，明文）
INSERT INTO users (username, password, role) VALUES
    ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;
