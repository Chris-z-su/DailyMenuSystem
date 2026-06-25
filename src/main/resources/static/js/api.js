// src/main/resources/static/js/api.js
const API = {
    baseURL: '/api',
    request(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };
        return fetch(this.baseURL + url, { ...options, headers })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                    }
                    return res.json().then(data => { throw new Error(data.message || '请求失败'); });
                }
                return res.json();
            })
            .then(data => {
                if (data.code !== 200) throw new Error(data.message || '请求失败');
                return data.data;
            });
    },
    // 菜单
    getMenuByDate(date) { return this.request(`/menu/date?date=${date}`); },
    getMenusByMonth(year, month) { return this.request(`/menu/month?year=${year}&month=${month}`); },
    createMenu(data) { return this.request('/menu', { method: 'POST', body: JSON.stringify(data) }); },
    updateMenu(id, data) { return this.request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    deleteMenu(id, soft = true) { return this.request(`/menu/${soft?'soft':'hard'}/${id}`, { method: 'DELETE' }); },
    restoreMenu(id) { return this.request(`/menu/restore/${id}`, { method: 'PUT' }); },
    // 菜谱
    getPublicRecipes() { return this.request('/recipe/public'); },
    getMyRecipes() { return this.request('/recipe/my'); },
    getRecipeDetail(id) { return this.request(`/recipe/${id}`); },
    createRecipe(data) { return this.request('/recipe', { method: 'POST', body: JSON.stringify(data) }); },
    updateRecipe(id, data) { return this.request(`/recipe/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    deleteRecipe(id, soft = true) { return this.request(`/recipe/${soft?'soft':'hard'}/${id}`, { method: 'DELETE' }); },
    restoreRecipe(id) { return this.request(`/recipe/restore/${id}`, { method: 'PUT' }); },
    searchRecipes(keyword) { return this.request(`/recipe/search?keyword=${encodeURIComponent(keyword)}`); },
    // 分类
    getCategories(type) { return this.request(`/category/list${type ? '?type='+type : ''}`); },
    // 认证
    login(username, password) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); }
};

// src/main/resources/static/js/utils.js
function showToast(message, type = 'info') {
    const toast = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast) return;
    toastMessage.textContent = message;
    toast.className = `toast align-items-center border-0 bg-${type} text-white`;
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
}

function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getCategoryName(id, categories) {
    if (!categories) return '其他';
    const found = categories.find(c => c.id == id);
    return found ? found.name : '其他';
}

// src/main/resources/static/js/main.js
let currentView = 'grid';
let allCategories = [];
let currentMenus = [];

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = today;
    loadTodayMenu();
    loadCategories();
    checkAuthStatus();
});

function loadTodayMenu() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = today;
    loadMenuByDate();
}

function loadMenuByDate() {
    const date = document.getElementById('datePicker').value;
    if (!date) return;
    API.getMenuByDate(date).then(menus => {
        currentMenus = menus;
        renderMenus(menus);
    }).catch(err => showToast('加载失败：'+err.message, 'danger'));
}

function loadWeekMenu() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    // 简化：显示一周的菜单
    showToast('本周菜单功能开发中', 'info');
}

function renderMenus(menus) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';
    if (!menus || menus.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><i class="fas fa-utensils fa-3x text-muted mb-3"></i><h5>暂无菜单</h5></div>`;
        return;
    }
    // 按分类分组
    const grouped = {};
    menus.forEach(m => {
        const catName = getCategoryName(m.categoryId, allCategories);
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(m);
    });
    Object.keys(grouped).forEach((cat, idx) => {
        const title = document.createElement('div');
        title.className = 'col-12 mt-3 mb-2';
        title.innerHTML = `<h5 class="border-bottom pb-2"><span class="badge bg-primary me-2">${cat}</span><small class="text-muted">${grouped[cat].length} 道菜</small></h5>`;
        container.appendChild(title);
        grouped[cat].forEach((menu, i) => {
            const col = document.createElement('div');
            col.className = `col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2`;
            col.style.setProperty('--index', i + 1);
            col.innerHTML = createMenuCard(menu);
            container.appendChild(col);
        });
    });
}

function createMenuCard(menu) {
    const imageUrl = menu.imageUrl || '/images/default-food.png';
    const catName = getCategoryName(menu.categoryId, allCategories);
    return `
        <div class="menu-card" onclick="showRecipe(${menu.id})">
            <div class="card-image-wrapper"><img src="${imageUrl}" alt="${menu.name}" loading="lazy" onerror="this.src='/images/default-food.png'"></div>
            <div class="card-body"><h6 class="card-title">${menu.name}</h6><p class="card-text small">${menu.description || ''}</p></div>
            <div class="card-footer"><span class="category-badge bg-primary">${catName}</span><button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation();showRecipe(${menu.id})"><i class="fas fa-book"></i></button></div>
        </div>
    `;
}

function showRecipe(menuId) {
    // 先获取菜单详情，再获取菜谱内容
    API.getMenuByDate(document.getElementById('datePicker').value).then(menus => {
        const menu = menus.find(m => m.id === menuId);
        if (!menu) { showToast('未找到该菜品', 'warning'); return; }
        if (menu.isCustom === 1) {
            document.getElementById('recipeTitle').textContent = menu.name + ' (自定义)';
            document.getElementById('recipeContent').innerHTML = `<div class="p-3 bg-light rounded">${menu.customContent || '无自定义内容'}</div>`;
        } else if (menu.recipeId) {
            API.getRecipeDetail(menu.recipeId).then(recipe => {
                document.getElementById('recipeTitle').textContent = recipe.name;
                const images = recipe.imageUrls ? JSON.parse(recipe.imageUrls) : [];
                let imgHtml = images.map(img => `<img src="${img}" class="img-fluid rounded mb-2" style="max-height:300px;">`).join('');
                document.getElementById('recipeContent').innerHTML = `
                    <div class="row">
                        <div class="col-md-6">${imgHtml}</div>
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
            }).catch(err => showToast('获取菜谱失败', 'danger'));
        } else {
            document.getElementById('recipeTitle').textContent = menu.name + ' (无菜谱)';
            document.getElementById('recipeContent').innerHTML = '<div class="alert alert-info">该菜品未关联菜谱</div>';
        }
        new bootstrap.Modal(document.getElementById('recipeModal')).show();
    });
}

function changeView(view) {
    currentView = view;
    const container = document.getElementById('menuContainer');
    container.className = `row g-3 g-md-4 ${view === 'list' ? 'view-list' : ''}`;
    document.querySelectorAll('[onclick^="changeView"]').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(view === 'grid' ? 'th' : 'list'));
    });
}

function searchMenu() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) { loadTodayMenu(); return; }
    // 前端过滤
    if (currentMenus) {
        const filtered = currentMenus.filter(m => m.name.includes(keyword) || (m.description && m.description.includes(keyword)));
        renderMenus(filtered);
    }
}

function filterByCategory(categoryId) {
    document.querySelectorAll('#categoryFilter .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category == categoryId);
    });
    // 重新渲染并过滤
    if (currentMenus) {
        if (categoryId !== 'all') {
            const filtered = currentMenus.filter(m => m.categoryId == categoryId);
            renderMenus(filtered);
        } else {
            renderMenus(currentMenus);
        }
    }
}

function loadCategories() {
    API.getCategories('MENU').then(cats => {
        allCategories = cats;
        const container = document.getElementById('categoryFilter');
        container.innerHTML = `<button class="btn btn-sm btn-outline-primary active" data-category="all" onclick="filterByCategory('all')">全部</button>`;
        cats.forEach(cat => {
            if (cat.parentId === 0) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-sm btn-outline-secondary';
                btn.dataset.category = cat.id;
                btn.textContent = cat.name;
                btn.onclick = () => filterByCategory(cat.id);
                container.appendChild(btn);
            }
        });
    });
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) updateUserStatus();
}

function updateUserStatus() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    if (user.username) {
        loginBtn.innerHTML = `<i class="fas fa-user-circle"></i><span class="d-none d-sm-inline ms-1">${user.username}</span>`;
        loginBtn.onclick = () => logout();
        if (user.role === 'ADMIN' || user.role === 'USER') adminBtn.classList.remove('d-none');
    } else {
        loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i><span class="d-none d-sm-inline ms-1">登录</span>`;
        loginBtn.onclick = () => showLoginModal();
        adminBtn.classList.add('d-none');
    }
}

function showLoginModal() { new bootstrap.Modal(document.getElementById('loginModal')).show(); }

function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    API.login(username, password).then(data => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('登录成功！', 'success');
        document.getElementById('loginModal').querySelector('.btn-close').click();
        updateUserStatus();
        loadTodayMenu();
    }).catch(err => showToast('登录失败：'+err.message, 'danger'));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUserStatus();
    showToast('已退出', 'info');
    loadTodayMenu();
}

// src/main/resources/static/js/admin.js
let editingMenuId = null;
let editingRecipeId = null;

document.addEventListener('DOMContentLoaded', function() {
    // 检查登录
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }
    loadMenuCategories();
    loadRecipeCategories();
    loadMenus();
});

function loadMenus() {
    const today = new Date().toISOString().split('T')[0];
    API.getMenuByDate(today).then(menus => {
        renderMenuTable(menus);
    }).catch(err => showToast('加载菜单失败', 'danger'));
}

function renderMenuTable(menus) {
    const tbody = document.getElementById('menuTableBody');
    tbody.innerHTML = '';
    if (!menus || menus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无菜单</td></tr>';
        return;
    }
    menus.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.id}</td>
            <td class="d-none d-sm-table-cell">${m.date}</td>
            <td>${m.name}</td>
            <td class="d-none d-md-table-cell">${m.categoryName || ''}</td>
            <td class="d-none d-lg-table-cell">${m.imageUrl ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editMenu(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMenu(${m.id})"><i class="fas fa-trash"></i></button>
                ${m.isDeleted ? `<button class="btn btn-sm btn-outline-success" onclick="restoreMenu(${m.id})"><i class="fas fa-undo"></i></button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddMenuModal() {
    editingMenuId = null;
    document.getElementById('menuModalTitle').textContent = '新增菜单';
    document.getElementById('menuForm').reset();
    document.getElementById('menuId').value = '';
    document.getElementById('menuDate').value = new Date().toISOString().split('T')[0];
    loadRecipeOptions();
    toggleRecipeType(0);
    new bootstrap.Modal(document.getElementById('menuModal')).show();
}

function editMenu(id) {
    editingMenuId = id;
    document.getElementById('menuModalTitle').textContent = '编辑菜单';
    // 获取菜单详情
    API.getMenuByDate(new Date().toISOString().split('T')[0]).then(menus => {
        const menu = menus.find(m => m.id === id);
        if (!menu) { showToast('菜单不存在', 'warning'); return; }
        document.getElementById('menuId').value = menu.id;
        document.getElementById('menuDate').value = menu.date;
        document.getElementById('menuName').value = menu.name;
        document.getElementById('menuDescription').value = menu.description || '';
        document.getElementById('menuImage').value = menu.imageUrl || '';
        document.getElementById('menuSort').value = menu.sortOrder || 0;
        // 设置分类
        const catSelect = document.getElementById('menuCategory');
        for (let opt of catSelect.options) {
            if (opt.value == menu.categoryId) { opt.selected = true; break; }
        }
        // 设置菜谱类型
        if (menu.isCustom === 1) {
            document.getElementById('customRecipe').checked = true;
            toggleRecipeType(1);
            document.getElementById('menuCustomContent').value = menu.customContent || '';
        } else if (menu.recipeId) {
            document.getElementById('useRecipe').checked = true;
            toggleRecipeType(0);
            loadRecipeOptions().then(() => {
                document.getElementById('menuRecipe').value = menu.recipeId;
            });
        } else {
            document.getElementById('useRecipe').checked = true;
            toggleRecipeType(0);
        }
        new bootstrap.Modal(document.getElementById('menuModal')).show();
    });
}

function deleteMenu(id) {
    if (!confirm('确定删除？')) return;
    API.deleteMenu(id, true).then(() => { showToast('删除成功', 'success'); loadMenus(); }).catch(err => showToast('删除失败', 'danger'));
}

function restoreMenu(id) {
    API.restoreMenu(id).then(() => { showToast('恢复成功', 'success'); loadMenus(); }).catch(err => showToast('恢复失败', 'danger'));
}

function loadMenuCategories() {
    API.getCategories('MENU').then(cats => {
        const select = document.getElementById('menuCategory');
        select.innerHTML = '';
        cats.filter(c => c.parentId === 0).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            select.appendChild(opt);
        });
    });
}

function loadRecipeCategories() {
    API.getCategories('RECIPE').then(cats => {
        const selects = ['newRecipeCategory', 'recipeCategory'];
        selects.forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            sel.innerHTML = '';
            cats.filter(c => c.parentId === 0).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                sel.appendChild(opt);
            });
        });
    });
}

function loadRecipeOptions() {
    return API.getPublicRecipes().then(recipes => {
        const select = document.getElementById('menuRecipe');
        select.innerHTML = '<option value="">-- 请选择 --</option>';
        recipes.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            select.appendChild(opt);
        });
    });
}

function toggleRecipeType(type) {
    const recipeSelectDiv = document.getElementById('recipeSelectDiv');
    const newRecipeDiv = document.getElementById('newRecipeDiv');
    if (type === 0) {
        recipeSelectDiv.style.display = 'block';
        newRecipeDiv.classList.add('d-none');
        document.getElementById('menuRecipe').required = true;
        document.getElementById('isCustom').value = 0;
    } else if (type === 1) {
        recipeSelectDiv.style.display = 'none';
        newRecipeDiv.classList.add('d-none');
        document.getElementById('menuRecipe').required = false;
        document.getElementById('isCustom').value = 1;
        // 添加自定义内容文本框
        if (!document.getElementById('menuCustomContent')) {
            const div = document.createElement('div');
            div.className = 'col-12';
            div.innerHTML = `<label class="form-label">自定义内容</label><textarea class="form-control" id="menuCustomContent" rows="3"></textarea>`;
            document.getElementById('newRecipeDiv').parentNode.insertBefore(div, document.getElementById('newRecipeDiv'));
        }
    } else if (type === 2) {
        recipeSelectDiv.style.display = 'none';
        newRecipeDiv.classList.remove('d-none');
        document.getElementById('menuRecipe').required = false;
        document.getElementById('isCustom').value = 0;
        // 移除自定义内容
        const customDiv = document.getElementById('menuCustomContent')?.parentNode;
        if (customDiv) customDiv.remove();
        loadRecipeCategories();
    }
}

function saveMenu(event) {
    event.preventDefault();
    const recipeType = document.querySelector('input[name="recipeType"]:checked');
    if (!recipeType) { showToast('请选择菜谱类型', 'warning'); return; }

    const menuData = {
        date: document.getElementById('menuDate').value,
        name: document.getElementById('menuName').value,
        categoryId: document.getElementById('menuCategory').value,
        description: document.getElementById('menuDescription').value,
        imageUrl: document.getElementById('menuImage').value || '/images/default-food.png',
        sortOrder: parseInt(document.getElementById('menuSort').value) || 0,
        isCustom: 0
    };
    const id = document.getElementById('menuId').value;

    if (recipeType.value === '0') {
        const recipeId = document.getElementById('menuRecipe').value;
        if (!recipeId) { showToast('请选择菜谱', 'warning'); return; }
        menuData.recipeId = parseInt(recipeId);
        menuData.isCustom = 0;
    } else if (recipeType.value === '1') {
        const customContent = document.getElementById('menuCustomContent').value;
        menuData.recipeId = null;
        menuData.isCustom = 1;
        menuData.customContent = customContent;
    } else if (recipeType.value === '2') {
        const recipeData = {
            name: document.getElementById('newRecipeName').value,
            categoryId: document.getElementById('newRecipeCategory').value,
            description: document.getElementById('newRecipeDescription').value,
            content: document.getElementById('newRecipeContent').value,
            prepTime: parseInt(document.getElementById('newRecipePrepTime').value) || 0,
            cookTime: parseInt(document.getElementById('newRecipeCookTime').value) || 0,
            difficulty: document.getElementById('newRecipeDifficulty').value,
            isPublic: document.getElementById('newRecipePublic').checked ? 1 : 0,
            imageUrls: []
        };
        if (!recipeData.name) { showToast('请输入菜谱名称', 'warning'); return; }
        API.createRecipe(recipeData).then(newRecipe => {
            menuData.recipeId = newRecipe.id;
            menuData.isCustom = 0;
            return saveMenuData(id, menuData);
        }).catch(err => showToast('创建菜谱失败：'+err.message, 'danger'));
        return;
    }
    saveMenuData(id, menuData);
}

function saveMenuData(id, data) {
    const promise = id ? API.updateMenu(id, data) : API.createMenu(data);
    promise.then(() => {
        showToast('保存成功', 'success');
        document.getElementById('menuModal').querySelector('.btn-close').click();
        loadMenus();
    }).catch(err => showToast('保存失败：'+err.message, 'danger'));
}

// ========== 菜谱管理 ==========
function loadRecipes() {
    document.getElementById('pageTitle').textContent = '菜谱管理';
    document.getElementById('recipeManagement').style.display = 'block';
    document.getElementById('menuTable').style.display = 'none';
    API.getMyRecipes().then(recipes => {
        const container = document.getElementById('recipeContainer');
        container.innerHTML = '';
        if (!recipes || recipes.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-5"><i class="fas fa-book fa-3x text-muted mb-3"></i><h5>暂无菜谱</h5></div>`;
            return;
        }
        recipes.forEach(r => {
            const col = document.createElement('div');
            col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
            const images = r.imageUrls ? JSON.parse(r.imageUrls) : [];
            const firstImage = images.length > 0 ? images[0] : '/images/default-recipe.png';
            const diffMap = { 'EASY':'简单','MEDIUM':'中等','HARD':'困难' };
            const diffColor = { 'EASY':'success','MEDIUM':'warning','HARD':'danger' };
            col.innerHTML = `
                <div class="card recipe-card h-100">
                    <img src="${firstImage}" class="card-img-top" style="height:180px;object-fit:cover;" onerror="this.src='/images/default-recipe.png'">
                    <div class="card-body">
                        <h6 class="card-title">${r.name}</h6>
                        <p class="card-text small text-muted">${r.description || ''}</p>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            <span class="badge bg-${diffColor[r.difficulty]}">${diffMap[r.difficulty]||'中等'}</span>
                            <span class="badge bg-secondary">${r.categoryId ? getCategoryName(r.categoryId) : '未分类'}</span>
                            ${r.isPublic === 1 ? '<span class="badge bg-info">公开</span>' : '<span class="badge bg-secondary">私有</span>'}
                        </div>
                        <div class="small text-muted"><i class="far fa-clock me-1"></i>准备${r.prepTime||0}min | 烹饪${r.cookTime||0}min</div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="btn-group w-100"><button class="btn btn-sm btn-outline-primary" onclick="viewRecipeDetail(${r.id})"><i class="fas fa-eye"></i></button><button class="btn btn-sm btn-outline-warning" onclick="editRecipe(${r.id})"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteRecipe(${r.id})"><i class="fas fa-trash"></i></button></div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    }).catch(err => showToast('加载菜谱失败', 'danger'));
}

function showAddRecipeModal() {
    editingRecipeId = null;
    document.getElementById('recipeModalTitle').textContent = '新增菜谱';
    document.getElementById('recipeForm').reset();
    document.getElementById('recipeId').value = '';
    loadRecipeCategoriesForModal();
    new bootstrap.Modal(document.getElementById('recipeModal')).show();
}

function editRecipe(id) {
    editingRecipeId = id;
    document.getElementById('recipeModalTitle').textContent = '编辑菜谱';
    API.getRecipeDetail(id).then(r => {
        document.getElementById('recipeId').value = r.id;
        document.getElementById('recipeName').value = r.name;
        document.getElementById('recipeDescription').value = r.description || '';
        document.getElementById('recipeContent').value = r.content || '';
        document.getElementById('recipePrepTime').value = r.prepTime || 0;
        document.getElementById('recipeCookTime').value = r.cookTime || 0;
        document.getElementById('recipeDifficulty').value = r.difficulty || 'MEDIUM';
        document.getElementById('recipePublic').checked = r.isPublic === 1;
        loadRecipeCategoriesForModal(r.categoryId);
        new bootstrap.Modal(document.getElementById('recipeModal')).show();
    }).catch(err => showToast('加载失败', 'danger'));
}

function loadRecipeCategoriesForModal(selectedId) {
    API.getCategories('RECIPE').then(cats => {
        const select = document.getElementById('recipeCategory');
        select.innerHTML = '';
        cats.filter(c => c.parentId === 0).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            if (selectedId && c.id == selectedId) opt.selected = true;
            select.appendChild(opt);
        });
    });
}

function saveRecipe(event) {
    event.preventDefault();
    const data = {
        name: document.getElementById('recipeName').value,
        categoryId: document.getElementById('recipeCategory').value,
        description: document.getElementById('recipeDescription').value,
        content: document.getElementById('recipeContent').value,
        prepTime: parseInt(document.getElementById('recipePrepTime').value) || 0,
        cookTime: parseInt(document.getElementById('recipeCookTime').value) || 0,
        difficulty: document.getElementById('recipeDifficulty').value,
        isPublic: document.getElementById('recipePublic').checked ? 1 : 0,
        imageUrls: []
    };
    const id = document.getElementById('recipeId').value;
    if (!data.name) { showToast('请输入菜谱名称', 'warning'); return; }
    const promise = id ? API.updateRecipe(id, data) : API.createRecipe(data);
    promise.then(() => {
        showToast('保存成功', 'success');
        document.getElementById('recipeModal').querySelector('.btn-close').click();
        loadRecipes();
    }).catch(err => showToast('保存失败：'+err.message, 'danger'));
}

function viewRecipeDetail(id) {
    API.getRecipeDetail(id).then(r => {
        const images = r.imageUrls ? JSON.parse(r.imageUrls) : [];
        document.getElementById('recipeViewTitle').textContent = r.name;
        let imgHtml = images.map(img => `<img src="${img}" class="img-fluid rounded mb-2" style="max-height:300px;">`).join('');
        document.getElementById('recipeViewContent').innerHTML = `
            <div class="row"><div class="col-md-6">${imgHtml}</div><div class="col-md-6">
                <p><strong>描述：</strong>${r.description || '无'}</p>
                <p><strong>难度：</strong>${r.difficulty}</p>
                <p><strong>准备时间：</strong>${r.prepTime || 0}分钟</p>
                <p><strong>烹饪时间：</strong>${r.cookTime || 0}分钟</p>
                <p><strong>制作方法：</strong></p>
                <div class="p-2 bg-light rounded">${r.content || '暂无'}</div>
            </div></div>
        `;
        new bootstrap.Modal(document.getElementById('recipeViewModal')).show();
    });
}

function deleteRecipe(id) {
    if (!confirm('确定删除该菜谱？')) return;
    API.deleteRecipe(id, true).then(() => { showToast('删除成功', 'success'); loadRecipes(); }).catch(err => showToast('删除失败', 'danger'));
}

function loadCategories() {
    // 分类管理（简化）
    showToast('分类管理功能开发中', 'info');
}

// 覆盖 logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}