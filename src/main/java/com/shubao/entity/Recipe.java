package com.shubao.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("recipe")
public class Recipe {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private String name;
    private Integer categoryId;
    private String description;
    private String content;
    private String imageUrls; // JSON数组
    private Integer prepTime;
    private Integer cookTime;
    private String difficulty; // EASY, MEDIUM, HARD
    private Integer isPublic;

    @TableLogic
    private Integer isDeleted;

    private Integer createdBy;
    private Integer updatedBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
