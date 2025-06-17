import './style.css';
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: 'http://localhost:4242/api/frontend',
  clientKey: 'default:development.unleash-insecure-frontend-api-token',
  appName: 'default',
});

unleash.start();

unleash.on('ready', () => {
  console.log('Unleash SDK ready');
  document.getElementById('check-feature').addEventListener('click', () => {
    const enabled = unleash.isEnabled('frontend-example-hello-world');
    const statusDiv = document.getElementById('feature-status');
    console.log('Feature enabled:', enabled);
    if (enabled) {
      statusDiv.textContent = '前端检查：\n新功能已启用！';
    } else {
      statusDiv.textContent = '前端检查：\n回退到旧逻辑';
    }
  });

  document.getElementById('check-backend-feature').addEventListener('click', async () => {
    const statusDiv = document.getElementById('feature-status');
    try {
      const response = await fetch('http://localhost:8080/api/feature-check');
      const enabled = await response.json();
      console.log('Backend feature enabled:', enabled);
      if (enabled) {
        statusDiv.textContent = '后端检查：\n新功能已启用！';
      } else {
        statusDiv.textContent = '后端检查：\n回退到旧逻辑';
      }
    } catch (error) {
      console.error('Backend API error:', error);
      statusDiv.textContent = '后端API调用失败，请检查后端服务是否启动';
    }
  });
});

unleash.on('error', (err) => {
  console.error('Unleash SDK error:', err);
});
