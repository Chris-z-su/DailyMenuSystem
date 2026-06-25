package com.shubao.vo;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MenuVO {
    private Integer id;
    private LocalDate date;
    private String name;
    private Integer categoryId;
    private String categoryName;
    private Integer recipeId;
    private String recipeName;
    private String description;
    private String imageUrl;
    private String customContent;
    private Integer isCustom;
    private Integer sortOrder;
    private String createdBy;
    private LocalDateTime createdAt;
}
