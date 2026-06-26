package com.shubao.controller;

import com.shubao.entity.Category;
import com.shubao.service.CategoryService;
import com.shubao.vo.Result;
import jakarta.annotation.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{id}")
    public Result<Category> getById(@PathVariable Integer id) {
        Category category = categoryService.getById(id);
        return Result.success(category);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Category> create(@RequestBody Category category) {
        category.setParentId(0); // 简化，仅支持顶级分类
        categoryService.save(category);
        return Result.success(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Category> update(@PathVariable Integer id, @RequestBody Category category) {
        category.setId(id);
        categoryService.updateById(category);
        return Result.success(category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Void> delete(@PathVariable Integer id) {
        categoryService.removeById(id); // 软删除
        return Result.success("删除成功");
    }
}