package com.example.unleashsample.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

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
        if (entry == null) {
            return null;
        }

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
