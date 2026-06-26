/**
 * 用户端主逻辑（首页）
 * 负责：菜单展示、分类筛选、搜索、登录状态
 */
let currentView = 'grid';
let currentMenus = [];
let allCategories = [];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认日期为今天
    document.getElementById('datePicker').value = getToday();

    // 加载分类
    loadCategories();

    // 加载今日菜单
    loadTodayMenu();

    // 检查登录状态
    checkAuthStatus();
});

// ===== 加载菜单 =====
function loadTodayMenu() {
    const today = getToday();
    document.getElementById('datePicker').value = today;
    loadMenuByDate();
}

function loadMenuByDate() {
    const date = document.getElementById('datePicker').value;
    if (!date) {
        showToast('请选择日期', 'warning');
        return;
    }

    showLoading();
    API.getMenuByDate(date)
        .then(menus => {
            currentMenus = menus;
            renderMenus(menus);
            hideLoading();
        })
        .catch(err => {
            showToast('加载失败：' + err.message, 'danger');
            hideLoading();
        });
}

function loadWeekMenu() {
    // 简化实现：加载本周菜单（实际可按需扩展）
    showToast('本周菜单功能开发中', 'info');
}

// ===== 渲染菜单 =====
function renderMenus(menus) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    if (!menus || menus.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-utensils fa-3x text-muted mb-3"></i>
                <h5>今日暂无菜单</h5>
                <p class="text-muted">登录后可添加菜单</p>
            </div>
        `;
        return;
    }

    // 按分类分组
    const grouped = {};
    menus.forEach(m => {
        const catName = getCategoryName(m.categoryId);
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(m);
    });

    Object.keys(grouped).forEach((cat, idx) => {
        // 分类标题
        const title = document.createElement('div');
        title.className = 'col-12 mt-3 mb-2';
        title.innerHTML = `
            <h5 class="border-bottom pb-2">
                <span class="badge bg-primary me-2">${cat}</span>
                <small class="text-muted">${grouped[cat].length} 道菜</small>
            </h5>
        `;
        container.appendChild(title);

        // 菜品卡片
        grouped[cat].forEach((menu, i) => {
            const col = document.createElement('div');
            col.className = `col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2`;
            col.style.setProperty('--index', i + 1);
            col.innerHTML = createMenuCard(menu);
            container.appendChild(col);
        });
    });
}

// ===== 创建菜单卡片 =====
function createMenuCard(menu) {
    const imageUrl = menu.imageUrl || '/images/default-food.png';
    const catName = getCategoryName(menu.categoryId);

    return `
        <div class="menu-card" onclick="showRecipeDetail(${menu.id})">
            <div class="card-image-wrapper">
                <img src="${imageUrl}" alt="${menu.name}" loading="lazy" onerror="this.src='/images/default-food.png'">
            </div>
            <div class="card-body">
                <h6 class="card-title">${menu.name}</h6>
                <p class="card-text small">${menu.description || ''}</p>
            </div>
            <div class="card-footer">
                <span class="category-badge bg-${getCategoryColor(menu.categoryId)}">${catName}</span>
                <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation();showRecipeDetail(${menu.id})">
                    <i class="fas fa-book"></i>
                </button>
            </div>
        </div>
    `;
}

// ===== 查看菜谱详情 =====
function showRecipeDetail(menuId) {
    // 先获取菜单详情
    const date = document.getElementById('datePicker').value;
    if (!date) {
        showToast('请先选择日期', 'warning');
        return;
    }

    API.getMenuByDate(date)
        .then(menus => {
            const menu = menus.find(m => m.id === menuId);
            if (!menu) {
                showToast('未找到该菜品', 'warning');
                return;
            }

            const titleEl = document.getElementById('recipeTitle');
            const contentEl = document.getElementById('recipeContent');

            if (menu.isCustom === 1) {
                // 自定义内容
                titleEl.textContent = menu.name + ' (自定义)';
                contentEl.innerHTML = `
                    <div class="p-3 bg-light rounded">
                        <strong>自定义内容：</strong>
                        <p>${menu.customContent || '无自定义内容'}</p>
                    </div>
                `;
                new bootstrap.Modal(document.getElementById('recipeModal')).show();
                return;
            }

            if (!menu.recipeId) {
                titleEl.textContent = menu.name + ' (无菜谱)';
                contentEl.innerHTML = '<div class="alert alert-info">该菜品未关联菜谱</div>';
                new bootstrap.Modal(document.getElementById('recipeModal')).show();
                return;
            }

            // 获取关联的菜谱详情
            API.getRecipeDetail(menu.recipeId)
                .then(recipe => {
                    titleEl.textContent = recipe.name;
                    const images = recipe.imageUrls ? JSON.parse(recipe.imageUrls) : [];
                    let imgHtml = images.map(img =>
                        `<img src="${img}" class="img-fluid rounded mb-2" style="max-height:300px;">`
                    ).join('');

                    contentEl.innerHTML = `
                        <div class="row">
                            <div class="col-md-6">${imgHtml || '<div class="text-muted">无图片</div>'}</div>
                            <div class="col-md-6">
                                <p><strong>描述：</strong>${recipe.description || '无'}</p>
                                <p><strong>难度：</strong>${recipe.difficulty}</p>
                                <p><strong>准备时间：</strong>${recipe.prepTime || 0}分钟</p>
                                <p><strong>烹饪时间：</strong>${recipe.cookTime || 0}分钟</p>
                                <p><strong>制作方法：</strong></p>
                                <div class="p-2 bg-light rounded">${recipe.content || '暂无'}</div>
                            </div>
                        </div>
                    `;
                    new bootstrap.Modal(document.getElementById('recipeModal')).show();
                })
                .catch(err => showToast('获取菜谱失败：' + err.message, 'danger'));
        })
        .catch(err => showToast('加载失败：' + err.message, 'danger'));
}

// ===== 视图切换 =====
function changeView(view) {
    currentView = view;
    const container = document.getElementById('menuContainer');
    container.className = `row g-3 g-md-4 ${view === 'list' ? 'view-list' : ''}`;

    document.querySelectorAll('[onclick^="changeView"]').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(view === 'grid' ? 'th' : 'list'));
    });
}

// ===== 搜索 =====
function searchMenu() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        loadMenuByDate();
        return;
    }

    // 前端过滤当前菜单
    if (currentMenus) {
        const filtered = currentMenus.filter(m =>
            m.name.includes(keyword) ||
            (m.description && m.description.includes(keyword))
        );
        renderMenus(filtered);
        if (filtered.length === 0) {
            showToast('未找到匹配的菜品', 'info');
        }
    }
}

// ===== 分类筛选 =====
function filterByCategory(categoryId) {
    document.querySelectorAll('#categoryFilter .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category == categoryId);
    });

    if (currentMenus) {
        if (categoryId !== 'all') {
            const filtered = currentMenus.filter(m => m.categoryId == categoryId);
            renderMenus(filtered);
        } else {
            renderMenus(currentMenus);
        }
    }
}

// ===== 加载分类 =====
function loadCategories() {
    API.getCategories('MENU')
        .then(cats => {
            allCategories = cats;
            setCategories(cats);

            const container = document.getElementById('categoryFilter');
            container.innerHTML = `
                <button class="btn btn-sm btn-outline-primary active" data-category="all" onclick="filterByCategory('all')">全部</button>
            `;

            cats.filter(c => c.parentId === 0).forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-sm btn-outline-secondary';
                btn.dataset.category = cat.id;
                btn.textContent = cat.name;
                btn.onclick = () => filterByCategory(cat.id);
                container.appendChild(btn);
            });
        })
        .catch(err => console.error('加载分类失败', err));
}

// ===== 登录状态 =====
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        updateUserStatus();
    }
}

function updateUserStatus() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (user.username) {
        loginBtn.innerHTML = `<i class="fas fa-user-circle"></i><span class="d-none d-sm-inline ms-1">${user.username}</span>`;
        loginBtn.onclick = () => logout();

        if (user.role === 'ADMIN' || user.role === 'USER') {
            adminBtn.classList.remove('d-none');
        }
    } else {
        loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i><span class="d-none d-sm-inline ms-1">登录</span>`;
        loginBtn.onclick = () => showLoginModal();
        adminBtn.classList.add('d-none');
    }
}

function showLoginModal() {
    new bootstrap.Modal(document.getElementById('loginModal')).show();
}

function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    API.login(username, password)
        .then(data => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('登录成功！', 'success');
            document.getElementById('loginModal').querySelector('.btn-close').click();
            updateUserStatus();
            loadMenuByDate();
        })
        .catch(err => {
            showToast('登录失败：' + err.message, 'danger');
        });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUserStatus();
    showToast('已退出登录', 'info');
    loadMenuByDate();
}

// ===== 加载更多（占位） =====
function loadMore() {
    showToast('已加载全部', 'info');
}