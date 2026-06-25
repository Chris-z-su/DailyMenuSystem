package com.shubao.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shubao.entity.User;

public interface UserService extends IService<User> {
    User findByUsername(String username);
}