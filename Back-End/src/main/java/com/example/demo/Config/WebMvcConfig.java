package com.example.demo.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối đến thư mục storage
        // Thử nhiều cách để tìm đúng thư mục
        String userDir = System.getProperty("user.dir");
        String storagePath;
        
        // Kiểm tra xem đang chạy từ Back-End hay từ root
        java.io.File storageDir = new java.io.File(userDir, "storage");
        if (!storageDir.exists()) {
            storageDir = new java.io.File(userDir, "Back-End/storage");
        }
        
        storagePath = "file:" + storageDir.getAbsolutePath().replace("\\", "/") + "/";
        
        System.out.println("=== User dir: " + userDir);
        System.out.println("=== Storage path configured: " + storagePath);
        System.out.println("=== Storage exists: " + storageDir.exists());
        
        registry.addResourceHandler("/storage/**")
                .addResourceLocations(storagePath)
                .setCachePeriod(0); // No cache for development
    }
}

