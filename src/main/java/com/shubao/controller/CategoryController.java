package com.shubao.controller;

import com.shubao.entity.Category;
import com.shubao.service.CategoryService;
import com.shubao.vo.Result;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Resource
    private CategoryService categoryService;

    @GetMapping("/list")
    public Result<List<Category>> list(@RequestParam(required = false) String type) {
        if (type == null) {
            return Result.success(categoryService.list());
        }
        return Result.success(categoryService.getCategoriesByType(type));
    }
}