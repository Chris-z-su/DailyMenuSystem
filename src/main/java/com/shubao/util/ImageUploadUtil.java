package com.shubao.util;

import cn.hutool.core.io.FileTypeUtil;
import cn.hutool.core.io.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class ImageUploadUtil {

    @Value("${upload.base-path}")
    private String basePath;

    @Value("${upload.access-url}")
    private String accessUrl;

    @Value("${upload.max-size}")
    private Long maxSize;

    /**
     * 上传菜谱图片
     * @param file 上传的文件
     * @return 访问 URL 和相对路径
     */
    public ImageUploadResult uploadRecipeImage(MultipartFile file) throws IOException {
        return uploadImage(file, "recipes");
    }

    /**
     * 通用图片上传
     * @param file 上传的文件
     * @param module 模块名称（recipes/menus）
     * @return 上传结果
     */
    public ImageUploadResult uploadImage(MultipartFile file, String module) throws IOException {
        // 1. 校验文件
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 2. 校验文件大小
        if (file.getSize() > maxSize * 1024 * 1024) {
            throw new IllegalArgumentException("文件大小超过限制：" + maxSize + "MB");
        }

        // 3. 获取原始文件名和扩展名
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        // 检查图片类型
        // 通过文件流判断类型
        try (InputStream is = file.getInputStream()) {
            String type = FileTypeUtil.getType(is);
            if (!"jpg".equalsIgnoreCase(type) &&
                    !"jpeg".equalsIgnoreCase(type) &&
                    !"png".equalsIgnoreCase(type) &&
                    !"gif".equalsIgnoreCase(type) &&
                    !"webp".equalsIgnoreCase(type)) {
                throw new IllegalArgumentException("不支持的图片格式：" + type);
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("无法读取文件");
        }

        // 4. 生成存储路径：/模块/年/月/随机文件名.后缀
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String fileName = UUID.randomUUID().toString().replace("-", "") + ext;
        String relativePath = module + "/" + datePath + "/" + fileName;
        String fullPath = basePath + "/" + relativePath;

        // 5. 创建目录并保存文件
        File destFile = new File(fullPath);
        if (!destFile.getParentFile().exists()) {
            destFile.getParentFile().mkdirs();
        }
        file.transferTo(destFile);

        // 6. 返回访问 URL 和相对路径
        String accessUrlPath = accessUrl + relativePath;
        return new ImageUploadResult(accessUrlPath, relativePath, fileName);
    }

    /**
     * 删除图片
     * @param relativePath 相对路径
     * @return 是否删除成功
     */
    public boolean deleteImage(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            return false;
        }
        String fullPath = basePath + "/" + relativePath;
        return FileUtil.del(fullPath);
    }

    /**
     * 图片上传结果
     */
    public static class ImageUploadResult {
        private String accessUrl;   // 访问 URL，如 /images/recipes/2026/06/xxx.jpg
        private String relativePath; // 相对路径，如 recipes/2026/06/xxx.jpg
        private String fileName;     // 文件名

        public ImageUploadResult(String accessUrl, String relativePath, String fileName) {
            this.accessUrl = accessUrl;
            this.relativePath = relativePath;
            this.fileName = fileName;
        }

        // Getters and Setters
        public String getAccessUrl() { return accessUrl; }
        public void setAccessUrl(String accessUrl) { this.accessUrl = accessUrl; }
        public String getRelativePath() { return relativePath; }
        public void setRelativePath(String relativePath) { this.relativePath = relativePath; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
    }
}