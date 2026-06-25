package com.shubao.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("menu")
public class Menu {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private LocalDate date;
    private String name;
    private Integer categoryId;
    private Integer recipeId; // 关联菜谱ID
    private String description;
    private String imageUrl;
    private String customContent; // 自定义内容
    private Integer isCustom; // 0-使用菜谱 1-自定义
    private Integer sortOrder;

    @TableLogic
    private Integer isDeleted; // 软删除

    private Integer createdBy;
    private Integer updatedBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
