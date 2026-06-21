# 后端部署指南

## 环境要求

- **JDK**: Java 8（推荐使用 `java-1.8.0-openjdk`）
- **Maven**: 3.6+（构建时需要，运行 jar 不需要）
- **MySQL**: 8.0+
- **服务器**: CentOS / Alibaba Cloud Linux / Ubuntu

---

## 一、服务器初始化（仅首次）

### 1. 安装 Java 8

```bash
# CentOS / Alibaba Cloud Linux
yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel

# Ubuntu
apt update && apt install -y openjdk-8-jdk

# 验证
java -version
```

### 2. 安装 MySQL 8

```bash
# CentOS / Alibaba Cloud Linux
yum install -y mysql-server
systemctl start mysqld
systemctl enable mysqld

# Ubuntu
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql
```

### 3. 初始化 MySQL 并创建数据库和用户

```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE IF NOT EXISTS student_report
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'student_report'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON student_report.* TO 'student_report'@'localhost';

-- 如果后端 jar 部署在同一台服务器，上面就足够
-- 如果后端在其他机器连接，还需允许远程访问：
CREATE USER 'student_report'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON student_report.* TO 'student_report'@'%';

FLUSH PRIVILEGES;
```

---

## 二、数据库表结构

本项目使用 JPA + Hibernate 的 `ddl-auto=update` 模式，**无需手动创建表**，首次启动时会自动建表。

涉及的两张表：
- `student_report` — 周报数据
- `todo_item` — 待办事项数据

---

## 三、本地构建 JAR 包

### 1. 克隆项目

```bash
git clone <仓库地址> student-report-backend
cd student-report-backend
```

### 2. 检查数据库配置

编辑 `src/main/resources/application.properties`，确认数据库连接信息：

```properties
# 数据库地址：如果 MySQL 与后端在同一台服务器，改为 localhost
spring.datasource.url=jdbc:mysql://localhost:3306/student_report?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai&createDatabaseIfNotExist=true
spring.datasource.username=student_report
spring.datasource.password=123456
```

### 3. 打包

```bash
mvn clean package -DskipTests
```

构建成功后在 `target/` 目录下生成 jar 文件：

```
target/student-report-backend-0.0.1-SNAPSHOT.jar   (约 39 MB)
```

---

## 四、上传 JAR 到服务器

### 在本地（你的 Mac）执行

```bash
scp target/student-report-backend-0.0.1-SNAPSHOT.jar root@121.199.34.113:/opt/
```

---

## 五、在服务器上启动后端

### 方式一：直接启动（推荐测试用）

```bash
java -jar /opt/student-report-backend-0.0.1-SNAPSHOT.jar
```

> 按 `Ctrl + C` 停止。关闭 SSH 窗口进程也会结束。

### 方式二：后台运行（nohup）

```bash
nohup java -jar /opt/student-report-backend-0.0.1-SNAPSHOT.jar > /var/log/student-report-backend.log 2>&1 &
```

### 方式三：配置为系统服务（推荐生产用）

创建 systemd 服务文件 `/etc/systemd/system/student-report-backend.service`：

```ini
[Unit]
Description=Student Report Backend
After=network.target mysql.service

[Service]
ExecStart=/usr/bin/java -jar /opt/student-report-backend-0.0.1-SNAPSHOT.jar
WorkingDirectory=/opt
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
systemctl daemon-reload
systemctl start student-report-backend
systemctl enable student-report-backend
systemctl status student-report-backend
```

---

## 六、验证后端

### 1. 确认端口监听

```bash
ss -tlnp | grep 8080
```

### 2. 测试 API

在服务器本地测试：

```bash
curl http://localhost:8080/api/reports
```

返回 JSON 数据数组（可能是空数组 `[]`）即为正常。

### 3. 查看日志

```bash
# systemd 方式
journalctl -u student-report-backend -f

# nohup 方式
tail -f /var/log/student-report-backend.log
```

---

## 七、CORS 配置

当前后端的 CORS 配置（`application.properties`）限制允许的来源为 `http://121.199.34.113:8080`。

如果你的前端通过 nginx 80 端口访问，请求来源变成 `http://121.199.34.113`，**需要修改**：

```properties
spring.web.cors.allowed-origins=http://121.199.34.113
```

修改后重新打包并上传、重启服务。

---

## 八、防火墙 / 安全组

后端端口 8080 通常**不需要对外暴露**（前端通过 nginx 反向代理访问），但如果需要直接调试：

- **阿里云安全组**：添加入方向规则，端口 8080（仅调试时可开，用完关闭）
- **服务器内部防火墙**：

```bash
firewall-cmd --add-port=8080/tcp --permanent && firewall-cmd --reload
```

---

## 九、重新部署（更新后端）

```bash
# 1. 本地重新打包
mvn clean package -DskipTests

# 2. 上传
scp target/student-report-backend-0.0.1-SNAPSHOT.jar root@121.199.34.113:/opt/

# 3. 重启服务
ssh root@121.199.34.113 "systemctl restart student-report-backend"
```

---

## 十、数据备份

```bash
# 备份数据库
mysqldump -u student_report -p student_report > /backup/student_report_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u student_report -p student_report < /backup/student_report_20240601.sql
```

---

## 常见问题

### Q: 启动报错 "Unable to create Connector"

MySQL 未启动或连接参数不正确。确认 MySQL 正在运行：

```bash
systemctl status mysql
```

### Q: `java: command not found`

Java 未安装或未加入 PATH。检查 `java -version`，或使用完整路径 `/usr/lib/jvm/java-1.8.0/bin/java`。

### Q: 表已存在但字段对不上

Hibernate `ddl-auto=update` 只会新增字段，不会删除或修改已有字段。如需重建表，手动操作：

```sql
DROP TABLE IF EXISTS student_report;
DROP TABLE IF EXISTS todo_item;
```

重启后端即可自动重建。

### Q: 前端调用接口报 403 / CORS 错误

检查 `application.properties` 中的 `spring.web.cors.allowed-origins` 是否与前端访问地址一致。
