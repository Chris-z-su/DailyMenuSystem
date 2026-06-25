package com.shubao.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

public class ImageUtil {
    public static String saveImage(MultipartFile file, String uploadDir) throws IOException {
        if (file.isEmpty()) return null;
        String originalName = file.getOriginalFilename();
        String ext = originalName.substring(originalName.lastIndexOf("."));
        String newName = UUID.randomUUID().toString() + ext;
        File dest = new File(uploadDir, newName);
        if (!dest.getParentFile().exists()) dest.getParentFile().mkdirs();
        file.transferTo(dest);
        return "/uploads/" + newName;
    }
}