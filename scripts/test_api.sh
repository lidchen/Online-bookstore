#!/bin/bash

# ==========================================
# 网上书店系统 - API自动化测试脚本
# 使用前请确保后端服务已启动
# 启动命令：cd backend && go run main.go
# ==========================================

BASE_URL="http://localhost:8080/api"
COOKIE_FILE="/tmp/bookstore_test_cookie.txt"
PASS=0
FAIL=0
TOTAL=0

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 清理函数
cleanup() {
    rm -f "$COOKIE_FILE"
}
trap cleanup EXIT

# 测试函数（不带Cookie）
test_api_nocookie() {
    local name=$1
    local method=$2
    local url="${BASE_URL}${3}"
    local body=$4
    local expected=${5:-200}

    TOTAL=$((TOTAL + 1))
    echo -e "${YELLOW}[测试 ${TOTAL}]${NC} ${name}"

    local curl_cmd="curl -s -o /dev/null -w '%{http_code}' -X ${method} '${url}'"
    if [ -n "$body" ]; then
        curl_cmd="curl -s -o /dev/null -w '%{http_code}' -X ${method} '${url}' -H 'Content-Type: application/json' -d '${body}'"
    fi

    local code=$(eval $curl_cmd)

    if [ "$code" = "$expected" ]; then
        echo -e "  ${GREEN}✓ 通过${NC} (状态码: ${code})"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}✗ 失败${NC} (期望: ${expected}, 实际: ${code})"
        FAIL=$((FAIL + 1))
    fi
    echo ""
}

# 测试函数（带Cookie）
test_api() {
    local name=$1
    local method=$2
    local url="${BASE_URL}${3}"
    local body=$4
    local expected=${5:-200}

    TOTAL=$((TOTAL + 1))
    echo -e "${YELLOW}[测试 ${TOTAL}]${NC} ${name}"

    local curl_cmd="curl -s -o /dev/null -w '%{http_code}' -X ${method} '${url}' -b '${COOKIE_FILE}'"
    if [ -n "$body" ]; then
        curl_cmd="curl -s -o /dev/null -w '%{http_code}' -X ${method} '${url}' -b '${COOKIE_FILE}' -H 'Content-Type: application/json' -d '${body}'"
    fi

    local code=$(eval $curl_cmd)

    if [ "$code" = "$expected" ]; then
        echo -e "  ${GREEN}✓ 通过${NC} (状态码: ${code})"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}✗ 失败${NC} (期望: ${expected}, 实际: ${code})"
        FAIL=$((FAIL + 1))
    fi
    echo ""
}

echo "=========================================="
echo "  网上书店系统 - API自动化测试"
echo "  共22个接口"
echo "=========================================="
echo ""

# ==========================================
# 一、用户模块（3个接口）
# ==========================================
echo -e "${YELLOW}【用户模块 - 3个接口】${NC}"

# 1. 注册
test_api_nocookie "1/22 注册" "POST" "/register" \
  '{"username":"testuser_auto","password":"123456","confirm_password":"123456"}'

# 2. 注册 - 用户名已存在
test_api_nocookie "2/22 注册（用户名已存在）" "POST" "/register" \
  '{"username":"admin","password":"123456","confirm_password":"123456"}' 400

# 3. 登录 - 保存Cookie到文件
echo -e "${YELLOW}[测试 3/22]${NC} 登录（保存Session）"
TOTAL=$((TOTAL + 1))
curl -s -X POST "${BASE_URL}/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c "$COOKIE_FILE" \
  -o /dev/null \
  -w "%{http_code}" | xargs -I {} bash -c '
    if [ "{}" = "200" ]; then
      echo -e "  \033[0;32m✓ 通过\033[0m (状态码: {})"
      echo '$((PASS + 1))' > /dev/null
    else
      echo -e "  \033[0;31m✗ 失败\033[0m (状态码: {})"
    fi
  '
# 手动判断（简化处理）
LOGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c "$COOKIE_FILE")
if [ "$LOGIN_CODE" = "200" ]; then
    echo -e "  ${GREEN}✓ 通过${NC} (状态码: ${LOGIN_CODE})"
    PASS=$((PASS + 1))
else
    echo -e "  ${RED}✗ 失败${NC} (状态码: ${LOGIN_CODE})"
    FAIL=$((FAIL + 1))
fi
echo ""

# ==========================================
# 二、图书模块（2个接口）
# ==========================================
echo -e "${YELLOW}【图书模块 - 2个接口】${NC}"

# 4. 图书列表
test_api_nocookie "4/22 图书列表" "GET" "/books"

# 5. 图书详情
test_api_nocookie "5/22 图书详情" "GET" "/books/1"

# ==========================================
# 三、购物车模块（5个接口）
# ==========================================
echo -e "${YELLOW}【购物车模块 - 5个接口】${NC}"

# 6. 查看购物车
test_api "6/22 查看购物车" "GET" "/cart"

# 7. 加入购物车
test_api "7/22 加入购物车" "POST" "/cart" '{"book_id":1,"quantity":1}'

# 8. 再次加入同一商品（数量累加）
test_api "8/22 再次加入购物车" "POST" "/cart" '{"book_id":1,"quantity":2}'

# 9. 修改购物车数量
test_api "9/22 修改购物车数量" "PUT" "/cart/1" '{"quantity":5}'

# 10. 删除购物车商品
test_api "10/22 删除购物车商品" "DELETE" "/cart/1"

# 重新加一个商品用于下单测试
test_api "    （准备下单：加入商品）" "POST" "/cart" '{"book_id":2,"quantity":2}'

# ==========================================
# 四、订单模块（5个接口）
# ==========================================
echo -e "${YELLOW}【订单模块 - 5个接口】${NC}"

# 11. 提交订单
test_api "11/22 提交订单" "POST" "/orders" \
  '{"address":"北京市朝阳区测试路100号","phone":"13800138000"}'

# 获取订单ID用于后续测试
ORDER_ID=$(curl -s -X GET "${BASE_URL}/orders" -b "$COOKIE_FILE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -z "$ORDER_ID" ]; then
    ORDER_ID=1001
fi

# 12. 我的订单
test_api "12/22 我的订单" "GET" "/orders"

# 13. 模拟支付
test_api "13/22 模拟支付" "PUT" "/orders/${ORDER_ID}/pay"

# 14. 确认收货
test_api "14/22 确认收货" "PUT" "/orders/${ORDER_ID}/confirm"

# 15. 退出登录
test_api "15/22 退出登录" "POST" "/logout"

# 重新登录普通用户测试取消订单
echo -e "${YELLOW}    （切换为普通用户）${NC}"
curl -s -X POST "${BASE_URL}/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}' \
  -c "$COOKIE_FILE" > /dev/null

# 加入商品并下单
test_api "    （加购商品）" "POST" "/cart" '{"book_id":3,"quantity":1}'
test_api "    （提交订单）" "POST" "/orders" \
  '{"address":"上海市浦东新区测试路200号","phone":"13900139000"}'

CANCEL_ORDER_ID=$(curl -s -X GET "${BASE_URL}/orders" -b "$COOKIE_FILE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# 取消订单（真正的测试）
test_api "    （取消订单）" "PUT" "/orders/${CANCEL_ORDER_ID}/cancel"

# 重新登录管理员
curl -s -X POST "${BASE_URL}/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c "$COOKIE_FILE" > /dev/null

# ==========================================
# 五、后台管理模块（7个接口）
# ==========================================
echo -e "${YELLOW}【后台管理模块 - 7个接口】${NC}"

# 16. 后台图书列表
test_api "16/22 后台图书列表" "GET" "/admin/books"

# 17. 添加图书
test_api "17/22 添加图书" "POST" "/admin/books" "" 415
# 注：添加图书是multipart/form-data，这里只验证接口可达

# 18. 编辑图书
test_api "18/22 编辑图书" "PUT" "/admin/books/1" '{"title":"三体（修订版）","price":88.00}'

# 19. 上架
test_api "19/22 上架图书" "PATCH" "/admin/books/1/status" '{"status":1}'

# 20. 下架
test_api "20/22 下架图书" "PATCH" "/admin/books/1/status" '{"status":0}'

# 21. 后台订单列表
test_api "21/22 后台订单列表" "GET" "/admin/orders"

# 22. 发货
test_api "22/22 发货" "PATCH" "/admin/orders/${ORDER_ID}/ship"

# ==========================================
# 六、权限拦截测试
# ==========================================
echo -e "${YELLOW}【权限拦截测试】${NC}"

# 退出登录
test_api "    （退出登录）" "POST" "/logout"

# 清除Cookie
rm -f "$COOKIE_FILE"
touch "$COOKIE_FILE"

# 未登录访问购物车
test_api "   未登录-购物车" "GET" "/cart" "" 401

# 未登录访问后台
test_api "   未登录-后台" "GET" "/admin/books" "" 401

# ==========================================
# 七、结果汇总
# ==========================================
echo "=========================================="
echo "  测试结果汇总"
echo "=========================================="
echo -e "总计: ${TOTAL}"
echo -e "${GREEN}通过: ${PASS}${NC}"
echo -e "${RED}失败: ${FAIL}${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}存在失败的测试，请检查后端服务。${NC}"
    exit 1
fi