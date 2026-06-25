# DailyMenuSystem

## 一、项目架构
```
DailyMenuSystem/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── dailymenu/
│   │   │           ├── DailyMenuApplication.java
│   │   │           ├── config/
│   │   │           │   ├── MybatisPlusConfig.java
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   └── WebConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── MenuController.java
│   │   │           │   ├── RecipeController.java
│   │   │           │   ├── CategoryController.java
│   │   │           │   └── AuthController.java
│   │   │           ├── entity/
│   │   │           │   ├── Menu.java
│   │   │           │   ├── Recipe.java
│   │   │           │   ├── Category.java
│   │   │           │   └── User.java
│   │   │           ├── dto/
│   │   │           │   ├── MenuDTO.java
│   │   │           │   ├── RecipeDTO.java
│   │   │           │   ├── MenuCreateDTO.java
│   │   │           │   └── RecipeCreateDTO.java
│   │   │           ├── mapper/
│   │   │           │   ├── MenuMapper.java
│   │   │           │   ├── RecipeMapper.java
│   │   │           │   ├── CategoryMapper.java
│   │   │           │   └── UserMapper.java
│   │   │           ├── service/
│   │   │           │   ├── MenuService.java
│   │   │           │   ├── RecipeService.java
│   │   │           │   ├── CategoryService.java
│   │   │           │   └── UserService.java
│   │   │           ├── service/impl/
│   │   │           │   ├── MenuServiceImpl.java
│   │   │           │   ├── RecipeServiceImpl.java
│   │   │           │   ├── CategoryServiceImpl.java
│   │   │           │   └── UserServiceImpl.java
│   │   │           ├── vo/
│   │   │           │   ├── Result.java
│   │   │           │   └── MenuVO.java
│   │   │           └── util/
│   │   │               ├── JwtUtil.java
│   │   │               └── ImageUtil.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── db/
│   │       │   └── schema.sql
│   │       └── static/
│   │           ├── index.html
│   │           ├── admin.html
│   │           ├── css/
│   │           │   ├── main.css
│   │           │   └── admin.css
│   │           └── js/
│   │               ├── main.js
│   │               ├── admin.js
│   │               ├── api.js
│   │               └── recipe.js
│   └── test/
│       └── java/
└── pom.xml
```
