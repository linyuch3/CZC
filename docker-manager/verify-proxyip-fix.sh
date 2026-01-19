#!/bin/bash

# ProxyIP 定时检查功能测试脚本

echo "=================================="
echo "ProxyIP 定时检查功能修复验证"
echo "=================================="
echo ""

cd /workspaces/cccz/docker-manager

echo "1. 检查修复的代码..."
echo ""

# 检查日志标签是否正确
echo "✓ 检查定时检查ProxyIP日志标签..."
grep -c "定时检查ProxyIP" server.js

echo "✓ 检查定时获取优选IP日志标签..."
grep -c "定时获取优选IP" server.js

echo ""
echo "2. 检查关键修复点..."
echo ""

# 检查是否创建了 addressToId 映射
echo "✓ 检查 addressToId 映射创建..."
if grep -q "const addressToId = {}" server.js; then
    echo "   ✅ addressToId 映射已创建"
else
    echo "   ❌ addressToId 映射未找到"
fi

# 检查是否使用 proxyId 调用 updateProxyIPStatus
echo "✓ 检查 updateProxyIPStatus 调用参数..."
if grep -q "db.updateProxyIPStatus(proxyId," server.js; then
    echo "   ✅ 使用 proxyId 作为第一个参数"
else
    echo "   ❌ 参数不正确"
fi

echo ""
echo "3. 检查日志完整性..."
echo ""

echo "✓ 启动日志..."
grep "开始执行" server.js | head -1

echo ""
echo "✓ 检测统计日志..."
grep "总计.*待检测" server.js | head -1

echo ""
echo "✓ 检测结果日志..."
grep "检测完成.*活跃.*失败" server.js | head -1

echo ""
echo "✓ 无需检测日志..."
grep "无需检测" server.js | head -1

echo ""
echo "=================================="
echo "验证完成！"
echo "=================================="
echo ""
echo "下一步："
echo "1. 重启 Docker 容器: docker-compose restart"
echo "2. 查看日志: docker-compose logs -f"
echo "3. 等待定时任务执行（每15分钟）"
echo "4. 检查 ProxyIP 列表中的'最后检测'时间"
echo ""
