# 学生周报生成器部署指南

## 项目概述

本项目是一个学生周报生成器，包含前端和后端两个部分：
- 前端：Vue 3 + Element Plus
- 后端：Node.js + Express + SQLite
- 数据库：SQLite（轻量级，无需额外安装）

## 部署前准备

### 服务器要求
- 操作系统：Linux（推荐Ubuntu 20.04+）或Windows Server
- Node.js 版本：v14+（推荐v16或v18）
- npm 版本：v6+ 或 yarn
- 内存：至少1GB RAM
- 存储空间：至少10GB可用空间

### 端口配置
- 前端：默认使用8081端口（开发环境），部署时建议使用80或443端口
- 后端：默认使用8080端口

## 前端部署

### 1. 安装依赖

```bash
cd student-report-vue3-project
npm install
```

### 2. 构建生产版本

```bash
npm run build
```

构建完成后，会在项目根目录生成 `dist` 文件夹，包含所有静态资源。

### 3. 部署静态资源

可以使用以下任意一种方式部署静态资源：

#### 方式一：使用 Nginx 部署（推荐）

1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx
```

2. 配置 Nginx

创建或编辑 Nginx 配置文件：

```bash
sudo nano /etc/nginx/conf.d/student-report.conf
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP地址
    
    location / {
        root /path/to/student-report-vue3-project/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 代理API请求到后端服务
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. 启动 Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 方式二：使用 Node.js 静态文件服务器

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
cd dist
http-server -p 8081
```

## 后端部署

### 1. 安装依赖

```bash
cd student-report-vue3-project/backend
npm install
```

### 2. 启动后端服务

#### 方式一：直接启动（开发环境）

```bash
npm start
```

#### 方式二：使用 PM2 管理进程（生产环境推荐）

1. 安装 PM2

```bash
npm install -g pm2
```

2. 启动服务

```bash
npm run pm2-start
```

3. 配置 PM2 自动重启

```bash
npm run pm2-enable
```

4. 查看服务状态

```bash
npm run pm2-status
```

### 3. 环境变量配置

可以通过创建 `.env` 文件或设置系统环境变量来配置后端服务：

```bash
# 后端端口
PORT=8080

# 数据库路径（SQLite）
DB_PATH=./reports.db
```

## 数据库部署

本项目使用 SQLite 数据库，无需额外安装数据库服务。SQLite 数据库文件会自动创建在后端目录下（`./reports.db`）。

### 数据备份

定期备份 `reports.db` 文件即可完成数据备份：

```bash
cp /path/to/student-report-vue3-project/backend/reports.db /path/to/backup/reports_$(date +%Y%m%d).db
```

### 数据恢复

将备份的数据库文件替换当前的 `reports.db` 文件即可：

```bash
cp /path/to/backup/reports_20230101.db /path/to/student-report-vue3-project/backend/reports.db
```

## 完整部署流程（示例）

### 1. 服务器初始化

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Git
sudo apt install -y git
```

### 2. 克隆项目

```bash
git clone <repository-url> student-report-vue3-project
cd student-report-vue3-project
```

### 3. 部署后端

```bash
cd backend
npm install
npm install -g pm2
pm run pm2-start
npm run pm2-enable
```

### 4. 部署前端

```bash
cd ..
npm install
npm run build

# 配置 Nginx
sudo nano /etc/nginx/conf.d/student-report.conf
# 添加上述 Nginx 配置

sudo systemctl restart nginx
```

### 5. 验证部署

1. 访问前端：http://your-domain.com
2. 访问后端 API：http://your-domain.com/api/reports

## 常见问题与解决方案

### 1. 端口被占用

```bash
# 查看端口占用情况
lsof -i :8080

# 杀死占用端口的进程
kill -9 <PID>
```

### 2. Nginx 启动失败

```bash
# 检查配置文件语法
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 3. 后端服务无法访问

```bash
# 查看 PM2 日志
npm run pm2-logs

# 检查防火墙设置
sudo ufw status
sudo ufw allow 8080
```

## 升级流程

1. 备份数据库文件
2. 拉取最新代码
3. 更新前端依赖并重新构建
4. 更新后端依赖并重启服务
5. 验证功能正常

## 监控与维护

### 1. 监控服务状态

```bash
# 监控后端服务
npm run pm2-status

# 监控 Nginx 状态
systemctl status nginx
```

### 2. 查看日志

```bash
# 查看后端日志
npm run pm2-logs

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 3. 定期维护

- 每周检查一次日志，排查异常情况
- 每月备份一次数据库
- 每季度更新一次依赖包，修复安全漏洞

## 安全建议

1. 使用 HTTPS 协议（推荐使用 Let's Encrypt 免费证书）
2. 配置防火墙，只开放必要的端口
3. 定期更新系统和依赖包
4. 不要在代码中硬编码敏感信息
5. 限制 API 访问频率，防止恶意请求

## 联系方式

如有部署问题或建议，欢迎联系项目维护人员。
