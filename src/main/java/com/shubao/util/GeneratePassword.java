package com.shubao.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "admin123";
        String encoded = encoder.encode(password);

        System.out.println("原始密码: " + password);
        System.out.println("加密后: " + encoded);

        // 验证是否匹配
        boolean matches = encoder.matches(password, encoded);
        System.out.println("验证结果: " + matches);

        // 用于 user 用户
        System.out.println("\n--- user123 的加密密码 ---");
        String userPassword = "user123";
        String userEncoded = encoder.encode(userPassword);
        System.out.println("原始密码: " + userPassword);
        System.out.println("加密后: " + userEncoded);
    }
}