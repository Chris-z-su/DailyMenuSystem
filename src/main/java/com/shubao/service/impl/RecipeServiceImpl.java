package com.shubao.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shubao.dto.RecipeDTO;
import com.shubao.entity.Recipe;
import com.shubao.mapper.RecipeMapper;
import com.shubao.service.RecipeService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RecipeServiceImpl extends ServiceImpl<RecipeMapper, Recipe> implements RecipeService {

    @Resource
    private RecipeMapper recipeMapper;

    @Override
    public List<Recipe> getPublicRecipes() {
        return recipeMapper.selectPublicRecipes();
    }

    @Override
    public List<Recipe> getUserRecipes(Integer userId) {
        return recipeMapper.selectUserRecipes(userId);
    }

    @Override
    public Recipe createRecipe(RecipeDTO dto, Integer userId) {
        Recipe recipe = new Recipe();
        BeanUtil.copyProperties(dto, recipe);

        // 处理图片列表
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            recipe.setImageUrls(JSON.toJSONString(dto.getImageUrls()));
        }

        recipe.setCreatedBy(userId);
        recipe.setUpdatedBy(userId);
        recipe.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : 1);

        this.save(recipe);
        return recipe;
    }

    @Override
    public Recipe updateRecipe(Integer id, RecipeDTO dto, Integer userId) {
        Recipe recipe = this.getById(id);
        if (recipe == null) {
            throw new RuntimeException("菜谱不存在");
        }

        BeanUtil.copyProperties(dto, recipe);

        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            recipe.setImageUrls(JSON.toJSONString(dto.getImageUrls()));
        }

        recipe.setUpdatedBy(userId);
        this.updateById(recipe);
        return recipe;
    }

    @Override
    public void deleteRecipe(Integer id, boolean soft) {
        if (soft) {
            this.removeById(id); // 软删除
        } else {
            this.getBaseMapper().deleteById(id); // 物理删除
        }
    }

    @Override
    public void restoreRecipe(Integer id) {
        Recipe recipe = this.getById(id);
        if (recipe != null) {
            recipe.setIsDeleted(0);
            this.updateById(recipe);
        }
    }

    @Override
    public List<Recipe> searchRecipes(String keyword) {
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StrUtil.isNotBlank(keyword), Recipe::getName, keyword)
                .or().like(StrUtil.isNotBlank(keyword), Recipe::getDescription, keyword)
                .eq(Recipe::getIsPublic, 1)
                .eq(Recipe::getIsDeleted, 0)
                .orderByDesc(Recipe::getCreatedAt);
        return this.list(wrapper);
    }
}
