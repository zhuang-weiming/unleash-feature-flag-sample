# Frontend Integration Guide for Unleash

本指南将帮助你在前端项目中集成 Unleash 功能开关系统。这个指南基于我们的[示例项目](../README.md)中的实际实现。

> 你可以在以下文件中找到完整的前端实现：
> - [src/main.js](../src/main.js) - Unleash 客户端集成和功能开关逻辑
> - [index.html](../index.html) - 页面结构和按钮定义
> - [src/style.css](../src/style.css) - 样式定义
> - [package.json](../package.json) - 项目依赖配置

## 前置条件

- Node.js 18+
- npm 或 yarn
- 运行中的 Unleash 服务器 (http://localhost:4242)

## 步骤 1: 安装依赖

```bash
npm install unleash-proxy-client
```

## 步骤 2: 配置 Unleash 客户端

在你的前端代码中（参考 [main.js](../src/main.js) 的实现）：

```javascript
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: 'http://localhost:4242/api/frontend',  // Unleash 服务器地址
  clientKey: 'default:development.unleash-insecure-frontend-api-token',  // API密钥
  appName: 'default',  // 应用名称
});

// 启动 Unleash 客户端
unleash.start();
```

## 步骤 3: 实现功能开关检查

```javascript
unleash.on('ready', () => {
  // Unleash 客户端就绪后的处理
  const checkFeature = () => {
    const featureName = 'your-feature-name';
    const isEnabled = unleash.isEnabled(featureName);
    
    if (isEnabled) {
      // 功能开启时的逻辑
      console.log('Feature is enabled!');
    } else {
      // 功能关闭时的逻辑
      console.log('Feature is disabled!');
    }
  };
});

// 错误处理
unleash.on('error', (error) => {
  console.error('Unleash error:', error);
});
```

## 步骤 4: 在 UI 中使用功能开关

```javascript
document.getElementById('myButton').addEventListener('click', () => {
  if (unleash.isEnabled('my-feature')) {
    // 显示新功能
    showNewFeature();
  } else {
    // 显示默认功能
    showDefaultFeature();
  }
});
```

## 最佳实践

1. **错误处理**
   - 始终添加错误监听器
   - 为功能开关检查添加默认值
   ```javascript
   unleash.isEnabled('my-feature', { fallback: false })
   ```

2. **性能优化**
   - 避免频繁检查同一个功能开关
   - 考虑将检查结果缓存在本地变量中

3. **开发调试**
   - 使用浏览器控制台监控功能开关状态
   - 添加适当的日志输出

4. **安全性**
   - 不要在客户端存储敏感的功能开关
   - 使用适当的 API 密钥和权限控制

## 常见问题解决

1. **功能开关不生效**
   - 检查 Unleash 服务器连接状态
   - 验证功能开关名称是否正确
   - 确认 API 密钥是否有效

2. **连接错误**
   - 验证 Unleash 服务器地址
   - 检查网络连接
   - 确认 CORS 配置是否正确

3. **环境配置**
   - 使用环境变量管理配置
   - 区分开发和生产环境

## 示例代码

完整的功能开关集成示例：

```javascript
import { UnleashClient } from 'unleash-proxy-client';

// 初始化 Unleash 客户端
const unleash = new UnleashClient({
  url: process.env.UNLEASH_API_URL || 'http://localhost:4242/api/frontend',
  clientKey: process.env.UNLEASH_API_KEY || 'default:development.unleash-insecure-frontend-api-token',
  appName: 'my-app',
});

// 启动客户端
unleash.start();

// 监听就绪事件
unleash.on('ready', () => {
  console.log('Unleash client is ready');
  
  // 设置功能开关检查
  const featureButtons = document.querySelectorAll('[data-feature]');
  featureButtons.forEach(button => {
    const featureName = button.dataset.feature;
    button.addEventListener('click', () => {
      if (unleash.isEnabled(featureName)) {
        console.log(`Feature ${featureName} is enabled`);
        // 实现新功能
      } else {
        console.log(`Feature ${featureName} is disabled`);
        // 实现后备功能
      }
    });
  });
});

// 错误处理
unleash.on('error', (error) => {
  console.error('Unleash client error:', error);
  // 实现适当的错误处理
});

// 优雅关闭
window.addEventListener('unload', () => {
  unleash.stop();
});
```

## 测试

1. **单元测试**
```javascript
// 使用 jest 进行测试
describe('Feature Toggle Tests', () => {
  it('should handle enabled feature', () => {
    const isEnabled = unleash.isEnabled('test-feature');
    expect(isEnabled).toBeDefined();
  });
});
```

2. **集成测试**
- 测试功能开关的不同状态
- 测试错误处理
- 测试默认值行为

## 部署检查清单

- [ ] 确认所有功能开关名称正确
- [ ] 验证 API 密钥配置
- [ ] 测试错误处理
- [ ] 检查日志输出
- [ ] 验证性能影响
- [ ] 确认 CORS 配置
