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
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public Result<Menu> create(@Valid @RequestBody MenuCreateDTO dto) {
        Integer userId = getCurrentUserId();
        Menu menu = menuService.createMenu(dto, userId);
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
        // 实际从数据库查询用户ID，此处简化
        return 1;
    }
}