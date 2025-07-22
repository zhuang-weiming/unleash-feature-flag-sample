# Frontend Integration Guide for Unleash

This guide will help you integrate the Unleash feature flag system in your frontend project. The guide is based on the actual implementation in our [example project](../README.md).

> You can find the complete frontend implementation in the following files:
>
> - [src/main.js](../src/main.js) - Unleash client integration and feature flag logic
> - [index.html](../index.html) - Page structure and button definitions
> - [src/style.css](../src/style.css) - Style definitions
> - [package.json](../package.json) - Project dependency configuration

## Prerequisites

- Node.js 18+
- npm or yarn
- Running Unleash server at `http://localhost:4242`

## Step 1: Install Dependencies

```bash
npm install unleash-proxy-client
```

## Step 2: Configure Unleash Client

In your frontend code (refer to [main.js](../src/main.js) implementation):

```javascript
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
  url: 'http://localhost:4242/api/frontend',  // Unleash server address
  clientKey: 'default:development.unleash-insecure-frontend-api-token',  // API key
  appName: 'default',  // Application name
});

// Start Unleash client
unleash.start();
```

## Step 3: Implement Feature Toggle Check

```javascript
unleash.on('ready', () => {
  // Handle after Unleash client is ready
  const checkFeature = () => {
    const featureName = 'your-feature-name';
    const isEnabled = unleash.isEnabled(featureName);
    
    if (isEnabled) {
      // Logic when feature is enabled
      console.log('Feature is enabled!');
    } else {
      // Logic when feature is disabled
      console.log('Feature is disabled!');
    }
  };
});

// Error handling
unleash.on('error', (error) => {
  console.error('Unleash error:', error);
});
```

## Step 4: Use Feature Toggle in UI

```javascript
document.getElementById('myButton').addEventListener('click', () => {
  if (unleash.isEnabled('my-feature')) {
    // Show new feature
    showNewFeature();
  } else {
    // Show default feature
    showDefaultFeature();
  }
});
```

## Best Practices

1. **Error Handling**

   - Always add error listeners
   - Add default values for feature toggle checks

   ```javascript
   unleash.isEnabled('my-feature', { fallback: false })
   ```

2. **Performance Optimization**

   - Avoid frequent checks of the same feature toggle
   - Consider caching check results in local variables

3. **Development Debugging**

   - Use browser console to monitor feature toggle status
   - Add appropriate logging

4. **Security**

   - Don't store sensitive feature toggles on the client side
   - Use appropriate API keys and permission controls

5. **Cache Implementation**

   ```javascript
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
   
   // Using cache
   const featureCache = new FeatureFlagCache(1); // 1 minute TTL
   ```

6. **Cache Usage Example**

   ```javascript
   // Check feature toggle status
   const checkFeature = (featureName) => {
     // Check cache first
     const cachedValue = featureCache.get(featureName);
     if (cachedValue !== null) {
       console.log('Using cached value');
       return cachedValue;
     }
     
     // Check Unleash when cache miss
     const enabled = unleash.isEnabled(featureName);
     featureCache.set(featureName, enabled);
     return enabled;
   };
   ```

7. **Cache Considerations**

   - Default cache time is 1 minute
   - Automatic cache expiration and cleanup
   - Reduce requests to Unleash server
   - Improve application performance and response speed

## Common Issues

1. **Feature Toggle Not Working**

   - Check Unleash server connection status
   - Verify feature toggle names are correct
   - Confirm API key is valid

2. **Connection Issues**

   - Verify Unleash server address
   - Check network connection
   - Confirm CORS configuration is correct

3. **Environment Configuration**

   - Use environment variables for configuration management
   - Differentiate between development and production environments

## Example Code

Complete feature toggle integration example:

```javascript
import { UnleashClient } from 'unleash-proxy-client';

// Initialize Unleash client
const unleash = new UnleashClient({
  url: process.env.UNLEASH_API_URL || 'http://localhost:4242/api/frontend',
  clientKey: process.env.UNLEASH_API_KEY || 'default:development.unleash-insecure-frontend-api-token',
  appName: 'my-app',
});

// Start client
unleash.start();

// Listen for ready event
unleash.on('ready', () => {
  console.log('Unleash client is ready');
  
  // Set up feature toggle checks
  const featureButtons = document.querySelectorAll('[data-feature]');
  featureButtons.forEach(button => {
    const featureName = button.dataset.feature;
    button.addEventListener('click', () => {
      if (unleash.isEnabled(featureName)) {
        console.log(`Feature ${featureName} is enabled`);
        // Implement new feature
      } else {
        console.log(`Feature ${featureName} is disabled`);
        // Implement fallback feature
      }
    });
  });
});

// Error handling
unleash.on('error', (error) => {
  console.error('Unleash client error:', error);
  // Implement appropriate error handling
});

// Graceful shutdown
window.addEventListener('unload', () => {
  unleash.stop();
});
```

## Testing

1. **Unit Testing**

   ```javascript
   // Using jest for testing
   describe('Feature Toggle Tests', () => {
     it('should handle enabled feature', () => {
       const isEnabled = unleash.isEnabled('test-feature');
       expect(isEnabled).toBeDefined();
     });
   });
   ```

2. **Integration Testing**

   - Test different states of feature toggles
   - Test error handling
   - Test default value behavior

## Deployment Checklist

- [ ] Confirm all feature toggle names are correct
- [ ] Verify API key configuration
- [ ] Test error handling
- [ ] Check logging output
- [ ] Verify performance impact
- [ ] Confirm CORS configuration
