# Unleash Feature Flag Sample

这是一个使用 Unleash Feature Flag 的完整示例项目，包含前端和后端集成示例。

## 项目特性

- 完整的前后端功能开关集成
- 高性能缓存实现（前端和后端）
- 一致的缓存策略（1分钟 TTL）
- 线程安全的后端缓存
- 自动缓存失效机制

## 项目概述

本项目展示了如何在前端和后端同时集成 Unleash 功能开关（Feature Flag）系统：
- 前端使用 `unleash-proxy-client` 直接与 Unleash 服务器通信
- 后端使用 Java SDK 与 Unleash 服务器通信
- 同时支持前端直接检查和通过后端 API 检查功能开关状态

## 前置条件

- Node.js 18+
- Java 17+
- Maven 3.8+
- Unleash 服务运行在 http://localhost:4242

## 项目结构

```
├── frontend (根目录)
│   ├── index.html          # 主页面
│   ├── package.json        # 前端项目配置
│   └── src/
│       ├── main.js        # 前端 Unleash 集成代码
│       └── style.css      # 样式文件
│
└── backend/
    ├── pom.xml           # Maven 项目配置
    └── src/main/
        ├── java/         # Java 源代码
        └── resources/    # 配置文件
```

## 详细文档

- [前端集成指南](docs/frontend-integration-guide.md) - 前端功能开关集成详细说明
- [后端集成指南](docs/backend-integration-guide.md) - Java 后端功能开关集成详细说明

## 快速开始

### 1. 准备工作

安装 https://github.com/Unleash/unleash
在 Unleash 后台 (http://localhost:4242) 创建 feature flag：
- 名称：`frontend-example-hello-world`
- 确保已启用（Enabled）

### 2. 启动前端服务

1. 安装依赖:
```bash
npm install
```

2. 启动开发服务器:
```bash
npm run dev
```

3. 前端服务将运行在 http://localhost:5173

### 3. 启动后端服务

1. 进入后端目录:
```bash
cd backend
```

2. 启动 Spring Boot 应用:
```bash
mvn spring-boot:run
```

3. 后端服务将运行在 http://localhost:8080

## 功能测试

1. 打开浏览器访问 http://localhost:5173

2. 界面上有两个按钮：
   - "Check Frontend Feature": 直接通过前端 SDK 检查功能开关
   - "Check Backend Feature": 通过后端 API 检查功能开关

3. 测试场景：
   - 点击前端检查按钮：直接从 Unleash 获取功能开关状态
   - 点击后端检查按钮：通过后端 API 获取功能开关状态
   - 在 Unleash 管理界面修改功能开关状态，然后测试两个按钮的响应

4. 功能开关状态显示：
   - 启用时显示："新功能已启用！"
   - 禁用时显示："回退到旧逻辑"
   - 后端服务未启动时显示相应错误信息

## API 接口

### 后端 API

- 功能开关检查接口
  - URL: `http://localhost:8080/api/feature-check`
  - 方法: GET
  - 返回: Boolean（true: 功能启用，false: 功能禁用）

## 技术栈

### 前端
- Vite
- unleash-proxy-client

### 后端
- Spring Boot 3.1
- unleash-client-java 8.0

## 性能优化

### 缓存机制
本项目在前端和后端都实现了feature flag缓存机制，以提高性能和减少对Unleash服务器的请求：

1. **前端缓存**
   - 使用 Map 实现的内存缓存
   - 1分钟缓存时间
   - 自动过期和清理
   - 分离的前端和后端API缓存

2. **后端缓存**
   - 使用 ConcurrentHashMap 实现的线程安全缓存
   - 1分钟缓存时间
   - 自动过期机制
   - Spring Bean 生命周期管理

### 性能提升
- 减少对 Unleash 服务器的请求
- 提高API响应速度
- 降低服务器负载
- 改善用户体验

## 开发建议

1. 确保 Unleash 服务器正常运行
2. 前端和后端使用相同的功能开关名称
3. 正确配置 CORS 以允许前端访问后端 API
4. 使用适当的环境变量管理配置

## 常见问题

1. 后端 API 404：检查后端服务是否正常启动
2. 功能开关不生效：检查 Unleash 服务器连接和功能开关配置
3. CORS 错误：检查后端 CORS 配置是否正确
