package com.shubao.filter;

import com.shubao.entity.User;
import com.shubao.service.UserService;
import com.shubao.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // 对于OPTIONS请求直接放行
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String token = request.getHeader("Authorization");
        System.out.println("========== JWT Filter ==========");
        System.out.println("请求URL: " + request.getRequestURI());
        System.out.println("Authorization头: " + token);

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            System.out.println("提取的Token: " + token);

            try {
                String username = jwtUtil.verifyToken(token);
                System.out.println("Token中的用户名: " + username);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // 从数据库获取用户完整信息
                    User user = userService.findByUsername(username);
                    System.out.println("数据库查询到的用户: " + user);

                    if (user != null) {
                        System.out.println("用户角色: " + user.getRole());

                        // 构建权限列表 - 关键：必须添加 ROLE_ 前缀
                        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
                        System.out.println("添加的权限: ROLE_" + user.getRole());

                        UserDetails userDetails = org.springframework.security.core.userdetails.User
                                .withUsername(username)
                                .password("")
                                .authorities(authorities)
                                .build();

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        System.out.println("✅ 认证成功，用户: " + username + ", 权限: " + authorities);
                    } else {
                        System.out.println("❌ 用户不存在: " + username);
                    }
                }
            } catch (Exception e) {
                System.out.println("❌ JWT 验证失败: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("没有Token或格式错误");
        }

        System.out.println("当前认证状态: " + SecurityContextHolder.getContext().getAuthentication());
        System.out.println("=================================");

        chain.doFilter(request, response);
    }
}