#!/bin/bash
#
# init_db.sh - 初始化数据库脚本（Linux/Mac）
# 用法：chmod +x init_db.sh && ./init_db.sh
#
# 前提条件：
#   1. 已安装 PostgreSQL 15+
#   2. postgres 用户或当前用户有创建数据库权限
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  网上书店系统 - 数据库初始化脚本${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 配置参数（可按需修改）
DB_NAME="bookstore"
DB_USER="${PGUSER:-postgres}"
SQL_FILE="../docs/database.sql"

# 1. 检查 PostgreSQL 是否运行
echo -e "${YELLOW}[1/5] 检查 PostgreSQL 服务状态...${NC}"
if command -v pg_isready &> /dev/null; then
    if pg_isready -q 2>/dev/null; then
        echo -e "${GREEN}  ✓ PostgreSQL 正在运行${NC}"
    else
        echo -e "${RED}  ✗ PostgreSQL 未运行，请先启动 PostgreSQL 服务${NC}"
        echo "    macOS: brew services start postgresql"
        echo "    Linux: sudo systemctl start postgresql"
        exit 1
    fi
else
    echo -e "${RED}  ✗ 未找到 pg_isready 命令，请确认 PostgreSQL 已安装并加入 PATH${NC}"
    exit 1
fi

# 2. 检查 SQL 文件是否存在
echo -e "${YELLOW}[2/5] 检查 SQL 文件...${NC}"
if [ -f "$SQL_FILE" ]; then
    echo -e "${GREEN}  ✓ 找到 SQL 文件: $SQL_FILE${NC}"
else
    echo -e "${RED}  ✗ SQL 文件不存在: $SQL_FILE${NC}"
    echo "    请确保在 scripts 目录下执行此脚本"
    exit 1
fi

# 3. 创建数据库
echo -e "${YELLOW}[3/5] 创建数据库 ${DB_NAME}...${NC}"
if psql -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}  ! 数据库 ${DB_NAME} 已存在，跳过创建${NC}"
else
    createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || {
        echo -e "${RED}  ✗ 创建数据库失败，请检查权限${NC}"
        exit 1
    }
    echo -e "${GREEN}  ✓ 数据库 ${DB_NAME} 创建成功${NC}"
fi

# 4. 执行建表 SQL
echo -e "${YELLOW}[4/5] 执行建表 SQL...${NC}"
psql -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE" -q 2>/dev/null || {
    echo -e "${RED}  ✗ SQL 执行失败，请检查错误信息${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ SQL 执行完成${NC}"

# 5. 验证表创建成功
echo -e "${YELLOW}[5/5] 验证表创建结果...${NC}"
TABLES=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>/dev/null)

if [ -n "$TABLES" ]; then
    echo -e "${GREEN}  ✓ 已创建以下表：${NC}"
    echo "$TABLES" | while read -r table; do
        if [ -n "$table" ]; then
            COUNT=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
            echo "    - $table（${COUNT} 条记录）"
        fi
    done
else
    echo -e "${RED}  ✗ 未找到任何表，初始化可能失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  数据库初始化完成！${NC}"
echo -e "${GREEN}  数据库名: ${DB_NAME}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "连接命令: psql -U ${DB_USER} -d ${DB_NAME}"
echo "运行测试数据: ./seed_data.sh"
