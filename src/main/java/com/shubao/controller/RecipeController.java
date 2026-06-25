package com.shubao.controller;

import com.shubao.dto.RecipeDTO;
import com.shubao.entity.Recipe;
import com.shubao.service.RecipeService;
import com.shubao.vo.Result;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipe")
@Validated
public class RecipeController {

    @Resource
    private RecipeService recipeService;

    @GetMapping("/public")
    public Result<List<Recipe>> getPublicRecipes() {
        List<Recipe> recipes = recipeService.getPublicRecipes();
        return Result.success(recipes);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<List<Recipe>> getMyRecipes() {
        Integer userId = getCurrentUserId();
        List<Recipe> recipes = recipeService.getUserRecipes(userId);
        return Result.success(recipes);
    }

    @GetMapping("/search")
    public Result<List<Recipe>> search(@RequestParam String keyword) {
        List<Recipe> recipes = recipeService.searchRecipes(keyword);
        return Result.success(recipes);
    }

    @GetMapping("/{id}")
    public Result<Recipe> getDetail(@PathVariable Integer id) {
        Recipe recipe = recipeService.getById(id);
        if (recipe == null) {
            return Result.error("菜谱不存在");
        }
        return Result.success(recipe);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Recipe> create(@Valid @RequestBody RecipeDTO dto) {
        Integer userId = getCurrentUserId();
        Recipe recipe = recipeService.createRecipe(dto, userId);
        return Result.success("创建成功", recipe);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Recipe> update(@PathVariable Integer id, @Valid @RequestBody RecipeDTO dto) {
        Integer userId = getCurrentUserId();
        Recipe recipe = recipeService.updateRecipe(id, dto, userId);
        return Result.success("更新成功", recipe);
    }

    @DeleteMapping("/soft/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Void> softDelete(@PathVariable Integer id) {
        recipeService.deleteRecipe(id, true);
        return Result.success("删除成功");
    }

    @DeleteMapping("/hard/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> hardDelete(@PathVariable Integer id) {
        recipeService.deleteRecipe(id, false);
        return Result.success("永久删除成功");
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Void> restore(@PathVariable Integer id) {
        recipeService.restoreRecipe(id);
        return Result.success("恢复成功");
    }

    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // 简化处理，实际从数据库查询
        return 1;
    }
}