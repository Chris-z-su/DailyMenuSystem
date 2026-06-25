-- schema.sql
CREATE DATABASE IF NOT EXISTS daily_menu DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE daily_menu;

-- 用户表
CREATE TABLE `user` (
                        `id` INT PRIMARY KEY AUTO_INCREMENT,
                        `username` VARCHAR(50) NOT NULL UNIQUE,
                        `password` VARCHAR(255) NOT NULL,
                        `role` VARCHAR(20) DEFAULT 'USER',
                        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 分类表（支持多级分类，用于菜单和菜谱）
CREATE TABLE `category` (
                            `id` INT PRIMARY KEY AUTO_INCREMENT,
                            `name` VARCHAR(50) NOT NULL,
                            `parent_id` INT DEFAULT 0,
                            `type` VARCHAR(20) DEFAULT 'MENU', -- MENU: 菜单分类, RECIPE: 菜谱分类
                            `sort_order` INT DEFAULT 0,
                            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            INDEX idx_parent_id (`parent_id`),
                            INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 菜谱表（独立管理）
CREATE TABLE `recipe` (
                          `id` INT PRIMARY KEY AUTO_INCREMENT,
                          `name` VARCHAR(100) NOT NULL,
                          `category_id` INT NOT NULL,
                          `description` TEXT,
                          `content` TEXT, -- 详细制作方法
                          `image_urls` TEXT, -- JSON数组存储多张图片
                          `prep_time` INT DEFAULT 0, -- 准备时间（分钟）
                          `cook_time` INT DEFAULT 0, -- 烹饪时间（分钟）
                          `difficulty` VARCHAR(20) DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
                          `is_public` TINYINT DEFAULT 1, -- 是否公开
                          `is_deleted` TINYINT DEFAULT 0,
                          `created_by` INT,
                          `updated_by` INT,
                          `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                          `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (`category_id`) REFERENCES `category`(`id`),
                          INDEX idx_category (`category_id`),
                          INDEX idx_is_deleted (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 菜单表（每日菜单）
CREATE TABLE `menu` (
                        `id` INT PRIMARY KEY AUTO_INCREMENT,
                        `date` DATE NOT NULL,
                        `name` VARCHAR(100) NOT NULL,
                        `category_id` INT NOT NULL,
                        `recipe_id` INT DEFAULT NULL, -- 关联菜谱，可为空
                        `description` TEXT,
                        `image_url` VARCHAR(255),
                        `custom_content` TEXT, -- 自定义内容（不保存为菜谱时使用）
                        `is_custom` TINYINT DEFAULT 0, -- 是否自定义（不保存为菜谱）
                        `sort_order` INT DEFAULT 0,
                        `is_deleted` TINYINT DEFAULT 0,
                        `created_by` INT,
                        `updated_by` INT,
                        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (`category_id`) REFERENCES `category`(`id`),
                        FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`),
                        INDEX idx_date (`date`),
                        INDEX idx_recipe (`recipe_id`),
                        INDEX idx_is_deleted (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化数据
INSERT INTO `category` (`name`, `parent_id`, `type`, `sort_order`) VALUES
                                                                       ('热菜', 0, 'MENU', 1),
                                                                       ('凉菜', 0, 'MENU', 2),
                                                                       ('水果', 0, 'MENU', 3),
                                                                       ('甜点', 0, 'MENU', 4),
                                                                       ('川菜', 0, 'RECIPE', 1),
                                                                       ('粤菜', 0, 'RECIPE', 2),
                                                                       ('鲁菜', 0, 'RECIPE', 3),
                                                                       ('湘菜', 0, 'RECIPE', 4),
                                                                       ('东北菜', 0, 'RECIPE', 5);

INSERT INTO `user` (`username`, `password`, `role`) VALUES
                                                        ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN'), -- password: admin123
                                                        ('user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'USER'); -- password: admin123

-- 示例菜谱数据
INSERT INTO `recipe` (`name`, `category_id`, `description`, `content`, `difficulty`, `created_by`) VALUES
                                                                                                       ('麻婆豆腐', 1, '经典川菜，麻辣鲜香', '1. 豆腐切块焯水\n2. 肉末炒香加入豆瓣酱\n3. 加入豆腐炖煮\n4. 勾芡出锅', 'MEDIUM', 1),
                                                                                                       ('宫保鸡丁', 1, '酸甜微辣，下饭好菜', '1. 鸡胸肉切丁腌制\n2. 花生米炸香\n3. 调汁炒制\n4. 收汁出锅', 'MEDIUM', 1),
                                                                                                       ('清炒时蔬', 1, '清淡健康，保留原味', '1. 蔬菜洗净切段\n2. 热油快炒\n3. 调味出锅', 'EASY', 1);