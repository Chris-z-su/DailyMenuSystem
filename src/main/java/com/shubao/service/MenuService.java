package com.shubao.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shubao.dto.MenuCreateDTO;
import com.shubao.entity.Menu;
import com.shubao.entity.Recipe;
import com.shubao.vo.MenuVO;

import java.time.LocalDate;
import java.util.List;

public interface MenuService extends IService<Menu> {
    List<Menu> getMenusByDate(LocalDate date);
    List<Menu> getMenusByMonth(int year, int month);
    List<MenuVO> getMenusByDateWithDetail(LocalDate date);
    Menu createMenu(MenuCreateDTO dto, Integer userId);
    Menu updateMenu(Integer id, MenuCreateDTO dto, Integer userId);
    MenuVO getMenuDetail(Integer id);
    void restoreMenu(Integer id);
}
