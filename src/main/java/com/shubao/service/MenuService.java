package com.shubao.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shubao.dto.MenuCreateDTO;
import com.shubao.dto.MenuVO;
import com.shubao.entity.Menu;
import com.shubao.entity.Recipe;

import java.time.LocalDate;
import java.util.List;

public interface MenuService extends IService<Menu> {
    Menu createMenu(MenuCreateDTO dto, Integer userId);
    MenuVO getMenuDetail(Integer id);
    List<MenuVO> getMenusByDateWithDetail(LocalDate date);
}
