# ProxyIP 定时检查功能修复

## 问题描述

用户反映 Docker 自动定时检查 ProxyIP 没有生效：
1. 日志显示的是"定时获取优选IP"，而不是"定时检查ProxyIP"
2. ProxyIP 的"最后检查时间"一直不更新
3. 导致用户无法确定 ProxyIP 检测是否真正在运行

## 根本原因

发现了两个关键问题：

### 问题 1: 日志输出不清晰
- 定时任务中 ProxyIP 检测的日志标签都是 `[定时任务]`
- 当没有待检测的 ProxyIP 时，不会输出任何日志
- 用户无法区分是"获取优选IP"还是"检查ProxyIP"

### 问题 2: 数据库更新失败（致命问题）
- `updateProxyIPStatus` 函数期望接收 `id` 作为第一个参数
- 但 `server.js` 中调用时传递的是 `address` 和 `port`
- **导致数据库更新失败，检测结果无法保存！**

```javascript
// 错误的调用方式（server.js:274）
db.updateProxyIPStatus(result.address, result.port, { ... });

// 正确的函数签名（database.js:1026）
function updateProxyIPStatus(id, statusData) { ... }
```

## 修复方案

### 1. 优化日志输出

**修改文件**: `docker-manager/server.js`

- 将所有 ProxyIP 检测相关的日志标签改为 `[定时检查ProxyIP]`
- 将优选IP相关的日志标签改为 `[定时获取优选IP]`
- 添加总数和待检测数量的日志
- 当无需检测时也输出提示信息

```javascript
console.log(`[定时检查ProxyIP] 总计 ${allProxies.length} 个，待检测 ${pendingProxies.length} 个`);
console.log(`[定时检查ProxyIP] 本次检测 ${toCheck.length} 个 ProxyIP`);
console.log(`[定时检查ProxyIP] 检测完成: 活跃 ${activeCount} 个, 失败 ${failedCount} 个`);
console.log(`[定时检查ProxyIP] 无需检测（所有ProxyIP状态正常）`);
```

### 2. 修复数据库更新调用

**修改文件**: `docker-manager/server.js`

在调用 `db.updateProxyIPStatus` 之前，先创建 `address:port` 到 `id` 的映射：

```javascript
// 创建 address:port -> id 的映射
const addressToId = {};
toCheck.forEach(p => {
    const key = `${p.address}:${p.port}`;
    addressToId[key] = p.id;
});

// 使用 ID 调用更新函数
results.forEach(result => {
    const key = `${result.address}:${result.port || 443}`;
    const proxyId = addressToId[key];
    
    if (!proxyId) {
        console.error(`[定时检查ProxyIP] 找不到 ${key} 的 ID`);
        return;
    }
    
    db.updateProxyIPStatus(proxyId, { ... });
});
```

## 修复效果

修复后的日志输出示例：

```
[定时任务] 开始执行...
[定时获取优选IP] 更新完成: 手动 6 条, 自动 15 条
[定时检查ProxyIP] 总计 20 个，待检测 5 个
[定时检查ProxyIP] 本次检测 5 个 ProxyIP
[定时检查ProxyIP] 检测完成: 活跃 3 个, 失败 2 个
[定时检查ProxyIP] 已清理 1 个失效 ProxyIP
```

## 验证方法

1. 重启 Docker 容器，观察日志输出
2. 检查 ProxyIP 列表中的"最后检测"时间是否更新
3. 观察"状态"栏是否从"待检测"变为"活跃"或"失败"
4. 查看"成功/失败"计数是否正常累加

## 定时任务详情

- **执行频率**: 每 15 分钟
- **每次检测数量**: 最多 20 个
- **检测对象**: 
  - 状态为 `pending` 的 ProxyIP
  - 状态为 `failed` 且失败次数 < 3 的 ProxyIP
- **自动清理**: 失败次数 ≥ 5 的 ProxyIP 会被自动删除

## 相关文件

- `docker-manager/server.js` - 定时任务和日志输出
- `docker-manager/database.js` - 数据库操作函数
- `docker-manager/proxyip-checker.js` - ProxyIP 检测逻辑
- `docker-manager/views/admin.js` - 前端界面显示

## 修复日期

2026-01-19
