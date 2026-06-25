package com.shubao.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shubao.entity.User;
import com.shubao.mapper.UserMapper;
import com.shubao.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    @Override
    public User findByUsername(String username) {
        return baseMapper.findByUsername(username);
    }
}
