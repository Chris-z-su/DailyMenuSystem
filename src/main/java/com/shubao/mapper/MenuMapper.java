package com.shubao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shubao.entity.Menu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface MenuMapper extends BaseMapper<Menu> {
    @Select("SELECT * FROM menu WHERE date = #{date} AND is_deleted = 0 ORDER BY sort_order")
    List<Menu> selectByDate(@Param("date") LocalDate date);

    @Select("SELECT * FROM menu WHERE date BETWEEN #{start} AND #{end} AND is_deleted = 0 ORDER BY date, sort_order")
    List<Menu> selectBetweenDates(@Param("start") LocalDate start, @Param("end") LocalDate end);
}