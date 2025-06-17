package com.example.unleashsample.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.getunleash.Unleash;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")  // 允许前端访问
public class FeatureController {

    private final Unleash unleash;

    public FeatureController(Unleash unleash) {
        this.unleash = unleash;
    }

    @GetMapping("/feature-check")
    public boolean checkFeature() {
        String featureName = "frontend-example-hello-world";
        System.out.println("Checking feature flag: " + featureName);
        try {
            boolean isEnabled = unleash.isEnabled(featureName);
            System.out.println("Feature flag '" + featureName + "' status: " + isEnabled);
            return isEnabled;
        } catch (Exception e) {
            System.err.println("Error checking feature flag: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
