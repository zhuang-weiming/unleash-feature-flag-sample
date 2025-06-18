import './style.css';
import { UnleashClient } from 'unleash-proxy-client';

// Feature flag cache implementation
class FeatureFlagCache {
  constructor(ttlMinutes = 1) {
    this.cache = new Map();
    this.ttlMillis = ttlMinutes * 60 * 1000;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttlMillis) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
}

const featureCache = new FeatureFlagCache(1); // 1 minute TTL

const unleash = new UnleashClient({
  url: 'http://localhost:4242/api/frontend',
  clientKey: 'default:development.unleash-insecure-frontend-api-token',
  appName: 'default',
});

unleash.start();

unleash.on('ready', () => {
  console.log('Unleash SDK ready');
  document.getElementById('check-feature').addEventListener('click', () => {
    const featureName = 'frontend-example-hello-world';
    
    // Try to get from cache first
    const cachedValue = featureCache.get(featureName);
    if (cachedValue !== null) {
      console.log('Using cached value for feature:', featureName);
      updateUI(cachedValue);
      return;
    }
    
    // If not in cache, check from Unleash
    const enabled = unleash.isEnabled(featureName);
    console.log('Feature enabled (from Unleash):', enabled);
    
    // Cache the result
    featureCache.set(featureName, enabled);
    
    updateUI(enabled);
  });

  document.getElementById('check-backend-feature').addEventListener('click', async () => {
    const statusDiv = document.getElementById('feature-status');
    try {
      const featureName = 'frontend-example-hello-world';
      
      // Try to get from cache first
      const cachedValue = featureCache.get('backend-' + featureName);
      if (cachedValue !== null) {
        console.log('Using cached value for backend feature:', featureName);
        updateUI(cachedValue, true);
        return;
      }
      
      const response = await fetch('http://localhost:8080/api/feature-check');
      const enabled = await response.json();
      console.log('Backend feature enabled:', enabled);
      
      // Cache the result
      featureCache.set('backend-' + featureName, enabled);
      
      updateUI(enabled, true);
    } catch (error) {
      console.error('Backend API error:', error);
      statusDiv.textContent = '后端API调用失败，请检查后端服务是否启动';
    }
  });
});

function updateUI(enabled, isBackend = false) {
  const statusDiv = document.getElementById('feature-status');
  const source = isBackend ? '后端检查' : '前端检查';
  if (enabled) {
    statusDiv.textContent = `${source}：\n新功能已启用！`;
  } else {
    statusDiv.textContent = `${source}：\n回退到旧逻辑`;
  }
}

unleash.on('error', (err) => {
  console.error('Unleash SDK error:', err);
});
