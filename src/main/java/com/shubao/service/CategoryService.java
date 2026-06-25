package com.shubao.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shubao.entity.Category;

import java.util.List;

public interface CategoryService extends IService<Category> {
    List<Category> getCategoriesByType(String type);
}