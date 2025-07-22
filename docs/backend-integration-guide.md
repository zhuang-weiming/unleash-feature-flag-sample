# Backend Integration Guide for Unleash (Java/Spring Boot)

This guide will help you integrate the Unleash feature toggle system in your Java Spring Boot project. The guide is based on the actual implementation in our [example project](../README.md).

## Quick Links

### Core Implementation Files

- [UnleashConfiguration.java](../backend/src/main/java/com/example/unleashsample/config/UnleashConfiguration.java) - Unleash client configuration
- [FeatureController.java](../backend/src/main/java/com/example/unleashsample/controller/FeatureController.java) - Feature toggle API implementation
- [UnleashApplication.java](../backend/src/main/java/com/example/unleashsample/UnleashApplication.java) - Spring Boot application entry point

### Configuration Files

- [application.properties](../backend/src/main/resources/application.properties) - Application configuration
- [pom.xml](../backend/pom.xml) - Maven project configuration and dependency management

## Prerequisites

- Java 17+
- Maven 3.8+
- Spring Boot 3.x
- Running Unleash server at `http://localhost:4242`

## Step 1: Add Dependencies

Add the Unleash Java client dependency to `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot dependencies -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Unleash client dependency -->
    <dependency>
        <groupId>io.getunleash</groupId>
        <artifactId>unleash-client-java</artifactId>
        <version>8.0.0</version>
    </dependency>
</dependencies>
```

## Step 2: Configure Unleash Client

Create the Unleash configuration class (refer to [UnleashConfiguration.java](../backend/src/main/java/com/example/unleashsample/config/UnleashConfiguration.java) implementation):

```java
package com.example.yourapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.getunleash.DefaultUnleash;
import io.getunleash.Unleash;
import io.getunleash.util.UnleashConfig;

@Configuration
public class UnleashConfiguration {
    
    @Bean
    public Unleash unleash() {
        UnleashConfig config = UnleashConfig.builder()
                .appName("your-app-name")
                .instanceId("your-instance-1")
                .unleashAPI("http://localhost:4242/api/")
                .synchronousFetchOnInitialisation(true)
                .customHttpHeader("Authorization", "your-api-token")
                .build();

        return new DefaultUnleash(config);
    }
}
```

## Step 3: Create Feature Toggle Controller

Refer to [FeatureController.java](../backend/src/main/java/com/example/unleashsample/controller/FeatureController.java) implementation:

```java
package com.example.yourapp.controller;

import org.springframework.web.bind.annotation.*;
import io.getunleash.Unleash;

@RestController
@RequestMapping("/api")
public class FeatureController {

    private final Unleash unleash;

    public FeatureController(Unleash unleash) {
        this.unleash = unleash;
    }

    @GetMapping("/feature/{featureName}")
    public boolean checkFeature(@PathVariable String featureName) {
        return unleash.isEnabled(featureName);
    }
}
```

## Step 4: Configure Application Properties

Add configuration to `application.properties` or `application.yml` (refer to [application.properties](../backend/src/main/resources/application.properties) implementation):

```properties
# Server configuration
server.port=8080

# Logging configuration
logging.level.io.getunleash=DEBUG

# Unleash specific configuration
unleash.environment=development
```

## Best Practices

1. **Configuration Management**

   ```java
   @Configuration
   @ConfigurationProperties(prefix = "unleash")
   public class UnleashProperties {
       private String apiUrl;
       private String apiToken;
       // getters and setters
   }
   ```

2. **Exception Handling**

   ```java
   @ControllerAdvice
   public class UnleashExceptionHandler {
       @ExceptionHandler(UnleashException.class)
       public ResponseEntity<String> handleUnleashException(UnleashException e) {
           return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                   .body("Feature flag service unavailable");
       }
   }
   ```

3. **Service Layer Encapsulation**

   ```java
   @Service
   public class FeatureService {
       private final Unleash unleash;

       public FeatureService(Unleash unleash) {
           this.unleash = unleash;
       }

       public boolean isFeatureEnabled(String featureName, String userId) {
           UnleashContext context = UnleashContext.builder()
               .userId(userId)
               .build();
           return unleash.isEnabled(featureName, context);
       }
   }
   ```

4. **Cache Implementation**

   ```java
   @Service
   public class FeatureFlagCache {
       private final Map<String, CacheEntry> cache;
       private final long ttlMillis;
   
       public FeatureFlagCache() {
           this.cache = new ConcurrentHashMap<>();
           this.ttlMillis = 60000; // 1 minute TTL
       }
   
       public void set(String key, boolean value) {
           cache.put(key, new CacheEntry(value));
       }
   
       public Boolean get(String key) {
           CacheEntry entry = cache.get(key);
           if (entry == null) return null;
   
           if (System.currentTimeMillis() - entry.timestamp > ttlMillis) {
               cache.remove(key);
               return null;
           }
   
           return entry.value;
       }
   
       private static class CacheEntry {
           final boolean value;
           final long timestamp;
   
           CacheEntry(boolean value) {
               this.value = value;
               this.timestamp = System.currentTimeMillis();
           }
       }
   }
   ```

5. **Using Cache in Controllers**

   ```java
   @RestController
   @RequestMapping("/api")
   public class FeatureController {
       private final Unleash unleash;
       private final FeatureFlagCache cache;
   
       public FeatureController(Unleash unleash, FeatureFlagCache cache) {
           this.unleash = unleash;
           this.cache = cache;
       }
   
       @GetMapping("/feature-check")
       public boolean checkFeature() {
           String featureName = "your-feature-name";
           
           // Check cache first
           Boolean cachedValue = cache.get(featureName);
           if (cachedValue != null) {
               return cachedValue;
           }
   
           // Check Unleash when cache miss
           boolean isEnabled = unleash.isEnabled(featureName);
           cache.set(featureName, isEnabled);
           return isEnabled;
       }
   }
   ```

6. **Cache Considerations**

   - Use thread-safe ConcurrentHashMap
   - Automatic expiration mechanism
   - Reduce requests to Unleash server
   - Improve API response speed
   - Default 1-minute cache time

## Advanced Usage

1. **Using Context**

   ```java
   UnleashContext context = UnleashContext.builder()
       .userId(user.getId())
       .sessionId(session.getId())
       .remoteAddress(request.getRemoteAddr())
       .addProperty("customField", "customValue")
       .build();

   boolean enabled = unleash.isEnabled("my-feature", context);
   ```

2. **Custom Strategy**

   ```java
   public class CustomStrategy implements Strategy {
       @Override
       public String getName() {
           return "custom";
       }

       @Override
       public boolean isEnabled(Map<String, String> parameters, UnleashContext context) {
           // Implement custom logic
           return true;
       }
   }
   ```

3. **Variant Support**

   ```java
   Variant variant = unleash.getVariant("my-feature");
   switch (variant.getName()) {
       case "A":
           // Implement variant A
           break;
       case "B":
           // Implement variant B
           break;
       default:
           // Default implementation
   }
   ```

## Testing

1. **Unit Testing**

   ```java
   @SpringBootTest
   class FeatureControllerTest {
       @MockBean
       private Unleash unleash;

       @Autowired
       private FeatureController controller;

       @Test
       void testFeatureFlag() {
           when(unleash.isEnabled("test-feature")).thenReturn(true);
           assertTrue(controller.checkFeature("test-feature"));
       }
   }
   ```

2. **Integration Testing**

   ```java
   @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
   class FeatureIntegrationTest {
       @Autowired
       private TestRestTemplate restTemplate;

       @Test
       void testFeatureEndpoint() {
           ResponseEntity<Boolean> response = restTemplate
               .getForEntity("/api/feature/test-feature", Boolean.class);
           assertEquals(HttpStatus.OK, response.getStatusCode());
       }
   }
   ```

## Monitoring and Metrics

1. **Add Metric Collection**

   ```java
   @Bean
   public UnleashMetricService unleashMetricService(Unleash unleash) {
       return new UnleashMetricService(unleash);
   }
   ```

2. **Custom Metric Handling**

   ```java
   public class CustomMetricSubscriber implements UnleashSubscriber {
       @Override
       public void onCount(String name, boolean enabled) {
           // Implement metric collection logic
       }
   }
   ```

## Deployment Checklist

- [ ] Verify Unleash server configuration
- [ ] Confirm API key settings
- [ ] Check logging level configuration
- [ ] Test all feature toggles
- [ ] Verify error handling
- [ ] Confirm monitoring configuration
- [ ] Check performance impact

## Common Issues

1. **Connection Issues**

   - Check Unleash server address
   - Verify network connection
   - Confirm API key is correct

2. **Performance Issues**

   - Adjust synchronization interval
   - Check cache configuration
   - Monitor response times

3. **Configuration Issues**

   - Check environment variables
   - Verify configuration files
   - Confirm logging configuration

## Security Considerations

1. **API Key Management**

   - Use environment variables
   - Avoid hardcoding
   - Rotate keys periodically

2. **Access Control**

   - Implement appropriate authentication
   - Limit API access
   - Monitor anomalous access

3. **Data Protection**

   - Encrypt sensitive data
   - Implement audit logging
   - Control log output
