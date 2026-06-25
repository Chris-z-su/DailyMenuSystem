package com.shubao.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shubao.entity.Category;
import com.shubao.mapper.CategoryMapper;
import com.shubao.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {
    @Override
    public List<Category> getCategoriesByType(String type) {
        return baseMapper.selectByType(type);
    }
}