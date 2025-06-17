# Backend Integration Guide for Unleash (Java/Spring Boot)

本指南将帮助你在 Java Spring Boot 项目中集成 Unleash 功能开关系统。这个指南基于我们的[示例项目](../README.md)中的实际实现。

## 快速链接

### 核心实现文件
- [UnleashConfiguration.java](../backend/src/main/java/com/example/unleashsample/config/UnleashConfiguration.java) - Unleash 客户端配置
- [FeatureController.java](../backend/src/main/java/com/example/unleashsample/controller/FeatureController.java) - 功能开关 API 实现
- [UnleashApplication.java](../backend/src/main/java/com/example/unleashsample/UnleashApplication.java) - Spring Boot 应用入口

### 配置文件
- [application.properties](../backend/src/main/resources/application.properties) - 应用配置
- [pom.xml](../backend/pom.xml) - Maven 项目配置和依赖管理

## 前置条件

- Java 17+
- Maven 3.8+
- Spring Boot 3.x
- 运行中的 Unleash 服务器 (http://localhost:4242)

## 步骤 1: 添加依赖

在 `pom.xml` 中添加 Unleash Java 客户端依赖：

```xml
<dependencies>
    <!-- Spring Boot 依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Unleash 客户端依赖 -->
    <dependency>
        <groupId>io.getunleash</groupId>
        <artifactId>unleash-client-java</artifactId>
        <version>8.0.0</version>
    </dependency>
</dependencies>
```

## 步骤 2: 配置 Unleash 客户端

创建 Unleash 配置类（参考 [UnleashConfiguration.java](../backend/src/main/java/com/example/unleashsample/config/UnleashConfiguration.java) 的实现）：

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

## 步骤 3: 创建功能开关控制器

参考 [FeatureController.java](../backend/src/main/java/com/example/unleashsample/controller/FeatureController.java) 的实现：

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

## 步骤 4: 配置应用属性

在 `application.properties` 或 `application.yml` 中添加配置（参考 [application.properties](../backend/src/main/resources/application.properties) 的实现）：

```properties
# 服务器配置
server.port=8080

# 日志配置
logging.level.io.getunleash=DEBUG

# Unleash 特定配置
unleash.environment=development
```

## 最佳实践

1. **配置管理**
   ```java
   @Configuration
   @ConfigurationProperties(prefix = "unleash")
   public class UnleashProperties {
       private String apiUrl;
       private String apiToken;
       // getters and setters
   }
   ```

2. **异常处理**
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

3. **服务层封装**
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

## 高级用法

1. **使用上下文**
```java
UnleashContext context = UnleashContext.builder()
    .userId(user.getId())
    .sessionId(session.getId())
    .remoteAddress(request.getRemoteAddr())
    .addProperty("customField", "customValue")
    .build();

boolean enabled = unleash.isEnabled("my-feature", context);
```

2. **自定义策略**
```java
public class CustomStrategy implements Strategy {
    @Override
    public String getName() {
        return "custom";
    }

    @Override
    public boolean isEnabled(Map<String, String> parameters, UnleashContext context) {
        // 实现自定义逻辑
        return true;
    }
}
```

3. **变体支持**
```java
Variant variant = unleash.getVariant("my-feature");
switch (variant.getName()) {
    case "A":
        // 实现 A 变体
        break;
    case "B":
        // 实现 B 变体
        break;
    default:
        // 默认实现
}
```

## 测试

1. **单元测试**
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

2. **集成测试**
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

## 监控和度量

1. **添加度量收集**
```java
@Bean
public UnleashMetricService unleashMetricService(Unleash unleash) {
    return new UnleashMetricService(unleash);
}
```

2. **自定义度量处理**
```java
public class CustomMetricSubscriber implements UnleashSubscriber {
    @Override
    public void onCount(String name, boolean enabled) {
        // 实现度量收集逻辑
    }
}
```

## 部署检查清单

- [ ] 验证 Unleash 服务器配置
- [ ] 确认 API 密钥设置
- [ ] 检查日志级别配置
- [ ] 测试所有功能开关
- [ ] 验证错误处理
- [ ] 确认监控配置
- [ ] 检查性能影响

## 常见问题解决

1. **连接问题**
   - 检查 Unleash 服务器地址
   - 验证网络连接
   - 确认 API 密钥正确

2. **性能问题**
   - 调整同步间隔
   - 检查缓存配置
   - 监控响应时间

3. **配置问题**
   - 检查环境变量
   - 验证配置文件
   - 确认日志配置

## 安全考虑

1. **API 密钥管理**
   - 使用环境变量
   - 避免硬编码
   - 定期轮换密钥

2. **访问控制**
   - 实现适当的认证
   - 限制 API 访问
   - 监控异常访问

3. **数据保护**
   - 加密敏感数据
   - 实现审计日志
   - 控制日志输出
