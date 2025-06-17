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
      statusDiv.textContent = '新功能已启用！';
    } else {
      statusDiv.textContent = '回退到旧逻辑';
    }
  });
});

unleash.on('error', (err) => {
  console.error('Unleash SDK error:', err);
});
