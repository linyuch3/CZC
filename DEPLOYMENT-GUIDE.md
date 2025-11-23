# VLESS 用户管理系统 - 完整部署指南

本系统在原有的 VLESS 控制面板基础上，新增了完整的用户前端系统，支持用户注册、登录、订阅管理等功能。

## 📋 目录

- [系统架构](#系统架构)
- [功能特性](#功能特性)
- [部署步骤](#部署步骤)
- [环境变量配置](#环境变量配置)
- [数据库初始化](#数据库初始化)
- [使用说明](#使用说明)

---

## 🏗️ 系统架构

### 组件说明

1. **User-Manager-Worker.js** - 管理端 + 用户前端
   - 管理员面板：管理用户、配置节点
   - 用户前端：注册、登录、订阅管理
   - API 接口：供节点端拉取用户数据

2. **Node-Worker.js** - 节点端
   - 从管理端拉取用户数据
   - 处理 VLESS 代理连接
   - 智能选择代理路由

3. **V2bX-Node-Worker.js** - V2Board 兼容节点端
   - 兼容 V2Board 后端
   - 支持流量统计上报

### 数据库表结构

- `users` - UUID 用户表（原有）
- `user_accounts` - 前端用户账号表（新增）
- `user_sessions` - 用户会话表（新增）
- `settings` - 系统配置表（原有）

---

## ✨ 功能特性

### 管理员功能
- ✅ 用户 UUID 管理（增删改查）
- ✅ 批量操作（启用/禁用/删除）
- ✅ 反代 IP 配置管理
- ✅ 优选域名配置（支持自动抓取）
- ✅ 订阅地址配置
- ✅ 自定义管理员面板路径
- ✅ 数据迁移（KV → D1）

### 用户功能（新增）
- ✅ 用户注册（可开启/关闭）
- ✅ 用户登录/登出
- ✅ 查看账号信息和状态
- ✅ 复制 UUID
- ✅ 一键复制订阅链接
- ✅ 支持多客户端订阅（Clash/Surge/Shadowrocket/QuantumultX）
- ✅ 账号到期提醒

---

## 🚀 部署步骤

### 1. 创建 Cloudflare D1 数据库

在 Cloudflare Dashboard：

1. 进入 **Workers & Pages** > **D1**
2. 点击 **Create database**
3. 数据库名称：`vless_db` (或自定义)
4. 点击 **Create**

### 2. 初始化数据库表结构

#### 方法一：使用 Dashboard Console

1. 进入你创建的 D1 数据库
2. 点击 **Console** 标签页
3. 复制 `database-schema.sql` 文件中的 SQL 语句
4. 粘贴到控制台并点击 **Execute**

#### 方法二：使用 Wrangler CLI

```bash
# 安装 wrangler（如果还没安装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 执行 SQL 文件
wrangler d1 execute vless_db --file=database-schema.sql
```

### 3. 部署 User-Manager-Worker (管理端)

#### 使用 Cloudflare Dashboard 部署

1. 进入 **Workers & Pages**
2. 点击 **Create application** > **Create Worker**
3. 命名：`vless-manager`（或自定义）
4. 点击 **Deploy**
5. 点击 **Edit code**
6. 删除所有默认代码，复制 `User-Manager-Worker.js` 的完整内容
7. 点击 **Save and Deploy**

#### 配置 Worker 设置

1. 返回 Worker 详情页
2. 点击 **Settings** > **Variables**
3. 添加环境变量（见下方"环境变量配置"）
4. 点击 **Settings** > **Bindings**
5. 添加 D1 绑定：
   - Variable name: `DB`
   - D1 database: 选择你创建的数据库
6. 点击 **Save**

#### 配置触发器（可选 - 用于定时更新优选 IP）

1. 点击 **Triggers** 标签页
2. 点击 **Add Cron Trigger**
3. Cron 表达式：`*/15 * * * *` （每15分钟执行一次）
4. 点击 **Add Trigger**

### 4. 部署 Node-Worker (节点端)

1. 创建新的 Worker：`vless-node`
2. 复制 `Node-Worker.js` 的内容
3. 修改配置区域：
   ```javascript
   // 管理端 API 地址
   const REMOTE_API_URL = 'https://你的管理端域名/api/users';
   ```
4. 点击 **Save and Deploy**

---

## ⚙️ 环境变量配置

在 User-Manager-Worker 的 **Settings** > **Variables** 中添加：

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ADMIN_PASSWORD` | 管理员密码 | `your_secure_password` |
| `DB` | D1 数据库绑定 | （在 Bindings 中配置） |

### 可选变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `ADMIN_PATH` | 管理员面板路径 | `/admin` | `/admin` 或 `/secret-admin` |

**注：** 用户注册开关已移至管理后台，可在仪表盘中直接控制，无需设置环境变量。

---

## 📖 使用说明

### 管理员操作

#### 访问管理员面板

```
https://your-manager-domain.workers.dev/admin
```

（如果自定义了 `ADMIN_PATH`，则访问相应路径）

**默认登录：**
- 密码：环境变量 `ADMIN_PASSWORD` 中设置的密码

#### 配置订阅地址

1. 登录管理员面板
2. 进入 **仪表盘** 或 **反代 IP** 页面
3. 在"节点订阅地址"中填入你的节点端域名
   ```
   https://your-node-domain.workers.dev
   ```
4. 点击 **保存配置**

#### 添加用户

**方式一：手动添加**
1. 进入 **用户管理** 页面
2. 填写用户信息（备注、到期时间）
3. 可选填写自定义 UUID（留空自动生成）
4. 点击 **生成/添加用户**

**方式二：批量导入**
1. 准备多个 UUID（每行一个）
2. 粘贴到"自定义 UUID"框
3. 点击添加

#### 用户操作

- **编辑**：修改用户备注和到期时间
- **禁用/启用**：临时禁用或恢复用户
- **删除**：永久删除用户
- **订阅**：复制用户订阅链接

#### 配置优选域名

**手动添加：**
1. 进入 **优选域名** 页面
2. 在文本框输入域名（格式：`域名:端口#别名`）
3. 点击 **添加**

**自动获取：**
1. 点击 **自动获取 IPv4 优选** 或 **自动获取 IPv6 优选**
2. 系统自动从优选 IP 网站抓取最新数据
3. 每条线路最多保留 5 个 IP
4. 点击 **保存配置**

---

### 用户操作

#### 注册账号（需管理员开启）

1. 访问主域名：
   ```
   https://your-manager-domain.workers.dev
   ```
2. 点击 **注册** 标签页
3. 填写信息：
   - 用户名（3-20字符）
   - 密码（至少6字符）
   - 确认密码
   - 邮箱（可选）
4. 点击 **注册**
5. 注册成功后自动跳转到登录页面

**注意：** 如果提示"注册功能未开放"，请联系管理员在管理后台的仪表盘中开启"开放用户注册"选项

#### 登录

1. 访问主域名
2. 在 **登录** 标签页输入用户名和密码
3. 点击 **登录**

#### 查看订阅信息

登录后可以看到：
- 账号状态（正常/已过期/已禁用）
- UUID
- 到期时间
- 注册和登录时间

#### 复制订阅链接

**通用订阅（原始链接）：**
- 点击"通用订阅"卡片
- 自动复制订阅链接到剪贴板

**客户端专用订阅：**
- 点击对应客户端卡片（Clash/Surge/Shadowrocket/QuantumultX）
- 自动转换为该客户端格式并复制

#### 使用订阅

**Clash：**
1. 复制 Clash 订阅链接
2. 打开 Clash 客户端
3. 配置 > 从 URL 导入
4. 粘贴链接

**Shadowrocket：**
1. 复制 Shadowrocket 订阅链接
2. 打开 Shadowrocket
3. 右上角 + > Subscribe
4. 粘贴链接

**其他客户端类似操作**

---

## 🔒 安全建议

1. **设置强密码**：`ADMIN_PASSWORD` 应使用复杂密码
2. **自定义管理路径**：修改 `ADMIN_PATH` 为不易猜测的路径
3. **谨慎开放注册**：建议关闭公开注册，手动为用户创建账号
4. **定期备份数据**：导出 D1 数据库数据
5. **使用自定义域名**：绑定自己的域名，不使用 workers.dev

---

## 🛠️ 故障排除

### 问题1：管理员面板无法访问

**解决方案：**
- 检查 `ADMIN_PATH` 环境变量是否正确
- 确认 Worker 已成功部署
- 清除浏览器缓存和 Cookie

### 问题2：用户注册提示"注册功能未开放"

**解决方案：**
- 登录管理后台
- 在仪表盘中勾选"开放用户注册"选项
- 自动保存，用户即可注册

### 问题3：订阅链接无法使用

**解决方案：**
- 检查管理员面板中的"节点订阅地址"是否配置正确
- 确认节点端 Worker 已部署并正常运行
- 检查节点端的 `REMOTE_API_URL` 配置是否指向管理端

### 问题4：数据库错误

**解决方案：**
- 确认 D1 数据库绑定正确（变量名必须是 `DB`）
- 检查数据库表结构是否完整初始化
- 在 D1 Console 中执行 `SELECT * FROM users LIMIT 1;` 测试

### 问题5：优选 IP 自动更新不工作

**解决方案：**
- 确认已配置 Cron Trigger（`*/15 * * * *`）
- 查看 Worker 日志检查是否有错误
- 注意：网页部署不支持定时任务，仅支持手动触发

---

## 📚 API 文档

### 节点端 API

#### GET /api/users
获取所有有效用户列表

**响应示例：**
```json
{
  "users": {
    "uuid1": "用户1",
    "uuid2": "用户2"
  },
  "settings": {
    "proxyIPs": ["1.2.3.4:443"],
    "bestDomains": ["example.com:443"],
    "subUrl": "https://node.example.com"
  }
}
```

### 用户认证 API

#### POST /api/user/register
用户注册

**请求参数：**
- `username`: 用户名（3-20字符）
- `password`: 密码（至少6字符）
- `email`: 邮箱（可选）

#### POST /api/user/login
用户登录

**请求参数：**
- `username`: 用户名
- `password`: 密码

#### POST /api/user/logout
用户登出

#### POST /api/user/info
获取当前用户信息（需登录）

---

## 📝 更新日志

### v2.0.0 (2025-11-23)
- ✨ 新增用户前端系统
- ✨ 支持用户注册和登录
- ✨ 用户可查看自己的订阅信息
- ✨ 支持自定义管理员面板路径
- ✨ 新增数据库表结构（user_accounts, user_sessions）
- ⚡ 优化代码结构和性能
- 📚 完善文档说明

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

## 💡 常见问题 FAQ

**Q: 用户注册后默认有效期是多久？**
A: 默认 1 年有效期，管理员可在后台修改。

**Q: 可以同时使用多个节点端吗？**
A: 可以，部署多个 Node-Worker 并配置相同的 `REMOTE_API_URL` 即可。

**Q: 如何修改用户密码？**
A: 目前需要管理员手动操作数据库，后续版本会添加用户修改密码功能。

**Q: 数据库如何备份？**
A: 使用 Wrangler CLI：`wrangler d1 export vless_db --output=backup.sql`

**Q: 可以迁移到其他平台吗？**
A: 代码依赖 Cloudflare Workers 和 D1，迁移需要适配其他平台的数据库和运行时。

---

**祝您使用愉快！如有问题，欢迎反馈。** 🎉
