#!/bin/bash
#
# backup_db.sh - 数据库备份脚本
# 用法：chmod +x backup_db.sh && ./backup_db.sh
#
# 功能：
#   1. 创建备份目录
#   2. 生成带时间戳的备份文件名
#   3. 执行 pg_dump 备份
#   4. 压缩备份文件
#   5. 自动清理 7 天前的旧备份
#

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 配置参数
DB_NAME="bookstore"
DB_USER="${PGUSER:-postgres}"
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)/backups"
RETENTION_DAYS=7

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  网上书店系统 - 数据库备份脚本${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 1. 创建备份目录
echo -e "${YELLOW}[1/4] 创建备份目录...${NC}"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}  ✓ 备份目录: $BACKUP_DIR${NC}"

# 2. 生成备份文件名
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
echo -e "${YELLOW}[2/4] 备份文件名: $(basename "$BACKUP_FILE")${NC}"

# 3. 执行备份
echo -e "${YELLOW}[3/4] 正在备份数据库 ${DB_NAME}...${NC}"
if pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists > "$BACKUP_FILE" 2>/dev/null; then
    # 压缩
    gzip -f "$BACKUP_FILE"
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}  ✓ 备份完成：${BACKUP_FILE}.gz (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}  ✗ 备份失败，请检查数据库连接${NC}"
    exit 1
fi

# 4. 清理旧备份（保留最近 RETENTION_DAYS 天）
echo -e "${YELLOW}[4/4] 清理 ${RETENTION_DAYS} 天前的旧备份...${NC}"
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +${RETENTION_DAYS})
if [ -n "$OLD_BACKUPS" ]; then
    echo "$OLD_BACKUPS" | while read -r f; do
        rm -f "$f"
        echo "  删除: $(basename "$f")"
    done
    echo -e "${GREEN}  ✓ 旧备份清理完成${NC}"
else
    echo -e "${GREEN}  ✓ 无过期备份需要清理${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  备份完成！${NC}"
echo -e "${GREEN}  文件: ${BACKUP_FILE}.gz${NC}"
echo -e "${GREEN}  大小: ${BACKUP_SIZE}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "恢复命令: gunzip -c ${BACKUP_FILE}.gz | psql -U ${DB_USER} -d ${DB_NAME}"
echo "或手动恢复:"
echo "  gunzip ${BACKUP_FILE}.gz"
echo "  psql -U ${DB_USER} -d ${DB_NAME} < ${BACKUP_FILE}"
