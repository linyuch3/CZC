# ProxyIP 拖拽排序功能

## 功能说明

已为 ProxyIP 管理添加拖拽排序功能，允许管理员通过拖动调整 ProxyIP 的优先级顺序。

## 实现细节

### 1. 数据库修改
- 为 `proxy_ips` 表添加 `sort_order` 字段
- 自动迁移：为现有记录初始化排序值
- 查询时按 `sort_order` 排序

### 2. API 端点
新增排序更新接口：
```
POST /api/admin/proxyips/reorder
Body: { orderedIds: [1, 3, 2, 4, ...] }
```

### 3. 前端交互
- ✅ 每行前添加拖动图标
- ✅ 支持拖拽重新排序
- ✅ 实时保存到服务器
- ✅ 自动失败回滚

## 使用方法

1. 进入管理后台的 **智能 ProxyIP 管理** 页面
2. 在 ProxyIP 列表中，鼠标悬停在每行左侧的 **拖动图标** 上
3. 按住鼠标左键拖动行到目标位置
4. 松开鼠标，排序自动保存

## 工作原理

- **第一个 ProxyIP** 优先级最高
- Node Worker 会优先选择排序靠前且与节点同地区的 ProxyIP
- 排序保存后，立即在所有节点生效（通过 `/api/users` 接口同步）

## 与智能选择的配合

排序与基于机房位置的智能选择配合使用：

1. **先按地区匹配**：根据节点的 Cloudflare 机房位置（如 TPE=台湾）
2. **再按排序选择**：在同地区的 ProxyIP 中，选择排序靠前的

示例：
```
配置的 ProxyIP（按排序）：
1. 125.228.236.138:443  # 台湾
2. 154.16.10.198:18899  # 香港
3. 60.251.142.38:21476  # 台湾

当台湾节点（TPE）连接时：
→ 匹配到台湾 ProxyIP: #1 和 #3
→ 选择排序靠前的: #1 (125.228.236.138:443)
```

## 注意事项

- 排序更新会立即保存到数据库
- 如果保存失败，页面会自动刷新恢复原始顺序
- 建议将响应时间快、成功率高的 ProxyIP 排在前面

## 技术实现

### 数据库迁移
```sql
ALTER TABLE proxy_ips ADD COLUMN sort_order INTEGER DEFAULT 0;
CREATE INDEX idx_proxy_ips_sort_order ON proxy_ips(sort_order);
UPDATE proxy_ips SET sort_order = id WHERE sort_order = 0;
```

### 查询排序
```javascript
SELECT * FROM proxy_ips ORDER BY sort_order ASC, id ASC;
```

### 拖拽事件
- `dragstart` - 开始拖动
- `dragover` - 拖动经过
- `drop` - 放置
- `dragend` - 结束拖动并保存
