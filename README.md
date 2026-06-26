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

## 二、前端架构（新）
```
src/main/resources/static/
├── index.html          # 用户端主页面（查看菜单）
├── admin.html          # 管理后台页面
├── css/
│   └── main.css        # 全局样式（响应式）
├── js/
│   ├── api.js          # API接口封装（所有后端调用）
│   ├── utils.js        # 工具函数（Toast、格式化等）
│   ├── main.js         # 用户端主逻辑（首页）
│   └── admin.js        # 管理后台逻辑
└── images/
    ├── default-food.png
    └── default-recipe.png
```

## 三、清理缓存
```js
localStorage.removeItem('token');
localStorage.removeItem('user');
location.reload();
```
## 创建图片存储目录
sudo mkdir -p /opt/demo/backend/DailyMenuSystem/images/recipes
sudo mkdir -p /opt/demo/backend/DailyMenuSystem/images/menus
sudo chown -R $(whoami):$(whoami) /opt/demo/backend/DailyMenuSystem
