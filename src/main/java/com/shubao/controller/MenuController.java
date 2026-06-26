package com.shubao.controller;

import com.shubao.dto.MenuCreateDTO;
import com.shubao.entity.Menu;
import com.shubao.service.MenuService;
import com.shubao.vo.MenuVO;
import com.shubao.vo.Result;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
@Validated
public class MenuController {

    @Resource
    private MenuService menuService;

    @GetMapping("/date")
    public Result<List<MenuVO>> getByDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<MenuVO> menus = menuService.getMenusByDateWithDetail(localDate);
        return Result.success(menus);
    }

    @GetMapping("/month")
    public Result<List<Menu>> getByMonth(@RequestParam int year, @RequestParam int month) {
        List<Menu> menus = menuService.getMenusByMonth(year, month);
        return Result.success(menus);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")  // 修改为更明确的写法,  注意：ROLE_ 前缀会自动添加
    public Result<Menu> create(@Valid @RequestBody MenuCreateDTO dto) {
        System.out.println("========== 开始创建菜单 ==========");
        System.out.println("接收到的数据: " + dto);
        System.out.println("日期: " + dto.getDate());
        System.out.println("名称: " + dto.getName());
        System.out.println("分类ID: " + dto.getCategoryId());
        System.out.println("菜谱ID: " + dto.getRecipeId());
        System.out.println("是否自定义: " + dto.getIsCustom());
        System.out.println("自定义内容: " + dto.getCustomContent());

        // 获取当前认证信息
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("认证对象: " + auth);
        System.out.println("用户名: " + auth.getName());
        System.out.println("权限列表: " + auth.getAuthorities());
        System.out.println("是否已认证: " + auth.isAuthenticated());

        System.out.println("接收到的数据: " + dto);

        Integer userId = getCurrentUserId();
        System.out.println("用户ID: " + userId);

        Menu menu = menuService.createMenu(dto, userId);
        System.out.println("创建成功，菜单ID: " + menu.getId());
        System.out.println("========== 创建完成 ==========");

        return Result.success("创建成功", menu);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Menu> update(@PathVariable Integer id, @Valid @RequestBody MenuCreateDTO dto) {
        Integer userId = getCurrentUserId();
        Menu menu = menuService.updateMenu(id, dto, userId);
        return Result.success("更新成功", menu);
    }

    @DeleteMapping("/soft/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Void> softDelete(@PathVariable Integer id) {
        menuService.removeById(id);
        return Result.success("删除成功");
    }

    @DeleteMapping("/hard/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> hardDelete(@PathVariable Integer id) {
        menuService.getBaseMapper().deleteById(id);
        return Result.success("永久删除成功");
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Void> restore(@PathVariable Integer id) {
        menuService.restoreMenu(id);
        return Result.success("恢复成功");
    }

    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        // 根据用户名查询用户ID
        if ("admin".equals(username)) {
            return 1;
        }
        if ("user".equals(username)) {
            return 2;
        }
        return 1;
    }
}