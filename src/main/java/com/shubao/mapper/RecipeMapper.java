package com.shubao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shubao.entity.Recipe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface RecipeMapper extends BaseMapper<Recipe> {

    @Select("SELECT r.*, c.name as categoryName FROM recipe r " +
            "LEFT JOIN category c ON r.category_id = c.id " +
            "WHERE r.is_deleted = 0 AND r.is_public = 1 " +
            "ORDER BY r.created_at DESC")
    List<Recipe> selectPublicRecipes();

    @Select("SELECT r.*, c.name as categoryName FROM recipe r " +
            "LEFT JOIN category c ON r.category_id = c.id " +
            "WHERE r.is_deleted = 0 AND r.created_by = #{userId} " +
            "ORDER BY r.created_at DESC")
    List<Recipe> selectUserRecipes(@Param("userId") Integer userId);
}