package com.shubao.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class RecipeDTO {
    private Integer id;

    @NotNull(message = "菜谱名称不能为空")
    private String name;

    @NotNull(message = "分类不能为空")
    private Integer categoryId;

    private String description;
    private String content;
    private List<String> imageUrls;  // 存储多个图片URL
    private Integer prepTime;
    private Integer cookTime;
    private String difficulty;
    private Integer isPublic;
}