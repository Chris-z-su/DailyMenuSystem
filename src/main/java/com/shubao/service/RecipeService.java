package com.shubao.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shubao.entity.Recipe;
import com.shubao.dto.RecipeDTO;
import java.util.List;

public interface RecipeService extends IService<Recipe> {
    List<Recipe> getPublicRecipes();
    List<Recipe> getUserRecipes(Integer userId);
    Recipe createRecipe(RecipeDTO dto, Integer userId);
    Recipe updateRecipe(Integer id, RecipeDTO dto, Integer userId);
    void deleteRecipe(Integer id, boolean soft);
    void restoreRecipe(Integer id);
    List<Recipe> searchRecipes(String keyword);
}

