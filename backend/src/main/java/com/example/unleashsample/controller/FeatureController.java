package com.example.unleashsample.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.unleashsample.service.FeatureFlagCache;

import io.getunleash.Unleash;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")  // 允许前端访问
public class FeatureController {
    private static final Logger logger = LoggerFactory.getLogger(FeatureController.class);
    private final Unleash unleash;
    private final FeatureFlagCache cache;

    public FeatureController(Unleash unleash, FeatureFlagCache cache) {
        this.unleash = unleash;
        this.cache = cache;
    }

    @GetMapping("/feature-check")
    public boolean checkFeature() {
        String featureName = "frontend-example-hello-world";
        logger.debug("Checking feature flag: {}", featureName);
        
        try {
            // Try to get from cache first
            Boolean cachedValue = cache.get(featureName);
            if (cachedValue != null) {
                logger.debug("Using cached value for feature '{}': {}", featureName, cachedValue);
                return cachedValue;
            }

            // If not in cache, check from Unleash
            boolean isEnabled = unleash.isEnabled(featureName);
            logger.debug("Feature flag '{}' status (from Unleash): {}", featureName, isEnabled);
            
            // Cache the result
            cache.set(featureName, isEnabled);
            
            return isEnabled;
        } catch (Exception e) {
            logger.error("Error checking feature flag: {}", e.getMessage(), e);
            return false;
        }
    }
}
