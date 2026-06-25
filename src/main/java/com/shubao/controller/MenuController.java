package com.shubao.controller;

import com.shubao.dto.MenuCreateDTO;
import com.shubao.dto.MenuVO;
import com.shubao.entity.Recipe;
import com.shubao.service.MenuService;
import com.shubao.service.RecipeService;
import com.shubao.vo.Result;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin
public class MenuController {

    @Resource
    private MenuService menuService;

    @Resource
    private RecipeService recipeService;

    // 获取某天菜单（含菜谱详情）
    @GetMapping("/date")
    public Result<List<MenuVO>> getByDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<MenuVO> menus = menuService.getMenusByDateWithDetail(localDate);
        return Result.success(menus);
    }

    // 创建菜单（支持选择已有菜谱或自定义）
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Menu> createMenu(@Valid @RequestBody MenuCreateDTO dto) {
        Integer userId = getCurrentUserId();
        Menu menu = menuService.createMenu(dto, userId);
        return Result.success("创建成功", menu);
    }

    // 获取关联菜谱的选项（用于下拉选择）
    @GetMapping("/recipe-options")
    public Result<List<RecipeOptionDTO>> getRecipeOptions() {
        List<Recipe> recipes = recipeService.getPublicRecipes();
        List<RecipeOptionDTO> options = recipes.stream()
                .map(r -> {
                    RecipeOptionDTO option = new RecipeOptionDTO();
                    option.setId(r.getId());
                    option.setName(r.getName());
                    option.setCategoryId(r.getCategoryId());
                    return option;
                })
                .collect(Collectors.toList());
        return Result.success(options);
    }
}