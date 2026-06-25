// main.js - 主要逻辑
let currentView = 'grid';
let currentPage = 1;
let totalPages = 1;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = today;

    // 加载今日菜单
    loadTodayMenu();

    // 加载分类
    loadCategories();

    // 检查登录状态
    checkAuthStatus();
});

// 加载今日菜单
function loadTodayMenu() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = today;
    loadMenuByDate();
}

// 加载指定日期菜单
function loadMenuByDate() {
    const date = document.getElementById('datePicker').value;
    if (!date) return;

    showLoading();
    API.getMenuByDate(date)
        .then(data => {
            renderMenus(data, date);
            hideLoading();
        })
        .catch(error => {
            showToast('加载失败：' + error.message, 'danger');
            hideLoading();
        });
}

// 加载本周菜单
function loadWeekMenu() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    API.getMenusByRange(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
    ).then(data => {
        renderMenusGroupByDay(data);
    });
}

// 渲染菜单 - 网格视图
function renderMenus(menus, date) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    if (!menus || menus.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-utensils fa-3x text-muted mb-3"></i>
                <h5>${date} 暂无菜单</h5>
                <p class="text-muted">点击下方按钮添加今日菜单</p>
                <button class="btn btn-primary btn-sm" onclick="showAddMenu()">
                    <i class="fas fa-plus me-2"></i>添加菜单
                </button>
            </div>
        `;
        return;
    }

    // 按分类分组
    const grouped = groupByCategory(menus);

    Object.keys(grouped).forEach(category => {
        // 添加分类标题
        const titleCol = document.createElement('div');
        titleCol.className = 'col-12 mt-3 mb-2';
        titleCol.innerHTML = `
            <h5 class="border-bottom pb-2">
                <span class="badge bg-primary me-2">${category}</span>
                <small class="text-muted">${grouped[category].length} 道菜</small>
            </h5>
        `;
        container.appendChild(titleCol);

        // 渲染菜品
        grouped[category].forEach((menu, index) => {
            const col = document.createElement('div');
            col.className = `col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2`;
            col.style.setProperty('--index', index + 1);
            col.innerHTML = createMenuCard(menu);
            container.appendChild(col);
        });
    });
}

// 创建菜单卡片HTML
function createMenuCard(menu) {
    const imageUrl = menu.imageUrl || '/images/default-food.png';
    const categoryName = getCategoryName(menu.categoryId);

    return `
        <div class="menu-card" onclick="showRecipe(${menu.id})">
            <div class="card-image-wrapper">
                <img src="${imageUrl}" 
                     alt="${menu.name}" 
                     loading="lazy"
                     onerror="this.src='/images/default-food.png'">
                ${menu.isDeleted ? '<div class="badge bg-danger position-absolute top-0 end-0 m-2">已删除</div>' : ''}
            </div>
            <div class="card-body">
                <h6 class="card-title">${menu.name}</h6>
                <p class="card-text small">${menu.description || ''}</p>
            </div>
            <div class="card-footer">
                <span class="category-badge bg-${getCategoryColor(menu.categoryId)}">${categoryName}</span>
                <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation();showRecipe(${menu.id})">
                    <i class="fas fa-book"></i>
                </button>
            </div>
        </div>
    `;
}

// 切换视图
function changeView(view) {
    currentView = view;
    const container = document.getElementById('menuContainer');
    container.className = `row g-3 g-md-4 ${view === 'list' ? 'view-list' : ''}`;

    // 更新按钮状态
    document.querySelectorAll('[onclick^="changeView"]').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(view === 'grid' ? 'th' : 'list'));
    });
}

// 搜索菜单
function searchMenu() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        loadTodayMenu();
        return;
    }

    API.searchMenus(keyword)
        .then(data => {
            renderMenus(data);
        });
}

// 显示登录模态框
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

// 登录
function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    API.login(username, password)
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showToast('登录成功！', 'success');
                document.getElementById('loginModal').querySelector('.btn-close').click();
                updateUserStatus();
                // 刷新菜单（显示管理按钮）
                loadTodayMenu();
            }
        })
        .catch(error => {
            showToast('登录失败：' + error.message, 'danger');
        });
}

// 检查登录状态
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        updateUserStatus();
    }
}

// 更新用户状态
function updateUserStatus() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (user.username) {
        loginBtn.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span class="d-none d-sm-inline">${user.username}</span>
        `;
        loginBtn.onclick = () => logout();

        if (user.role === 'ADMIN' || user.role === 'USER') {
            adminBtn.classList.remove('d-none');
        }
    } else {
        loginBtn.innerHTML = `
            <i class="fas fa-sign-in-alt"></i>
            <span class="d-none d-sm-inline">登录</span>
        `;
        loginBtn.onclick = () => showLoginModal();
        adminBtn.classList.add('d-none');
    }
}

// 登出
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUserStatus();
    showToast('已退出登录', 'info');
    loadTodayMenu();
}

// 显示Toast通知
function showToast(message, type = 'info') {
    const toast = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = `toast align-items-center border-0 bg-${type} text-white`;

    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000
    });
    bsToast.show();
}

// 工具函数 - 分组
function groupByCategory(menus) {
    const grouped = {};
    menus.forEach(menu => {
        const categoryName = getCategoryName(menu.categoryId);
        if (!grouped[categoryName]) {
            grouped[categoryName] = [];
        }
        grouped[categoryName].push(menu);
    });
    return grouped;
}

// 获取分类名称（实际从API获取）
function getCategoryName(categoryId) {
    const categories = {
        1: '热菜', 2: '凉菜', 3: '水果', 4: '甜点',
        5: '川菜', 6: '粤菜', 7: '鲁菜'
    };
    return categories[categoryId] || '其他';
}

function getCategoryColor(categoryId) {
    const colors = {
        1: 'danger', 2: 'success', 3: 'warning', 4: 'info',
        5: 'primary', 6: 'secondary', 7: 'dark'
    };
    return colors[categoryId] || 'secondary';
}

// 加载分类
function loadCategories() {
    API.getCategories()
        .then(categories => {
            const filterContainer = document.getElementById('categoryFilter');
            // 清空并保留"全部"按钮
            filterContainer.innerHTML = `
                <button class="btn btn-sm btn-outline-primary active" data-category="all" onclick="filterByCategory('all')">全部</button>
            `;

            categories.forEach(cat => {
                if (cat.parentId === 0) {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-sm btn-outline-secondary';
                    btn.dataset.category = cat.id;
                    btn.textContent = cat.name;
                    btn.onclick = () => filterByCategory(cat.id);
                    filterContainer.appendChild(btn);
                }
            });
        });
}

// 分类筛选
function filterByCategory(categoryId) {
    // 更新按钮状态
    document.querySelectorAll('#categoryFilter .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category == categoryId);
    });

    // 重新加载菜单并过滤
    const date = document.getElementById('datePicker').value;
    if (date) {
        API.getMenuByDate(date)
            .then(menus => {
                if (categoryId !== 'all') {
                    menus = menus.filter(m => m.categoryId == categoryId);
                }
                renderMenus(menus, date);
            });
    }
}