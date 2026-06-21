# Nginx 配置详解

## 完整配置

```nginx
server {
    listen       80;
    listen       [::]:80;
    server_name  _;
    root         /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    error_page 404 /404.html;
    location = /404.html {
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
    }
}
```

---

## 逐段解析

### 1. server 基本配置

```nginx
server {
    listen       80;          # 监听 IPv4 的 80 端口（HTTP）
    listen       [::]:80;     # 监听 IPv6 的 80 端口
    server_name  _;           # 匹配任意域名（通配符）
    root         /usr/share/nginx/html;   # 网站根目录
}
```

- `listen 80` — 所有发到本机 80 端口的 HTTP 请求都会走这个 server 块
- `server_name _` — 当没有域名匹配时，兜底使用这个配置。也可以改成具体域名，如 `server_name example.com;`
- `root` — 静态文件的根目录。当请求 `/` 时，nginx 会在这个目录下找 `index.html`

---

### 2. SPA 路由支持

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**为什么需要？**

前端是 Vue SPA（单页应用），路由由前端 JS 控制（hash 模式或 history 模式）。

本项目用的是 hash 模式（URL 带 `#/`），但加上这一行可以兼容 history 模式，是一般推荐的做法。

**`try_files` 的执行逻辑：**

| 用户访问 | nginx 尝试顺序 | 结果 |
|---------|---------------|------|
| `/` | ① `/` → ② `/`（目录） → ③ `/index.html` | 返回 index.html |
| `/css/app.css` | ① 找到文件 | 直接返回该 CSS |
| `/js/app.js` | ① 找到文件 | 直接返回该 JS |
| `/favicon.ico` | ① 找到文件 | 直接返回图标 |

**三个参数的含义：**

| 参数 | 含义 |
|------|------|
| `$uri` | 按请求路径找文件（如 `/css/app.css` 存在则直接返回） |
| `$uri/` | 按请求路径找目录（如果目录存在，尝试返回目录下的 index 文件） |
| `/index.html` | 前两步都失败时，返回 index.html（交给 Vue 路由处理） |

---

### 3. API 反向代理

```nginx
location /api {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

**为什么需要？**

前端请求 `/api/reports`，浏览器只会把请求发到 `http://121.199.34.113/api/reports`。如果没有反向代理，nginx 会尝试在 `/usr/share/nginx/html` 下找 `api/reports` 这个文件，自然找不到，返回 404。

`proxy_pass` 告诉 nginx：遇到 `/api` 开头的请求，转发给后端的 `localhost:8080`。

**请求流转过程：**

```
浏览器请求                     nginx 收到              后端收到
/api/reports           →    localhost:8080      →    /api/reports
/api/reports/1         →    localhost:8080      →    /api/reports/1
/api/todos             →    localhost:8080      →    /api/todos
/api/todos/1/status    →    localhost:8080      →    /api/todos/1/status
```

**proxy_set_header 的作用：**

| 指令 | 值 | 作用 |
|------|----|------|
| `proxy_set_header Host $host` | 用户请求的 Host | 后端能知道用户访问的是哪个域名 |
| `proxy_set_header X-Real-IP $remote_addr` | 用户的真实 IP | 后端能记录客户端真实 IP，而非 nginx 内网 IP |

如果不加 `proxy_set_header Host $host`，后端收到的 `Host` 头是 `localhost:8080`，可能影响某些依赖 Host 头的逻辑。

---

### 4. 错误页面

```nginx
error_page 404 /404.html;
location = /404.html {
}

error_page 500 502 503 504 /50x.html;
location = /50x.html {
}
```

- `error_page 404 /404.html` — 当 nginx 返回 404 时，显示 `/usr/share/nginx/html/404.html`
- `location = /404.html { }` — 空的 location 块，使用 `root` 目录下的 `404.html`
- `500 502 503 504` — 服务器内部错误时显示 50x 页面

`=` 是精确匹配，只匹配 `/404.html` 本身，不匹配 `/404.html/xxx`。

---

## 其他常见配置说明

### 开启 gzip 压缩（推荐）

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
```

放在 `http { }` 块中。开启后 nginx 会压缩静态资源再传输，减小流量、加快页面加载。

### 前端路由（History 模式）

如果你把路由改成 `createWebHistory()`（不带 `#` 的 URL），nginx 配置中的 `try_files` 就非常重要了：

```
用户访问 /todo        → nginx 找不到 /todo 文件 → 返回 /index.html
                      → Vue 读取 URL，渲染 TodoList 页面
```

如果没有 `try_files`，直接访问 `http://121.199.34.113/todo` 会返回 404。

### 配置生效流程

```
修改 nginx.conf
     ↓
nginx -t           ← 测试配置文件语法是否正确
     ↓
systemctl reload   ← 平滑重载（不停机，不中断现有连接）
```

---

## 开发环境 vs 生产环境

| | 开发环境（本地） | 生产环境（服务器） |
|--|---------------|----------------|
| 静态文件服务 | `vue-cli-service serve`（热更新） | nginx 直接读取 `/usr/share/nginx/html` |
| API 请求转发 | `vue.config.js` → devServer.proxy | nginx → `location /api` → `proxy_pass` |
| 端口 | 8081（前端） | 80（前端） / 8080（后端） |
| 生效配置 | 改 `vue.config.js` | 改 `/etc/nginx/nginx.conf` |

---

## 总结

| 配置段 | 作用 |
|--------|------|
| `root` | 告诉 nginx 前端静态文件存在哪个目录 |
| `location /` + `try_files` | SPA 路由支持，前端页面刷新不报 404 |
| `location /api` + `proxy_pass` | 把 API 请求转发给后端 Java 服务 |
| `error_page` | 自定义错误页面 |

前端代码中只需写相对路径 `/api/reports`，nginx 会自动判断是静态文件还是 API 请求，分别处理。
