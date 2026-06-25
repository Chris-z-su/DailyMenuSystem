package com.shubao.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shubao.dto.MenuCreateDTO;
import com.shubao.dto.MenuVO;
import com.shubao.entity.*;
import com.shubao.mapper.MenuMapper;
import com.shubao.service.MenuService;
import com.shubao.service.RecipeService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MenuServiceImpl extends ServiceImpl<MenuMapper, Menu> implements MenuService {

    @Resource
    private RecipeService recipeService;

    @Override
    public Menu createMenu(MenuCreateDTO dto, Integer userId) {
        Menu menu = new Menu();
        BeanUtil.copyProperties(dto, menu);

        // 如果是自定义菜单且不保存为菜谱
        if (dto.getIsCustom() != null && dto.getIsCustom() == 1) {
            menu.setRecipeId(null);
        }

        // 验证关联的菜谱是否存在
        if (dto.getRecipeId() != null && dto.getIsCustom() == 0) {
            Recipe recipe = recipeService.getById(dto.getRecipeId());
            if (recipe == null) {
                throw new RuntimeException("关联的菜谱不存在");
            }
        }

        menu.setCreatedBy(userId);
        menu.setUpdatedBy(userId);
        this.save(menu);
        return menu;
    }

    @Override
    public MenuVO getMenuDetail(Integer id) {
        Menu menu = this.getById(id);
        if (menu == null) {
            return null;
        }

        MenuVO vo = new MenuVO();
        BeanUtil.copyProperties(menu, vo);

        // 获取分类名称
        Category category = categoryService.getById(menu.getCategoryId());
        if (category != null) {
            vo.setCategoryName(category.getName());
        }

        // 获取菜谱名称
        if (menu.getRecipeId() != null && menu.getIsCustom() == 0) {
            Recipe recipe = recipeService.getById(menu.getRecipeId());
            if (recipe != null) {
                vo.setRecipeName(recipe.getName());
            }
        }

        // 获取创建人
        User user = userService.getById(menu.getCreatedBy());
        if (user != null) {
            vo.setCreatedBy(user.getUsername());
        }

        return vo;
    }

    @Override
    public List<MenuVO> getMenusByDateWithDetail(LocalDate date) {
        List<Menu> menus = this.getMenusByDate(date);
        return menus.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }
}