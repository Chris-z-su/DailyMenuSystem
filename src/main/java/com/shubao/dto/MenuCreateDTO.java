package com.shubao.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class MenuCreateDTO {
    @NotNull(message = "日期不能为空")
    private LocalDate date;

    @NotNull(message = "菜品名称不能为空")
    private String name;

    @NotNull(message = "分类不能为空")
    private Integer categoryId;

    private Integer recipeId; // 可选，关联菜谱
    private String description;
    private String imageUrl;
    private String customContent; // 自定义内容
    private Integer isCustom; // 0-使用菜谱 1-自定义
    private Integer sortOrder;
}