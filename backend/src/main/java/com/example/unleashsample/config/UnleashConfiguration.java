package com.example.unleashsample.config;

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
                .appName("default")
                .instanceId("unleash-sample-backend")
                .unleashAPI("http://localhost:4242/api/")
                .synchronousFetchOnInitialisation(true)
                .customHttpHeader("Authorization", "default:development.unleash-insecure-api-token")
                .fetchTogglesInterval(5)
                .build();

        return new DefaultUnleash(config);
    }
}
