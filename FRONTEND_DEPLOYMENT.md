# 前端部署指南

## 环境要求

- Node.js >= 14（推荐 16+）
- npm >= 6

---

## 一、本地构建

### 1. 安装依赖

```bash
cd student-report-front
npm install
```

### 2. 生产构建

```bash
npm run build
```

构建完成后，生成的文件在 `dist/` 目录下，包含：

```
dist/
├── css/
├── js/
├── favicon.ico
└── index.html
```

---

## 二、上传到云服务器

### 1. 上传 dist 文件

在本地（你的 Mac）执行：

```bash
scp -r dist/* root@121.199.34.113:/usr/share/nginx/html/
```

> 如果 nginx 网站根目录不是 `/usr/share/nginx/html`，请替换为实际路径。

### 2. 查看服务器文件确认

```bash
ssh root@121.199.34.113 "ls /usr/share/nginx/html"
```

---

## 三、配置 Nginx

### 1. SSH 登录服务器

```bash
ssh root@121.199.34.113
```

### 2. 编辑 nginx 配置

文件路径：`/etc/nginx/nginx.conf`

在 `server` 块中，`root` 一行之后添加以下两段：

```nginx
server {
    listen       80;
    server_name  _;
    root         /usr/share/nginx/html;

    # 1) SPA 路由支持（刷新页面不报 404）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2) API 反向代理到后端
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ... 其他配置不变 ...
}
```

### 3. 测试并重载 Nginx

```bash
nginx -t && systemctl reload nginx
```

> 如果出现 `nginx: [emerg] "location" directive is not allowed here` 错误，说明 location 块的位置或缩进不对，请检查配置文件格式。

---

## 四、服务器防火墙 / 安全组

确保服务器开放 **80 端口**（HTTP）：

- **阿里云安全组**：添加入方向规则，协议 TCP，端口 80，来源 0.0.0.0/0
- **服务器内部防火墙**（如有）：

```bash
# CentOS / Alibaba Cloud Linux
firewall-cmd --add-port=80/tcp --permanent && firewall-cmd --reload

# Ubuntu
ufw allow 80
```

---

## 五、验证部署

打开浏览器访问：`http://121.199.34.113`

- 页面能正常加载
- 生成周报 / 待办事项 等操作能正常调用后端 API

打开浏览器开发者工具（F12）→ Network 面板，查看 `/api/*` 请求应返回 200，而非 404。

---

## 六、重新部署（更新前端）

每次修改代码后，重复步骤 一 ~ 二 即可：

```bash
npm run build
scp -r dist/* root@121.199.34.113:/usr/share/nginx/html/
```

无需重启 nginx，文件覆盖后立即生效。

---

## 常见问题

### Q: 页面能打开，但接口返回 404

检查 nginx 配置中 `location /api` 块是否正确添加，并执行了 `nginx -t && systemctl reload nginx`。

### Q: 接口返回 502 Bad Gateway

后端服务未启动，或后端端口不是 8080。SSH 登录服务器确认后端进程：

```bash
ps aux | grep java
```

### Q: 刷新页面报 404

nginx 缺少 `try_files $uri $uri/ /index.html;` 配置（SPA 路由需要）。

### Q: 上传时提示 Permission denied

scp 的目标目录权限不足，可以先上传到 `/tmp` 再复制过去：

```bash
scp -r dist/* root@121.199.34.113:/tmp/
ssh root@121.199.34.113 "cp -r /tmp/* /usr/share/nginx/html/"
```
