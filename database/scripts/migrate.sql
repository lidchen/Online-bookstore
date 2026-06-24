-- =====================================================
-- 网上书店系统 - 数据库迁移脚本
--
-- 用法：
--   psql -d bookstore -f migrate.sql
--
-- 版本记录：
--   v1.0.0 - 初始版本（2024-01-01）
--     6张表创建 + 索引 + 初始数据
-- =====================================================

-- =====================================================
-- 迁移 #001 - 为 books 表添加出版社字段（示例）
-- =====================================================
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher VARCHAR(100);
-- COMMENT ON COLUMN books.publisher IS '出版社';

-- =====================================================
-- 迁移 #002 - 为订单表添加备注字段（示例）
-- =====================================================
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS remark TEXT;
-- COMMENT ON COLUMN orders.remark IS '订单备注';

-- =====================================================
-- 迁移 #003 - 扩大 password 字段长度（示例）
-- =====================================================
-- ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(255);

-- =====================================================
-- 迁移 #004 - 添加联合索引以优化搜索性能（示例）
-- =====================================================
-- CREATE INDEX IF NOT EXISTS idx_books_title_author ON books(title, author);

-- =====================================================
-- 迁移 #005 - 为 order_items 添加赠品标记（示例）
-- =====================================================
-- ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_gift SMALLINT DEFAULT 0;
-- COMMENT ON COLUMN order_items.is_gift IS '是否赠品：0=否，1=是';

-- =====================================================
-- 迁移记录表（用于追踪已执行的迁移）
-- =====================================================

-- CREATE TABLE IF NOT EXISTS schema_migrations (
--     version     VARCHAR(20)     PRIMARY KEY,
--     description VARCHAR(200)    NOT NULL,
--     applied_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
-- );

-- COMMENT ON TABLE schema_migrations IS '数据库迁移记录表';

-- 插入迁移记录示例：
-- INSERT INTO schema_migrations (version, description) VALUES
--     ('001', 'books 表添加 publisher 字段'),
--     ('002', 'orders 表添加 remark 字段'),
--     ('003', 'users 表扩展 password 字段长度'),
--     ('004', 'books 表添加 title+author 联合索引'),
--     ('005', 'order_items 表添加 is_gift 字段');
