-- =====================================================
-- 网上书店系统 - 测试数据
-- 供 docker-compose 自动执行（挂载为 02_seed.sql）
-- =====================================================

-- 测试用户（3个普通用户）
INSERT INTO users (username, password, role) VALUES
    ('user1', 'user1', 'user'),
    ('user2', 'user2', 'user'),
    ('user3', 'user3', 'user')
ON CONFLICT (username) DO NOTHING;

-- 测试图书（10本，覆盖5个分类）
-- 文学 (category_id=1)
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('三体', '刘慈欣', 68.00, 100, 1, '科幻巨作，讲述地球文明与三体文明之间的生死博弈。', 1),
    ('解忧杂货店', '东野圭吾', 49.90, 50, 1, '现代人内心流失的东西，这家杂货店能帮你找回。', 1),
    ('活着', '余华', 39.00, 80, 1, '讲述了农村人福贵悲惨的人生遭遇。', 1)
ON CONFLICT DO NOTHING;

-- 科技 (category_id=2)
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('Go语言编程', '李文塔', 89.00, 30, 2, '全面介绍Go语言的编程技巧和实战经验。', 1),
    ('深入理解计算机系统', '布莱恩特', 139.00, 20, 2, '从程序员视角全面剖析计算机系统。', 1)
ON CONFLICT DO NOTHING;

-- 少儿 (category_id=3)
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('小王子', '圣埃克苏佩里', 35.00, 80, 3, '一个永不过时的童话，献给每一个曾经是孩子的大人。', 1),
    ('哈利·波特与魔法石', 'J.K.罗琳', 59.00, 60, 3, '一岁的哈利·波特失去了父母后，开始了他的魔法旅程。', 1)
ON CONFLICT DO NOTHING;

-- 教育 (category_id=4)
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('新华字典', '商务印书馆', 25.00, 200, 4, '中国最权威的小型汉语字典。', 1),
    ('Python编程从入门到实践', '埃里克·马瑟斯', 79.00, 45, 4, '适合初学者的Python编程入门教程。', 1)
ON CONFLICT DO NOTHING;

-- 网络文学 (category_id=5)
INSERT INTO books (title, author, price, stock, category_id, description, status) VALUES
    ('全职高手', '蝴蝶蓝', 120.00, 40, 5, '网游荣耀中被驱逐的顶尖高手叶修，重返巅峰之路。', 1)
ON CONFLICT DO NOTHING;

-- 购物车数据
INSERT INTO cart (user_id, book_id, quantity) VALUES
    (2, 1, 2),   -- user1 添加了 2 本《三体》
    (2, 4, 1),   -- user1 添加了 1 本《Go语言编程》
    (3, 7, 1)    -- user2 添加了 1 本《哈利·波特》
ON CONFLICT (user_id, book_id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- 订单数据（覆盖4种状态）
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

-- 设置封面路径
UPDATE books SET cover_url = '/static/uploads/' || title || '.jpg'
WHERE cover_url IS NULL;

SELECT 'seed_data.sql 执行完成' AS result;
SELECT 'users' AS 表名, COUNT(*) AS 记录数 FROM users
UNION ALL SELECT 'books', COUNT(*) FROM books
UNION ALL SELECT 'cart', COUNT(*) FROM cart
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'categories', COUNT(*) FROM categories;
