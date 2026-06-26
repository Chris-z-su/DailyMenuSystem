package com.shubao.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shubao.dto.MenuCreateDTO;
import com.shubao.entity.*;
import com.shubao.mapper.MenuMapper;
import com.shubao.service.CategoryService;
import com.shubao.service.MenuService;
import com.shubao.service.RecipeService;
import com.shubao.service.UserService;
import com.shubao.vo.MenuVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MenuServiceImpl extends ServiceImpl<MenuMapper, Menu> implements MenuService {

    @Resource
    private RecipeService recipeService;
    @Resource
    private UserService userService;
    @Resource
    private CategoryService categoryService;

    @Override
    public List<Menu> getMenusByDate(LocalDate date) {
        return baseMapper.selectByDate(date);
    }

    @Override
    public List<Menu> getMenusByMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(YearMonth.of(year, month).lengthOfMonth());
        return baseMapper.selectBetweenDates(start, end);
    }

    @Override
    public List<MenuVO> getMenusByDateWithDetail(LocalDate date) {
        List<Menu> menus = getMenusByDate(date);
        return menus.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public Menu createMenu(MenuCreateDTO dto, Integer userId) {
        try {
            System.out.println("Service层 - 开始创建菜单");
            System.out.println("DTO: " + dto);

            Menu menu = new Menu();
            BeanUtil.copyProperties(dto, menu);
            if (dto.getIsCustom() != null && dto.getIsCustom() == 1) {
                menu.setRecipeId(null);
            }
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
        } catch (Exception e) {
            System.err.println("Service层创建菜单失败");
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Menu updateMenu(Integer id, MenuCreateDTO dto, Integer userId) {
        Menu menu = this.getById(id);
        if (menu == null) {
            throw new RuntimeException("菜单不存在");
        }
        BeanUtil.copyProperties(dto, menu);
        if (dto.getIsCustom() != null && dto.getIsCustom() == 1) {
            menu.setRecipeId(null);
        }
        menu.setUpdatedBy(userId);
        this.updateById(menu);
        return menu;
    }

    @Override
    public MenuVO getMenuDetail(Integer id) {
        Menu menu = this.getById(id);
        if (menu == null) {
            return null;
        }
        return convertToVO(menu);
    }

    @Override
    public void restoreMenu(Integer id) {
        Menu menu = this.getById(id);
        if (menu != null) {
            menu.setIsDeleted(0);
            this.updateById(menu);
        }
    }

    private MenuVO convertToVO(Menu menu) {
        MenuVO vo = new MenuVO();
        BeanUtil.copyProperties(menu, vo);
        Category category = categoryService.getById(menu.getCategoryId());
        if (category != null) {
            vo.setCategoryName(category.getName());
        }
        if (menu.getRecipeId() != null && menu.getIsCustom() == 0) {
            Recipe recipe = recipeService.getById(menu.getRecipeId());
            if (recipe != null) {
                vo.setRecipeName(recipe.getName());
            }
        }
        User user = userService.getById(menu.getCreatedBy());
        if (user != null) {
            vo.setCreatedBy(user.getUsername());
        }
        return vo;
    }
}
