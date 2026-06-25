package com.shubao.controller;

import com.shubao.dto.RecipeDTO;
import com.shubao.entity.Recipe;
import com.shubao.service.RecipeService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipe")
@CrossOrigin
@Validated
public class RecipeController {

    @Resource
    private RecipeService recipeService;

    // 获取公开菜谱列表（无需登录）
    @GetMapping("/public")
    public Result<List<Recipe>> getPublicRecipes() {
        List<Recipe> recipes = recipeService.getPublicRecipes();
        return Result.success(recipes);
    }

    // 获取我的菜谱（需登录）
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<List<Recipe>> getMyRecipes() {
        Integer userId = getCurrentUserId();
        List<Recipe> recipes = recipeService.getUserRecipes(userId);
        return Result.success(recipes);
    }

    // 搜索菜谱
    @GetMapping("/search")
    public Result<List<Recipe>> searchRecipes(@RequestParam String keyword) {
        List<Recipe> recipes = recipeService.searchRecipes(keyword);
        return Result.success(recipes);
    }

    // 获取菜谱详情
    @GetMapping("/{id}")
    public Result<Recipe> getRecipeDetail(@PathVariable Integer id) {
        Recipe recipe = recipeService.getById(id);
        if (recipe == null) {
            return Result.error("菜谱不存在");
        }
        return Result.success(recipe);
    }

    // 创建菜谱（需登录）
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Recipe> createRecipe(@Valid @RequestBody RecipeDTO dto) {
        Integer userId = getCurrentUserId();
        Recipe recipe = recipeService.createRecipe(dto, userId);
        return Result.success("创建成功", recipe);
    }

    // 更新菜谱（需登录）
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Recipe> updateRecipe(@PathVariable Integer id,
                                       @Valid @RequestBody RecipeDTO dto) {
        Integer userId = getCurrentUserId();
        Recipe recipe = recipeService.updateRecipe(id, dto, userId);
        return Result.success("更新成功", recipe);
    }

    // 软删除菜谱
    @DeleteMapping("/soft/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Void> softDeleteRecipe(@PathVariable Integer id) {
        recipeService.deleteRecipe(id, true);
        return Result.success("删除成功");
    }

    // 物理删除菜谱（仅管理员）
    @DeleteMapping("/hard/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> hardDeleteRecipe(@PathVariable Integer id) {
        recipeService.deleteRecipe(id, false);
        return Result.success("永久删除成功");
    }

    // 恢复菜谱
    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Void> restoreRecipe(@PathVariable Integer id) {
        recipeService.restoreRecipe(id);
        return Result.success("恢复成功");
    }

    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // 从token或SecurityContext获取用户ID
        // 简化处理，实际从JWT中获取
        return 1;
    }
}