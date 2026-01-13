/**
 * 用户前端视图 - Shadcn UI 风格
 */

const db = require('../database');

// 北京时间格式化
function formatBeijingDateTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    const beijingTime = new Date(d.getTime() + (8 * 60 * 60 * 1000));
    const year = beijingTime.getUTCFullYear();
    const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getUTCDate()).padStart(2, '0');
    const hour = String(beijingTime.getUTCHours()).padStart(2, '0');
    const minute = String(beijingTime.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

function formatBeijingDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    const beijingTime = new Date(d.getTime() + (8 * 60 * 60 * 1000));
    const year = beijingTime.getUTCFullYear();
    const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 渲染登录/注册页面
async function renderAuthPage() {
    const settings = db.getSettings() || {};
    const siteName = settings.siteName || 'CloudDash';
    const enableRegister = settings.enableRegister === true;
    const requireInviteCode = settings.requireInviteCode === true;
    
    return `<!DOCTYPE html>
<html class="light" lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${siteName} - 登录</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<script>
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#09090b",
        "background-light": "#ffffff",
        "background-dark": "#09090b",
        border: { light: "#e4e4e7", dark: "#27272a" }
      },
      fontFamily: {
        display: ["Inter", "Noto Sans SC", "sans-serif"],
        sans: ["Inter", "Noto Sans SC", "sans-serif"],
      },
      borderRadius: { DEFAULT: "0.5rem", lg: "0.75rem" }
    }
  }
};
</script>
<style>
body { font-family: 'Inter', 'Noto Sans SC', sans-serif; -webkit-font-smoothing: antialiased; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
</style>
</head>
<body class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 min-h-screen flex items-center justify-center p-4">
<div class="w-full max-w-md">
<div class="text-center mb-8">
<div class="inline-flex items-center gap-2 mb-4">
<div class="w-10 h-10 bg-primary rounded flex items-center justify-center">
<span class="text-white material-symbols-outlined text-lg">bolt</span>
</div>
<span class="font-bold text-2xl tracking-tight">${siteName}</span>
</div>
<p class="text-slate-600 dark:text-zinc-400">欢迎回来</p>
</div>

<div class="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
<div class="flex border-b border-slate-200 dark:border-zinc-800">
<button onclick="switchTab('login')" id="loginTab" class="flex-1 px-4 py-3 text-sm font-medium transition-colors bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100">登录</button>
<button onclick="switchTab('register')" id="registerTab" class="flex-1 px-4 py-3 text-sm font-medium transition-colors text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-slate-100">注册</button>
</div>

<div id="loginForm" class="p-6 space-y-4">
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">用户名</label>
<input id="loginUsername" type="text" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="请输入用户名"/>
</div>
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">密码</label>
<input id="loginPassword" type="password" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="请输入密码"/>
</div>
<button onclick="handleLogin()" class="w-full bg-primary text-white py-2 rounded-md hover:opacity-90 transition-opacity font-medium">登录</button>
<div id="loginError" class="hidden text-sm text-red-600"></div>
</div>

<div id="registerForm" class="p-6 space-y-4 hidden">
${!enableRegister ? '<div class="text-center text-slate-500 py-4">注册功能暂未开放</div>' : `
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">用户名</label>
<input id="registerUsername" type="text" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="3-20个字符"/>
</div>
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">密码</label>
<input id="registerPassword" type="password" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="至少6个字符"/>
</div>
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">邮箱 <span class="text-slate-400">(可选)</span></label>
<input id="registerEmail" type="email" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="用于找回密码"/>
</div>
${requireInviteCode ? `<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">邀请码</label>
<input id="registerInviteCode" type="text" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="请输入邀请码"/>
</div>` : ''}
<button onclick="handleRegister()" class="w-full bg-primary text-white py-2 rounded-md hover:opacity-90 transition-opacity font-medium">注册</button>
<div id="registerError" class="hidden text-sm text-red-600"></div>
`}
</div>
</div>
</div>

<div class="fixed bottom-6 right-6">
<button onclick="document.documentElement.classList.toggle('dark')" class="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">
<span class="material-symbols-outlined dark:hidden">dark_mode</span>
<span class="material-symbols-outlined hidden dark:block">light_mode</span>
</button>
</div>

<script>
function switchTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  document.getElementById('loginTab').classList.toggle('bg-white', tab === 'login');
  document.getElementById('loginTab').classList.toggle('dark:bg-zinc-950', tab === 'login');
  document.getElementById('loginTab').classList.toggle('text-slate-900', tab === 'login');
  document.getElementById('loginTab').classList.toggle('dark:text-slate-100', tab === 'login');
  document.getElementById('loginTab').classList.toggle('text-slate-500', tab !== 'login');
  document.getElementById('loginTab').classList.toggle('dark:text-zinc-500', tab !== 'login');
  
  document.getElementById('registerTab').classList.toggle('bg-white', tab === 'register');
  document.getElementById('registerTab').classList.toggle('dark:bg-zinc-950', tab === 'register');
  document.getElementById('registerTab').classList.toggle('text-slate-900', tab === 'register');
  document.getElementById('registerTab').classList.toggle('dark:text-slate-100', tab === 'register');
  document.getElementById('registerTab').classList.toggle('text-slate-500', tab !== 'register');
  document.getElementById('registerTab').classList.toggle('dark:text-zinc-500', tab !== 'register');
}

async function handleLogin() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  if(!username || !password) {
    errorEl.textContent = '请填写完整信息';
    errorEl.classList.remove('hidden');
    return;
  }
  
  try {
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    
    if(res.ok && data.success) {
      window.location.href = '/user';
    } else {
      errorEl.textContent = data.error || '登录失败';
      errorEl.classList.remove('hidden');
    }
  } catch(e) {
    errorEl.textContent = '网络错误';
    errorEl.classList.remove('hidden');
  }
}

async function handleRegister() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const email = document.getElementById('registerEmail')?.value || '';
  const invite_code = document.getElementById('registerInviteCode')?.value || '';
  const errorEl = document.getElementById('registerError');
  
  if(!username || !password) {
    errorEl.textContent = '请填写完整信息';
    errorEl.classList.remove('hidden');
    return;
  }
  
  try {
    const res = await fetch('/api/user/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password, email, invite_code})
    });
    const data = await res.json();
    
    if(res.ok && data.success) {
      alert('注册成功！');
      switchTab('login');
    } else {
      errorEl.textContent = data.error || '注册失败';
      errorEl.classList.remove('hidden');
    }
  } catch(e) {
    errorEl.textContent = '网络错误';
    errorEl.classList.remove('hidden');
  }
}
</script>
</body>
</html>`;
}

// 渲染用户面板
async function renderUserPanel(user) {
    const settings = db.getSettings() || {};
    const siteName = settings.siteName || 'CloudDash';
    const uuidUser = db.getUserByUUID(user.uuid);
    
    // 处理订阅URL：如果有多个用逗号分隔的URL，随机选择一个
    let subscribeUrl = settings.subUrl || `http://localhost:${process.env.PORT || 3000}`;
    if (subscribeUrl.includes(',')) {
        const urls = subscribeUrl.split(',').map(u => u.trim()).filter(u => u);
        subscribeUrl = urls[Math.floor(Math.random() * urls.length)];
    }
    // 确保URL有协议前缀
    if (subscribeUrl && !subscribeUrl.startsWith('http://') && !subscribeUrl.startsWith('https://')) {
        subscribeUrl = 'https://' + subscribeUrl;
    }
    
    // 判断用户状态：检查enabled和expiry
    const isEnabled = uuidUser && uuidUser.enabled === 1;
    const isExpired = uuidUser && uuidUser.expiry && uuidUser.expiry < Date.now();
    const statusText = !isEnabled ? '已禁用' : (isExpired ? '已过期' : '正常');
    const statusColor = !isEnabled ? 'red' : (isExpired ? 'amber' : 'emerald');
    
    const regTime = formatBeijingDate(user.createdAt);
    const expTime = formatBeijingDateTime(uuidUser?.expiry || 0);
    
    // 检查今天是否已签到
    const now = new Date();
    const beijingNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const todayStart = new Date(beijingNow.getUTCFullYear(), beijingNow.getUTCMonth(), beijingNow.getUTCDate());
    todayStart.setTime(todayStart.getTime() - 8 * 60 * 60 * 1000);
    const hasCheckedIn = user.last_checkin && user.last_checkin >= todayStart.getTime();
    
    // 快捷链接配置
    const quickLinks = [];
    if (settings.customLink1Name && settings.customLink1Url) {
        quickLinks.push({ name: settings.customLink1Name, url: settings.customLink1Url });
    }
    if (settings.customLink2Name && settings.customLink2Url) {
        quickLinks.push({ name: settings.customLink2Name, url: settings.customLink2Url });
    }
    
    // 订阅链接 - subUrl 已经是完整的 Worker 地址，直接在路径中包含 UUID
    const subUrl = subscribeUrl || 'https://your-worker.workers.dev';
    const baseUrl = `${subUrl}/${user.uuid}`;
    const clashUrl = `${baseUrl}?type=clash`;
    const singboxUrl = `${baseUrl}?type=singbox`;
    const surgeUrl = `${baseUrl}?type=surge`;
    const shadowrocketUrl = `${baseUrl}`;
    const quantumultUrl = `${baseUrl}?type=quanx`;
    
    return `<!DOCTYPE html>
<html class="light" lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>用户中心 - ${siteName}</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<script>
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#09090b",
        "background-light": "#ffffff",
        "background-dark": "#09090b",
        border: { light: "#e4e4e7", dark: "#27272a" }
      },
      fontFamily: {
        display: ["Inter", "Noto Sans SC", "sans-serif"],
        sans: ["Inter", "Noto Sans SC", "sans-serif"],
      },
      borderRadius: { DEFAULT: "0.5rem", lg: "0.75rem" }
    }
  }
};
</script>
<style>
body { font-family: 'Inter', 'Noto Sans SC', sans-serif; -webkit-font-smoothing: antialiased; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
</style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<div class="flex min-h-screen">
<aside class="w-64 border-r border-slate-200 dark:border-zinc-800 hidden md:flex flex-col bg-white dark:bg-black h-screen sticky top-0">
<div class="p-6 flex-shrink-0">
<div class="flex items-center gap-2 mb-8">
<div class="w-8 h-8 bg-primary rounded flex items-center justify-center">
<span class="text-white material-symbols-outlined text-sm">bolt</span>
</div>
<span class="font-bold text-lg tracking-tight">${siteName}</span>
</div>
<nav class="space-y-1">
<a onclick="switchPage('account')" class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors" id="nav-account">
<span class="material-symbols-outlined text-[20px]">account_circle</span>
账号信息
</a>
<a onclick="switchPage('orders')" class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors" id="nav-orders">
<span class="material-symbols-outlined text-[20px]">shopping_bag</span>
我的订单
</a>
<a onclick="switchPage('plans')" class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors" id="nav-plans">
<span class="material-symbols-outlined text-[20px]">package_2</span>
套餐购买
</a>
</nav>
</div>
<div class="mt-auto p-6 border-t border-slate-200 dark:border-zinc-800 flex-shrink-0">
<button onclick="handleLogout()" class="flex items-center gap-3 px-3 py-2 w-full rounded-md text-slate-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors text-sm font-medium">
<span class="material-symbols-outlined text-[20px]">logout</span>
退出登录
</button>
</div>
</aside>

<main class="flex-1 overflow-y-auto custom-scrollbar">
<header class="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400">dashboard</span>
<h1 class="text-sm font-semibold uppercase tracking-wider text-slate-500" id="pageTitle">Dashboard / Account</h1>
</div>
<div class="flex items-center gap-3">
${quickLinks.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-sm border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">open_in_new</span>
${link.name}
</a>`).join('')}
<button onclick="showAnnouncements()" class="text-sm bg-primary text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">campaign</span>
查看公告
</button>
</div>
</header>

<div class="p-8 max-w-6xl mx-auto space-y-8">
<!-- 账号信息页面 -->
<div id="page-account">
<section>
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-[20px]">info</span>
<h2 class="text-lg font-semibold tracking-tight">基本信息</h2>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div class="p-5 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
<p class="text-xs text-slate-500 dark:text-zinc-500 uppercase font-medium mb-1">用户名</p>
<p class="text-xl font-bold">${user.username}</p>
</div>
<div class="p-5 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 flex flex-col justify-between">
<p class="text-xs text-slate-500 dark:text-zinc-500 uppercase font-medium mb-1">账号状态</p>
<div>
<span class="inline-flex items-center px-2 py-0.5 rounded border border-${statusColor}-200 dark:border-${statusColor}-900/50 bg-${statusColor}-50 dark:bg-${statusColor}-950/20 text-${statusColor}-700 dark:text-${statusColor}-400 text-xs font-medium">
<span class="w-1 h-1 rounded-full bg-${statusColor}-500 mr-1.5"></span>
${statusText}
</span>
</div>
</div>
<div class="p-5 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
<p class="text-xs text-slate-500 dark:text-zinc-500 uppercase font-medium mb-1">注册时间</p>
<p class="text-base font-medium">${regTime}</p>
</div>
<div class="p-5 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
<p class="text-xs text-slate-500 dark:text-zinc-500 uppercase font-medium mb-1">订阅到期时间</p>
<p class="text-base font-medium">${expTime}</p>
</div>
</div>
</section>

<section>
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-[20px]">link</span>
<h2 class="text-lg font-semibold tracking-tight">订阅链接</h2>
</div>
<div class="p-6 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
<div class="flex flex-wrap gap-3">
<button onclick="copyLink('original', '通用订阅')" class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
<span class="material-symbols-outlined text-[18px]">language</span>
通用订阅
</button>
<button onclick="copyLink('clash', 'Clash')" class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
<span class="material-symbols-outlined text-[18px]">bolt</span>
Clash
</button>
<button onclick="copyLink('sing-box', 'SingBox')" class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
<span class="material-symbols-outlined text-[18px]">inventory_2</span>
SingBox
</button>
<button onclick="copyLink('surge', 'Surge')" class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
<span class="material-symbols-outlined text-[18px]">waves</span>
Surge
</button>
<button onclick="copyLink('shadowrocket', 'Shadowrocket')" class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
<span class="material-symbols-outlined text-[18px]">rocket_launch</span>
Shadowrocket
</button>
<button onclick="copyLink('quantumult', 'Quantumult X')" class="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
<span class="material-symbols-outlined text-[18px]">psychology</span>
Quantumult X
</button>
</div>
</div>
</section>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="p-6 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 flex flex-col justify-between">
<div>
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-[20px]">calendar_today</span>
<h3 class="font-semibold">每日签到</h3>
</div>
<p class="text-sm text-slate-500 dark:text-zinc-500 mb-6">每日签到可获得1天使用时长奖励，系统将在每天 0:00 重置。</p>
</div>
<button onclick="handleCheckin()" ${hasCheckedIn ? 'disabled' : ''} class="w-full bg-primary text-white py-2 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
<span class="material-symbols-outlined text-[20px]">how_to_reg</span>
${hasCheckedIn ? '今日已签到' : '立即签到'}
</button>
</div>

<div class="p-6 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 flex flex-col justify-between">
<div>
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-[20px]">sync</span>
<h3 class="font-semibold">重置订阅地址</h3>
</div>
<p class="text-sm text-slate-500 dark:text-zinc-500 mb-6">如果您的链接泄露或无法连接，请重置。重置后旧链接将立即失效。</p>
</div>
<button onclick="handleResetUUID()" class="w-full border border-slate-200 dark:border-zinc-800 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 font-medium">
<span class="material-symbols-outlined text-[20px]">refresh</span>
重置订阅地址
</button>
</div>
</div>

<section class="max-w-2xl">
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-[20px]">lock</span>
<h2 class="text-lg font-semibold tracking-tight">修改密码</h2>
</div>
<div class="p-6 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 space-y-6">
<div class="space-y-4">
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">旧密码</label>
<input id="oldPassword" type="password" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="请输入旧密码"/>
</div>
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">新密码</label>
<input id="newPassword" type="password" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="请输入新密码"/>
</div>
<div class="space-y-2">
<label class="text-sm font-medium text-slate-700 dark:text-zinc-300">确认新密码</label>
<input id="confirmPassword" type="password" class="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600" placeholder="请再次输入新密码"/>
</div>
</div>
<button onclick="handleChangePassword()" class="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 font-medium">
<span class="material-symbols-outlined text-[20px]">save</span>
保存修改
</button>
</div>
</section>
</div>

<!-- 我的订单页面 -->
<div id="page-orders" class="hidden">
<section>
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-[20px]">shopping_bag</span>
<h2 class="text-lg font-semibold tracking-tight">我的订单</h2>
</div>
<div id="ordersList" class="space-y-4">
<div class="text-center text-slate-500 py-8">加载中...</div>
</div>
</section>
</div>

<!-- 套餐购买页面 -->
<div id="page-plans" class="hidden">
<section>
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-[20px]">package_2</span>
<h2 class="text-lg font-semibold tracking-tight">套餐购买</h2>
</div>
<div id="plansList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<div class="text-center text-slate-500 py-8">加载中...</div>
</div>
</section>
</div>

<footer class="pt-12 pb-8 text-center border-t border-slate-100 dark:border-zinc-900">
<p class="text-xs text-slate-400 dark:text-zinc-600">© 2024 ${siteName}. All rights reserved.</p>
</footer>
</div>
</main>
</div>

<div class="fixed bottom-6 right-6 z-50">
<button onclick="document.documentElement.classList.toggle('dark')" class="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">
<span class="material-symbols-outlined dark:hidden">dark_mode</span>
<span class="material-symbols-outlined hidden dark:block">light_mode</span>
</button>
</div>

<div id="toast" class="fixed top-4 right-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-lg px-4 py-3 hidden z-50 max-w-sm">
<p class="text-sm"></p>
</div>

<div id="modal" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4">
<div class="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
<div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
<h3 class="text-lg font-semibold" id="modalTitle"></h3>
<button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<div class="p-6 overflow-y-auto flex-1" id="modalContent"></div>
</div>
</div>

<script>
let currentPage = 'account';
const navItems = ['account', 'orders', 'plans'];

function switchPage(page) {
  currentPage = page;
  window.location.hash = page;
  navItems.forEach(p => {
    const pageEl = document.getElementById('page-' + p);
    const navEl = document.getElementById('nav-' + p);
    if(p === page) {
      pageEl.classList.remove('hidden');
      navEl.classList.add('bg-slate-100', 'dark:bg-zinc-800', 'text-sm', 'font-medium');
      navEl.classList.remove('text-slate-500', 'dark:text-zinc-400', 'hover:bg-slate-50', 'dark:hover:bg-zinc-900');
    } else {
      pageEl.classList.add('hidden');
      navEl.classList.remove('bg-slate-100', 'dark:bg-zinc-800');
      navEl.classList.add('text-slate-500', 'dark:text-zinc-400', 'hover:bg-slate-50', 'dark:hover:bg-zinc-900');
    }
  });
  
  const titles = {
    account: 'Dashboard / Account',
    orders: 'Dashboard / Orders',
    plans: 'Dashboard / Plans'
  };
  document.getElementById('pageTitle').textContent = titles[page];
  
  if(page === 'orders') loadOrders();
  if(page === 'plans') loadPlans();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.querySelector('p').textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function openModal(title, content) {
  const modalTitle = document.getElementById('modalTitle');
  const modalHeader = modalTitle.closest('.flex.items-center.justify-between');
  
  if (title) {
    modalTitle.textContent = title;
    modalHeader.classList.remove('hidden');
  } else {
    modalHeader.classList.add('hidden');
  }
  
  document.getElementById('modalContent').innerHTML = content;
  const modalContent = document.getElementById('modalContent');
  
  // 如果没有标题，移除内容区的 padding
  if (!title) {
    modalContent.classList.remove('p-6');
    modalContent.classList.add('p-0');
  } else {
    modalContent.classList.remove('p-0');
    modalContent.classList.add('p-6');
  }
  
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  
  // 重置样式
  const modalTitle = document.getElementById('modalTitle');
  const modalHeader = modalTitle.closest('.flex.items-center.justify-between');
  const modalContent = document.getElementById('modalContent');
  
  modalHeader.classList.remove('hidden');
  modalContent.classList.remove('p-0');
  modalContent.classList.add('p-6');
}

async function copyLink(client, type) {
  try {
    // 获取用户UUID和订阅地址
    const uuid = '${user.uuid}';
    const subUrl = '${subUrl}';
    const originalUrl = subUrl + '/' + uuid;
    
    // 订阅转换配置
    const apiBaseUrl = 'https://url.v1.mk/sub';
    let finalUrl;
    
    // 根据客户端类型生成订阅链接
    if (client === 'original') {
      // 通用订阅：直接使用原始 URL
      finalUrl = originalUrl;
    } else {
      // 其他客户端：使用订阅转换
      const targetMap = {
        'clash': 'clash',
        'surge': 'surge',
        'shadowrocket': 'shadowrocket',
        'quantumult': 'quanx',
        'sing-box': 'singbox',
        'v2ray': 'v2ray'
      };
      
      finalUrl = apiBaseUrl + '?target=' + targetMap[client] + '&url=' + encodeURIComponent(originalUrl);
    }
    
    await navigator.clipboard.writeText(finalUrl);
    showToast('✅ ' + type + ' 链接已复制');
  } catch(e) {
    showToast('❌ 复制失败');
  }
}

async function handleCheckin() {
  try {
    const res = await fetch('/api/user/checkin', { method: 'POST' });
    const data = await res.json();
    if(res.ok && data.success) {
      showToast('✅ ' + data.message);
      setTimeout(() => location.reload(), 1500);
    } else {
      showToast('❌ ' + (data.error || '签到失败'));
    }
  } catch(e) {
    showToast('❌ 网络错误');
  }
}

function showConfirm(title, message, onConfirm) {
  const content = \`
    <div class="space-y-4">
      <p class="text-slate-600 dark:text-zinc-400">\${message}</p>
      <div class="flex gap-3 justify-end">
        <button onclick="closeModal()" class="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors text-sm font-medium">取消</button>
        <button onclick="confirmAction()" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">确定</button>
      </div>
    </div>
  \`;
  openModal(title, content);
  window.confirmAction = () => {
    closeModal();
    onConfirm();
  };
}

async function handleResetUUID() {
  showConfirm('重置订阅地址', '确定要重置订阅地址吗？重置后旧链接将立即失效！', async () => {
    try {
      const res = await fetch('/api/user/reset-uuid', { method: 'POST' });
      const data = await res.json();
      if(res.ok && data.success) {
        showToast('✅ ' + data.message);
        setTimeout(() => location.reload(), 1500);
      } else {
        showToast('❌ ' + (data.error || '重置失败'));
      }
    } catch(e) {
      showToast('❌ 网络错误');
    }
  });
}

async function handleChangePassword() {
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if(!oldPassword || !newPassword || !confirmPassword) {
    showToast('❌ 请填写完整信息');
    return;
  }
  
  if(newPassword !== confirmPassword) {
    showToast('❌ 两次密码输入不一致');
    return;
  }
  
  if(newPassword.length < 6) {
    showToast('❌ 新密码长度至少6位');
    return;
  }
  
  try {
    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({oldPassword, newPassword})
    });
    const data = await res.json();
    
    if(res.ok && data.success) {
      showToast('✅ ' + data.message);
      setTimeout(() => window.location.href = '/user/auth', 1500);
    } else {
      showToast('❌ ' + (data.error || '修改失败'));
    }
  } catch(e) {
    showToast('❌ 网络错误');
  }
}

async function handleLogout() {
  showConfirm('退出登录', '确定要退出登录吗？', async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' });
      window.location.href = '/user/auth';
    } catch(e) {
      showToast('❌ 退出失败');
    }
  });
}

async function loadOrders() {
  try {
    const res = await fetch('/api/user/orders');
    const data = await res.json();
    
    if(res.ok && data.success) {
      const orders = data.orders || [];
      const container = document.getElementById('ordersList');
      
      if(orders.length === 0) {
        container.innerHTML = '<div class="text-center text-slate-500 py-8">暂无订单</div>';
        return;
      }
      
      const statusMap = {
        pending: { text: '待审核', color: 'amber' },
        payment: { text: '待支付', color: 'blue' },
        approved: { text: '已完成', color: 'emerald' },
        rejected: { text: '已拒绝', color: 'red' },
        expired: { text: '已过期', color: 'slate' }
      };
      
      container.innerHTML = orders.map(order => {
        // 计算订单是否超时（待审核订单15分钟过期，待支付订单10分钟过期）
        let isOrderExpired = false;
        let expiryText = '';
        if (order.status === 'pending' || order.status === 'payment') {
          const expiryMinutes = order.status === 'pending' ? 15 : 10;
          const expiryTime = order.created_at + (expiryMinutes * 60 * 1000);
          const now = Date.now();
          if (now < expiryTime) {
            const remainingMinutes = Math.ceil((expiryTime - now) / 60000);
            expiryText = \`<p class="text-xs text-amber-600 dark:text-amber-500 mt-1">\${remainingMinutes}分钟后订单过期</p>\`;
          } else {
            isOrderExpired = true;
          }
        }
        
        // 如果订单超时，显示已过期状态；否则显示原始状态
        const status = isOrderExpired ? statusMap['expired'] : (statusMap[order.status] || { text: order.status, color: 'slate' });
        
        // 格式化创建时间为 "2026/1/13 15:30"
        const createDate = new Date(order.created_at);
        const createTime = \`\${createDate.getFullYear()}/\${createDate.getMonth()+1}/\${createDate.getDate()} \${String(createDate.getHours()).padStart(2,'0')}:\${String(createDate.getMinutes()).padStart(2,'0')}\`;
        
        // 计算到期时间（如果有到期时间）
        let expireTimeStr = '';
        if (order.status === 'approved' && order.processed_at) {
          const expireDate = new Date(order.processed_at + order.duration_days * 24 * 60 * 60 * 1000);
          expireTimeStr = \`\${expireDate.getFullYear()}/\${expireDate.getMonth()+1}/\${expireDate.getDate()} \${String(expireDate.getHours()).padStart(2,'0')}:\${String(expireDate.getMinutes()).padStart(2,'0')}\`;
        }
        
        return \`
<div class="p-5 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
<div class="flex justify-between items-start mb-3">
<div>
<p class="font-semibold">\${order.plan_name}</p>
<p class="text-sm text-slate-500 mt-1">订单号: \${order.id}</p>
\${expiryText}
</div>
<span class="inline-flex items-center px-2 py-0.5 rounded border border-\${status.color}-200 dark:border-\${status.color}-900/50 bg-\${status.color}-50 dark:bg-\${status.color}-950/20 text-\${status.color}-700 dark:text-\${status.color}-400 text-xs font-medium">
\${status.text}
</span>
</div>
<div class="grid \${expireTimeStr ? 'grid-cols-2' : 'grid-cols-3'} gap-2 text-sm">
<div><span class="text-slate-500">金额:</span> <span class="font-medium">¥\${order.amount || 0}</span></div>
<div><span class="text-slate-500">时长:</span> <span class="font-medium">\${order.duration_days}天</span></div>
<div><span class="text-slate-500">创建:</span> <span class="font-medium">\${createTime}</span></div>
\${expireTimeStr ? \`<div><span class="text-slate-500">到期:</span> <span class="font-medium">\${expireTimeStr}</span></div>\` : ''}
</div>
\${!isOrderExpired && (order.status === 'pending' || order.status === 'payment') ? \`
<div class="mt-3 flex gap-2">
\${order.status === 'payment' && order.amount > 0 ? \`<button onclick="handlePay(\${order.id})" class="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm font-medium">立即支付</button>\` : ''}
<button onclick="handleCancelOrder(\${order.id})" class="flex-1 border border-slate-200 dark:border-zinc-800 px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors text-sm font-medium">取消订单</button>
</div>
\` : ''}
</div>
        \`;
      }).join('');
    }
  } catch(e) {
    showToast('❌ 加载订单失败');
  }
}

async function loadPlans() {
  try {
    const res = await fetch('/api/plans');
    const data = await res.json();
    
    if(res.ok && data.success) {
      const plans = data.plans || [];
      const container = document.getElementById('plansList');
      
      if(plans.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-slate-500 py-8">暂无套餐</div>';
        return;
      }
      
      container.innerHTML = plans.map(plan => \`
<div class="p-6 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 flex flex-col">
<h3 class="text-xl font-bold mb-2">\${plan.name}</h3>
<p class="text-3xl font-bold text-primary mb-4">¥\${plan.price}<span class="text-sm font-normal text-slate-500">/\${plan.duration_days}天</span></p>
<p class="text-sm text-slate-500 mb-6">\${plan.description || '无描述'}</p>
<button onclick="handleBuyPlan(\${plan.id})" class="mt-auto w-full bg-primary text-white py-2 rounded-md hover:opacity-90 transition-opacity font-medium">立即购买</button>
</div>
      \`).join('');
    }
  } catch(e) {
    showToast('❌ 加载套餐失败');
  }
}

async function handleBuyPlan(planId) {
  try {
    showToast('⏳ 正在创建订单...');
    
    const res = await fetch('/api/user/orders/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({plan_id: planId})
    });
    const data = await res.json();
    
    if(res.ok && data.success) {
      if(data.needPayment) {
        // 付费套餐：直接打开支付方式选择
        showToast('✅ 订单创建成功');
        await handlePay(data.orderId);
      } else if(data.needApproval) {
        // 免费套餐需要审核
        showToast('✅ ' + data.message);
        setTimeout(() => switchPage('orders'), 1500);
      } else if(data.autoApproved) {
        // 免费套餐自动通过
        showToast('✅ ' + data.message);
        setTimeout(() => location.reload(), 1500);
      } else {
        showToast('✅ ' + data.message);
      }
    } else {
      showToast('❌ ' + (data.error || '购买失败'));
    }
  } catch(e) {
    showToast('❌ 网络错误');
  }
}

async function handleCancelOrder(orderId) {
  showConfirm('取消订单', '确定要取消此订单吗？', async () => {
    try {
      const res = await fetch('/api/user/orders/cancel', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({order_id: orderId})
      });
      const data = await res.json();
      
      if(res.ok && data.success) {
        showToast('✅ ' + data.message);
        loadOrders();
      } else {
        showToast('❌ ' + (data.error || '取消失败'));
      }
    } catch(e) {
      showToast('❌ 网络错误');
    }
  });
}

async function handlePay(orderId) {
  try {
    // 获取订单信息
    const ordersRes = await fetch('/api/user/orders');
    const ordersData = await ordersRes.json();
    const order = ordersData.orders?.find(o => o.id === orderId);
    
    if (!order) {
      showToast('❌ 订单不存在');
      return;
    }
    
    // 获取支付通道
    const channelsRes = await fetch('/api/payment/channels');
    const channelsData = await channelsRes.json();
    const channels = channelsData.channels || [];
    
    if (channels.length === 0) {
      showToast('❌ 暂无可用支付渠道');
      return;
    }
    
    // 构建支付方式选项
    const paymentOptions = \`
      <style>
        input[type="radio"]:checked + label .radio-dot {
          background-color: #09090b;
          border-color: #09090b;
        }
        .dark input[type="radio"]:checked + label .radio-dot {
          background-color: #fafafa;
          border-color: #fafafa;
        }
      </style>
      <div class="px-6 pt-6 pb-4">
        <h2 class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">选择支付方式</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">请选择您偏好的支付渠道以完成订阅</p>
      </div>
      <div class="px-6 py-4">
        <div class="space-y-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex justify-between items-center">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">订阅套餐</span>
            <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50">\${order.plan_name}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">应付金额</span>
            <span class="text-sm font-bold text-zinc-900 dark:text-zinc-50">¥ \${order.amount}</span>
          </div>
        </div>
        <div class="mt-6">
          <label class="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 block">支付渠道</label>
          <div class="space-y-2" id="paymentMethodsList">
            \${channels.map((channel, index) => \`
              <div class="relative">
                <input \${index === 0 ? 'checked' : ''} class="peer hidden" id="channel_\${channel.id}" name="payment_method" type="radio" value="\${channel.id}" data-code="\${channel.code}"/>
                <label class="flex items-center justify-between px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all peer-checked:border-zinc-900 dark:peer-checked:border-zinc-100 peer-checked:ring-1 peer-checked:ring-zinc-900 dark:peer-checked:ring-zinc-100" for="channel_\${channel.id}">
                  <div class="flex items-center gap-3">
                    <div class="radio-dot w-2 h-2 rounded-full border border-zinc-300 dark:border-zinc-700 transition-all"></div>
                    <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50">\${channel.name}</span>
                  </div>
                </label>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>
      <div class="px-6 py-6 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-3">
        <button onclick="confirmPayment(\${orderId})" class="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all">
          确认支付
        </button>
        <button onclick="closeModal()" class="w-full py-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          取消
        </button>
      </div>
    \`;
    
    openModal('', paymentOptions);
  } catch (e) {
    showToast('❌ 加载支付方式失败');
  }
}

async function confirmPayment(orderId) {
  const selectedChannel = document.querySelector('input[name="payment_method"]:checked');
  if (!selectedChannel) {
    showToast('❌ 请选择支付方式');
    return;
  }
  
  const channelId = parseInt(selectedChannel.value);
  const tradeType = selectedChannel.getAttribute('data-code') || 'usdt.trc20';
  closeModal();
  
  try {
    showToast('⏳ 正在创建支付订单...');
    
    const res = await fetch('/api/user/orders/pay', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        order_id: orderId,
        channel_id: channelId,
        trade_type: tradeType
      })
    });
    
    const data = await res.json();
    
    if(res.ok && data.success) {
      if(data.data && data.data.payment_url) {
        window.open(data.data.payment_url, '_blank');
        showToast('✅ 已打开支付页面，请完成支付');
      } else {
        showToast('✅ 支付订单创建成功');
      }
      loadOrders();
    } else {
      showToast('❌ ' + (data.error || '支付失败'));
    }
  } catch(e) {
    console.error('支付错误:', e);
    showToast('❌ 网络错误');
  }
}

async function selectPayment(orderId, paymentType) {
  closeModal();
  try {
    const res = await fetch('/api/user/orders/pay', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({order_id: orderId, payment_type: paymentType})
    });
    const data = await res.json();
    
    if(res.ok && data.success) {
      if(data.payment_url) {
        window.open(data.payment_url, '_blank');
        showToast('✅ 已打开支付页面');
      } else {
        showToast('✅ ' + data.message);
      }
      loadOrders();
    } else {
      showToast('❌ ' + (data.error || '支付失败'));
    }
  } catch(e) {
    showToast('❌ 网络错误');
  }
}

async function showAnnouncements() {
  try {
    const res = await fetch('/api/announcement');
    const data = await res.json();
    
    if(res.ok && data.success) {
      const announcements = data.announcements || [];
      if(announcements.length === 0) {
        openModal('系统公告', '<p class="text-slate-500 text-center py-4">暂无公告</p>');
        return;
      }
      
      const content = announcements.map(ann => \`
<div class="mb-6 last:mb-0">
<h4 class="font-semibold mb-2">\${ann.title}</h4>
<p class="text-sm text-slate-600 dark:text-zinc-400 whitespace-pre-wrap">\${ann.content}</p>
<p class="text-xs text-slate-400 mt-2">\${new Date(ann.created_at).toLocaleString()}</p>
</div>
      \`).join('<hr class="my-4 border-slate-200 dark:border-zinc-800"/>');
      
      openModal('系统公告', content);
    }
  } catch(e) {
    showToast('❌ 加载公告失败');
  }
}

// 初始化
const initialPage = window.location.hash.slice(1) || 'account';
if(navItems.includes(initialPage)) {
  switchPage(initialPage);
} else {
  switchPage('account');
}
</script>
</body>
</html>`;
}

module.exports = {
    renderAuthPage,
    renderUserPanel
};
