package com.shubao.controller;

import com.shubao.util.ImageUploadUtil;
import com.shubao.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private ImageUploadUtil imageUploadUtil;

    /**
     * 上传菜谱图片
     */
    @PostMapping("/recipe-image")
    public Result<Map<String, String>> uploadRecipeImage(@RequestParam("file") MultipartFile file) {
        try {
            ImageUploadUtil.ImageUploadResult result = imageUploadUtil.uploadRecipeImage(file);
            Map<String, String> data = new HashMap<>();
            data.put("url", result.getAccessUrl());
            data.put("relativePath", result.getRelativePath());
            return Result.success("上传成功", data);
        } catch (Exception e) {
            return Result.error("上传失败：" + e.getMessage());
        }
    }
}