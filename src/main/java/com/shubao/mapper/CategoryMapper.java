package com.shubao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shubao.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
    @Select("SELECT * FROM category WHERE type = #{type} AND parent_id = 0 ORDER BY sort_order")
    List<Category> selectByType(String type);
}