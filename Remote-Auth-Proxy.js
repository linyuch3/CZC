import {
    connect
} from 'cloudflare:sockets';

// -----------------------------------------------------------------------------
// 配置区域
// -----------------------------------------------------------------------------
// 你的管理端 Worker 地址 (无需 /api/users 后缀，脚本会自动拼接)
const REMOTE_API_URL = 'https://uuid.hailizi.workers.dev/api/users';

// API 密钥 (为了代码完整性建议保留)
const API_TOKEN = 'uuid'; 

// -----------------------------------------------------------------------------
// 兜底配置 (当获取不到管理端配置时使用)
// -----------------------------------------------------------------------------
const FALLBACK_PROXY_IPS = ['bestproxy.030101.xyz:443']; 
const FALLBACK_BEST_DOMAINS = ['bestcf.030101.xyz:443', 'japan.com:443'];

// -----------------------------------------------------------------------------
// 全局缓存
// -----------------------------------------------------------------------------
let cachedData = {
    users: {},
    settings: {
        proxyIPs: FALLBACK_PROXY_IPS,
        bestDomains: FALLBACK_BEST_DOMAINS
    }
};
let lastFetchTime = 0;

export default {
    async fetch(req) {
        const u = new URL(req.url);
        // 1. 处理 WebSocket 流量 (VLESS 核心)
        if (req.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
            return await handle_ws(req);
        } 
        // 2. 处理 HTTP 请求 (订阅与存活检测)
        else if (req.method === 'GET') {
            if (u.pathname === '/') {
                return new Response("<h1>success</h1>", { status: 200, headers: { 'Content-Type': 'text/html' } });
            }
            
            await syncConfig();
            const users = cachedData.users;
            for (const [uuid, name] of Object.entries(users)) {
                 if (u.pathname.toLowerCase().includes(uuid)) {
                     return await handle_sub(req, uuid, name);
                 }
            }
        }

        return new Response('error', { status: 404 });
    }
};

async function syncConfig(force = false) {
    const now = Date.now();
    if (!force && (now - lastFetchTime < 60000)) return;
    if (force && (now - lastFetchTime < 5000)) return;

    try {
        const resp = await fetch(REMOTE_API_URL, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'User-Agent': 'CF-Proxy-Worker' }
        });
        
        if (resp.ok) {
            const data = await resp.json();
            cachedData.users = data.users || {};
            
            if (data.settings) {
                let newProxyIPs = [];
                if (data.settings.proxyIPs && Array.isArray(data.settings.proxyIPs)) newProxyIPs = data.settings.proxyIPs;
                else if (data.settings.proxyIP) newProxyIPs = [data.settings.proxyIP];
                
                if (newProxyIPs.length > 0) cachedData.settings.proxyIPs = newProxyIPs;
                if (data.settings.bestDomains?.length > 0) cachedData.settings.bestDomains = data.settings.bestDomains;
            }
            lastFetchTime = now;
        }
    } catch (e) {}
}

async function handle_sub(req, currentUUID, currentName) {
    const url = new URL(req.url);
    const workerDomain = url.hostname;
    let links = gen_links(workerDomain, currentUUID, currentName);
    return new Response(btoa(links.join('\n')), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}

function gen_links(workerDomain, uuid, name) {
    let links = [];
    let i = 0;
    const wsPath = encodeURIComponent('/?ed=2048');
    const proto = atob("dmxlc3M="); 
    const domains = cachedData.settings.bestDomains;
    
    domains.forEach(item => {
        i += 1;
        const parts = item.split('#');
        const addr = parts[0].trim();
        const alias = parts[1]; 
        
        // 节点名称逻辑修改：
        // 1. 如果有 #别名，直接使用别名
        // 2. 如果没有别名，使用地址但去掉末尾的 :端口号
        let nodeName = "";
        if (alias) {
            nodeName = alias.trim();
        } else {
            // 正则替换：去掉末尾的 :数字
            nodeName = addr.replace(/:\d+$/, '');
        }
        
        const wsParams = new URLSearchParams({
            encryption: 'none', security: 'tls', sni: workerDomain, fp: 'chrome', type: 'ws', host: workerDomain, path: wsPath
        });
        links.push(`${proto}://${uuid}@${addr}?${wsParams.toString()}#${encodeURIComponent(nodeName)}`);
    })
    return links;
}

async function handle_ws(req) {
    await syncConfig();
    const [client, ws] = Object.values(new WebSocketPair());
    ws.accept();

    let remote = null;

    new ReadableStream({
        start(ctrl) {
            ws.addEventListener('message', e => ctrl.enqueue(e.data));
            ws.addEventListener('close', () => { remote?.close(); ctrl.close(); });
            ws.addEventListener('error', () => { remote?.close(); ctrl.error(); });
        }
    }).pipeTo(new WritableStream({
        async write(data) {
            if (remote) {
                const w = remote.writable.getWriter();
                await w.write(data);
                w.releaseLock();
                return;
            }
            
            if (data.byteLength < 17) return;
            
            const uuidBytes = data.slice(1, 17);
            const uuidString = stringifyUUID(new Uint8Array(uuidBytes));
            
            if (!cachedData.users[uuidString]) {
                await syncConfig(true);
            }
            if (!cachedData.users[uuidString]) {
                return; 
            }

            const view = new DataView(data);
            const optLen = view.getUint8(17);
            const cmd = view.getUint8(18 + optLen);
            
            let pos = 19 + optLen;
            
            // VLESS 协议解析：[Port] -> [Type] -> [Addr]
            const port = view.getUint16(pos);
            const type = view.getUint8(pos + 2);
            pos += 3;
            
            let addr = '';
            if (type === 1) { // IPv4
                addr = `${view.getUint8(pos)}.${view.getUint8(pos + 1)}.${view.getUint8(pos + 2)}.${view.getUint8(pos + 3)}`;
                pos += 4;
            } else if (type === 2) { // Domain
                const len = view.getUint8(pos++);
                addr = new TextDecoder().decode(data.slice(pos, pos + len));
                pos += len;
            } else if (type === 3) { // IPv6
                const ipv6 = [];
                for (let i = 0; i < 8; i++) {
                    ipv6.push(view.getUint16(pos + (i * 2)).toString(16));
                }
                addr = ipv6.join(':');
                pos += 16;
            } else {
                return;
            }

            const header = new Uint8Array([data[0], 0]);
            const payload = data.slice(pos);

            let sock = null;
            
            const proxyListRaw = cachedData.settings.proxyIPs;
            const proxyList = proxyListRaw.map(p => p.split('#')[0].trim()).filter(p => p.length > 0);
            
            try {
                sock = connect({ hostname: addr, port: port });
                await sock.opened;
            } catch (e) {
                if (proxyList.length > 0) {
                    const PROXY_IP = proxyList[Math.floor(Math.random() * proxyList.length)];
                    try {
                        const [ph, pp = port] = PROXY_IP.split(':');
                        sock = connect({ hostname: ph, port: +pp || port });
                        await sock.opened;
                    } catch (e2) {
                        return;
                    }
                } else {
                    return;
                }
            }

            remote = sock;
            const w = sock.writable.getWriter();
            await w.write(payload);
            w.releaseLock();

            sock.readable.pipeTo(new WritableStream({
                write(chunk) {
                    if (ws.readyState === 1) ws.send(new Uint8Array([...header, ...new Uint8Array(chunk)]));
                },
                close: () => ws.close()
            })).catch(()=>{});
        }
    })).catch(()=>{});

    return new Response(null, { status: 101, webSocket: client });
}

function stringifyUUID(arr) {
    const b = [];
    for (let i = 0; i < 256; ++i) b.push((i + 0x100).toString(16).substr(1));
    return (b[arr[0]]+b[arr[1]]+b[arr[2]]+b[arr[3]]+'-'+b[arr[4]]+b[arr[5]]+'-'+b[arr[6]]+b[arr[7]]+'-'+b[arr[8]]+b[arr[9]]+'-'+b[arr[10]]+b[arr[11]]+b[arr[12]]+b[arr[13]]+b[arr[14]]+b[arr[15]]).toLowerCase();
}
