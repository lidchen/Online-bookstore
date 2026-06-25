#!/bin/bash
#
# seed_data.sh - 插入测试数据脚本
# 用法：chmod +x seed_data.sh && ./seed_data.sh
#
# 前提条件：数据库已初始化（已执行 init_db.sh）
#

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_NAME="bookstore"
DB_USER="${PGUSER:-postgres}"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  网上书店系统 - 测试数据插入脚本${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# =====================================================
# 1. 插入测试用户（3个普通用户）
# =====================================================
echo -e "${YELLOW}[1/5] 插入测试用户...${NC}"

psql -U "$DB_USER" -d "$DB_NAME" -q <<EOF
INSERT INTO users (username, password, role) VALUES
    ('user1', 'user1', 'user'),
    ('user2', 'user2', 'user'),
    ('user3', 'user3', 'user')
ON CONFLICT (username) DO NOTHING;
EOF

echo -e "${GREEN}  ✓ 测试用户插入完成（user1/user1, user2/user2, user3/user3）${NC}"

# =====================================================
# 2. 插入测试图书（10本，覆盖5个分类）
# =====================================================
echo -e "${YELLOW}[2/5] 插入测试图书...${NC}"

psql -U "$DB_USER" -d "$DB_NAME" -q <<EOF
-- 文学（id=1）
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('三体', '刘慈欣', 68.00, 100, 1, '科幻巨作，讲述地球文明与三体文明之间的生死博弈。', 1),
    ('解忧杂货店', '东野圭吾', 49.90, 50, 1, '现代人内心流失的东西，这家杂货店能帮你找回。', 1),
    ('活着', '余华', 39.00, 80, 1, '讲述了农村人福贵悲惨的人生遭遇。', 1)
ON CONFLICT DO NOTHING;

-- 科技（id=2）
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('Go语言编程', '李文塔', 89.00, 30, 2, '全面介绍Go语言的编程技巧和实战经验。', 1),
    ('深入理解计算机系统', '布莱恩特', 139.00, 20, 2, '从程序员视角全面剖析计算机系统。', 1)
ON CONFLICT DO NOTHING;

-- 少儿（id=3）
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('小王子', '圣埃克苏佩里', 35.00, 80, 3, '一个永不过时的童话，献给每一个曾经是孩子的大人。', 1),
    ('哈利·波特与魔法石', 'J.K.罗琳', 59.00, 60, 3, '一岁的哈利·波特失去了父母后，开始了他的魔法旅程。', 1)
ON CONFLICT DO NOTHING;

-- 教育（id=4）
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('新华字典', '商务印书馆', 25.00, 200, 4, '中国最权威的小型汉语字典。', 1),
    ('Python编程从入门到实践', '埃里克·马瑟斯', 79.00, 45, 4, '适合初学者的Python编程入门教程。', 1)
ON CONFLICT DO NOTHING;

-- 网络文学（id=5）
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('全职高手', '蝴蝶蓝', 120.00, 40, 5, '网游荣耀中被驱逐的顶尖高手叶修，重返巅峰之路。', 1)
ON CONFLICT DO NOTHING;
EOF

echo -e "${GREEN}  ✓ 测试图书插入完成（共10本）${NC}"

# =====================================================
# 3. 插入购物车数据
# =====================================================
echo -e "${YELLOW}[3/5] 插入购物车测试数据...${NC}"

psql -U "$DB_USER" -d "$DB_NAME" -q <<EOF
INSERT INTO cart (user_id, book_id, quantity) VALUES
    (2, 1, 2),   -- user1 添加了 2 本《三体》
    (2, 4, 1),   -- user1 添加了 1 本《Go语言编程》
    (3, 7, 1)    -- user2 添加了 1 本《哈利·波特》
ON CONFLICT (user_id, book_id) DO UPDATE SET quantity = EXCLUDED.quantity;
EOF

echo -e "${GREEN}  ✓ 购物车测试数据插入完成${NC}"

# =====================================================
# 4. 插入订单测试数据
# =====================================================
echo -e "${YELLOW}[4/5] 插入订单测试数据...${NC}"

psql -U "$DB_USER" -d "$DB_NAME" -q <<EOF
-- user1 的待支付订单
INSERT INTO orders (user_id, order_no, total_amount, address, phone, status)
VALUES (2, '202401010001', 136.00, '北京市海淀区xx路1号', '13800138001', 0);

INSERT INTO order_items (order_id, book_id, quantity, price)
VALUES (1, 1, 2, 68.00);

-- user1 的待发货订单
INSERT INTO orders (user_id, order_no, total_amount, address, phone, status)
VALUES (2, '202401020001', 89.00, '北京市海淀区xx路1号', '13800138001', 1);

INSERT INTO order_items (order_id, book_id, quantity, price)
VALUES (2, 4, 1, 89.00);

-- user2 的已完成订单
INSERT INTO orders (user_id, order_no, total_amount, address, phone, status)
VALUES (3, '202401030001', 35.00, '上海市浦东新区yy路2号', '13900139001', 2);

INSERT INTO order_items (order_id, book_id, quantity, price)
VALUES (3, 6, 1, 35.00);

-- user3 的已取消订单
INSERT INTO orders (user_id, order_no, total_amount, address, phone, status)
VALUES (4, '202401040001', 120.00, '广州市天河区zz路3号', '13700137001', 3);

INSERT INTO order_items (order_id, book_id, quantity, price)
VALUES (4, 10, 1, 120.00);
EOF

echo -e "${GREEN}  ✓ 订单测试数据插入完成（共4个订单）${NC}"

# =====================================================
# 汇总
# =====================================================
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  测试数据插入完成！${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "--- 数据汇总 ---"
psql -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT 'users' AS table_name, COUNT(*) AS cnt FROM users
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'books', COUNT(*) FROM books
UNION ALL SELECT 'cart', COUNT(*) FROM cart
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
ORDER BY table_name;
" 2>/dev/null
echo ""
echo "--- 测试账号 ---"
echo "  管理员: admin / admin123"
echo "  用户1:  user1 / user1"
echo "  用户2:  user2 / user2"
echo "  用户3:  user3 / user3"
echo -e "${YELLOW}[5/5] 设置封面路径...${NC}"

psql -U "$DB_USER" -d "$DB_NAME" -q <<EOF
UPDATE books SET cover_url = '/static/uploads/' || title || '.jpg'
WHERE cover_url IS NULL;
EOF

echo -e "${GREEN}  ✓ 封面路径设置完成${NC}"

# =====================================================
# 汇总
# =====================================================
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  测试数据全部完成（5/5）！${NC}"
echo -e "${YELLOW}========================================${NC}"
