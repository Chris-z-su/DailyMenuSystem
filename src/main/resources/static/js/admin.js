/**
 * 管理后台逻辑
 * 负责：菜单CRUD、菜谱CRUD、分类管理
 */
let editingMenuId = null;
let editingRecipeId = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.body.innerHTML = `
            <div class="container mt-5 text-center">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>请先登录</strong> 才能访问管理后台。
                    <br><br>
                    <a href="/" class="btn btn-primary">返回首页登录</a>
                </div>
            </div>
        `;
        return;
    }

    // 加载数据
    loadMenuCategories();
    loadRecipeCategories();
    loadMenus();

    // 默认显示菜单管理
    switchTab('menu');
});

// ===== Tab 切换 =====
function switchTab(tab) {
    document.querySelectorAll('.sidebar .nav-link').forEach(el => el.classList.remove('active'));

    if (tab === 'menu') {
        document.getElementById('pageTitle').textContent = '菜单管理';
        document.getElementById('addBtn').style.display = '';
        document.getElementById('menuTab').style.display = '';
        document.getElementById('recipeTab').style.display = 'none';
        document.getElementById('categoryTab').style.display = 'none';
        document.querySelector('.sidebar .nav-link:first-child').classList.add('active');
        loadMenus();
    } else if (tab === 'recipe') {
        document.getElementById('pageTitle').textContent = '菜谱管理';
        document.getElementById('addBtn').style.display = 'none';
        document.getElementById('menuTab').style.display = 'none';
        document.getElementById('recipeTab').style.display = '';
        document.getElementById('categoryTab').style.display = 'none';
        document.querySelector('.sidebar .nav-link:nth-child(2)').classList.add('active');
        loadRecipes();
    } else if (tab === 'category') {
        document.getElementById('pageTitle').textContent = '分类管理';
        document.getElementById('addBtn').style.display = 'none';
        document.getElementById('menuTab').style.display = 'none';
        document.getElementById('recipeTab').style.display = 'none';
        document.getElementById('categoryTab').style.display = '';
        document.querySelector('.sidebar .nav-link:nth-child(3)').classList.add('active');
        // 分类管理功能开发中
    }
}

// ==========================================
// ===== 菜单管理 =====
// ==========================================

function loadMenus() {
    const today = getToday();
    API.getMenuByDate(today)
        .then(menus => renderMenuTable(menus))
        .catch(err => {
            showToast('加载菜单失败：' + err.message, 'danger');
            if (err.message.includes('登录')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        });
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
    document.getElementById('menuDate').value = getToday();
    document.getElementById('customContentDiv').style.display = 'none';
    loadRecipeOptions();
    toggleRecipeType(0);
    new bootstrap.Modal(document.getElementById('menuModal')).show();
}

function editMenu(id) {
    editingMenuId = id;
    document.getElementById('menuModalTitle').textContent = '编辑菜单';

    const today = getToday();
    API.getMenuByDate(today)
        .then(menus => {
            const menu = menus.find(m => m.id === id);
            if (!menu) {
                showToast('菜单不存在', 'warning');
                return;
            }

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
        })
        .catch(err => showToast('加载菜单失败：' + err.message, 'danger'));
}

function deleteMenu(id) {
    if (!confirm('确定要删除该菜单吗？')) return;
    API.deleteMenu(id, true)
        .then(() => {
            showToast('删除成功', 'success');
            loadMenus();
        })
        .catch(err => showToast('删除失败：' + err.message, 'danger'));
}

function restoreMenu(id) {
    API.restoreMenu(id)
        .then(() => {
            showToast('恢复成功', 'success');
            loadMenus();
        })
        .catch(err => showToast('恢复失败：' + err.message, 'danger'));
}

function loadMenuCategories() {
    API.getCategories('MENU')
        .then(cats => {
            const select = document.getElementById('menuCategory');
            select.innerHTML = '';
            cats.filter(c => c.parentId === 0).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                select.appendChild(opt);
            });
        })
        .catch(err => console.error('加载菜单分类失败', err));
}

function loadRecipeOptions() {
    return API.getPublicRecipes()
        .then(recipes => {
            const select = document.getElementById('menuRecipe');
            select.innerHTML = '<option value="">-- 请选择 --</option>';
            recipes.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.name;
                select.appendChild(opt);
            });
        })
        .catch(err => console.error('加载菜谱选项失败', err));
}

function toggleRecipeType(type) {
    const recipeSelectDiv = document.getElementById('recipeSelectDiv');
    const newRecipeDiv = document.getElementById('newRecipeDiv');
    const customDiv = document.getElementById('customContentDiv');

    recipeSelectDiv.style.display = 'none';
    newRecipeDiv.classList.add('d-none');
    customDiv.style.display = 'none';

    if (type === 0) {
        recipeSelectDiv.style.display = 'block';
    } else if (type === 1) {
        customDiv.style.display = 'block';
    } else if (type === 2) {
        newRecipeDiv.classList.remove('d-none');
        loadRecipeCategories();
    }
}

function saveMenu(event) {
    event.preventDefault();

    const recipeType = document.querySelector('input[name="recipeType"]:checked');
    if (!recipeType) {
        showToast('请选择菜谱类型', 'warning');
        return;
    }

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
        if (!recipeId) {
            showToast('请选择菜谱', 'warning');
            return;
        }
        menuData.recipeId = parseInt(recipeId);
        menuData.isCustom = 0;
        menuData.customContent = null;
    } else if (recipeType.value === '1') {
        const customContent = document.getElementById('menuCustomContent').value;
        menuData.recipeId = null;
        menuData.isCustom = 1;
        menuData.customContent = customContent || '暂无内容';
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
        if (!recipeData.name) {
            showToast('请输入菜谱名称', 'warning');
            return;
        }
        API.createRecipe(recipeData)
            .then(newRecipe => {
                menuData.recipeId = newRecipe.id;
                menuData.isCustom = 0;
                menuData.customContent = null;
                return saveMenuData(id, menuData);
            })
            .catch(err => showToast('创建菜谱失败：' + err.message, 'danger'));
        return;
    }

    saveMenuData(id, menuData);
}

function saveMenuData(id, data) {
    const promise = id ? API.updateMenu(id, data) : API.createMenu(data);
    promise
        .then(() => {
            showToast('保存成功', 'success');
            document.getElementById('menuModal').querySelector('.btn-close').click();
            loadMenus();
        })
        .catch(err => showToast('保存失败：' + err.message, 'danger'));
}

// ==========================================
// ===== 菜谱管理 =====
// ==========================================

function loadRecipes() {
    API.getMyRecipes()
        .then(recipes => {
            const container = document.getElementById('recipeContainer');
            container.innerHTML = '';

            if (!recipes || recipes.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-book fa-3x text-muted mb-3"></i>
                        <h5>暂无菜谱</h5>
                        <p class="text-muted">点击"新增菜谱"创建您的第一个菜谱</p>
                    </div>
                `;
                return;
            }

            recipes.forEach(r => {
                const col = document.createElement('div');
                col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
                const images = r.imageUrls ? JSON.parse(r.imageUrls) : [];
                const firstImage = images.length > 0 ? images[0] : '/images/default-recipe.png';
                const diffMap = { 'EASY': '简单', 'MEDIUM': '中等', 'HARD': '困难' };
                const diffColor = { 'EASY': 'success', 'MEDIUM': 'warning', 'HARD': 'danger' };

                col.innerHTML = `
                    <div class="card recipe-card h-100">
                        <img src="${firstImage}" class="card-img-top" style="height:180px;object-fit:cover;" onerror="this.src='/images/default-recipe.png'">
                        <div class="card-body">
                            <h6 class="card-title">${r.name}</h6>
                            <p class="card-text small text-muted">${r.description || ''}</p>
                            <div class="d-flex flex-wrap gap-1 mb-2">
                                <span class="badge bg-${diffColor[r.difficulty] || 'secondary'}">${diffMap[r.difficulty] || '中等'}</span>
                                <span class="badge bg-secondary">${getCategoryName(r.categoryId) || '未分类'}</span>
                                ${r.isPublic === 1 ? '<span class="badge bg-info">公开</span>' : '<span class="badge bg-secondary">私有</span>'}
                            </div>
                            <div class="small text-muted"><i class="far fa-clock me-1"></i>准备${r.prepTime || 0}min | 烹饪${r.cookTime || 0}min</div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <div class="btn-group w-100">
                                <button class="btn btn-sm btn-outline-primary" onclick="viewRecipeDetail(${r.id})"><i class="fas fa-eye"></i></button>
                                <button class="btn btn-sm btn-outline-warning" onclick="editRecipe(${r.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteRecipe(${r.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(col);
            });
        })
        .catch(err => {
            showToast('加载菜谱失败：' + err.message, 'danger');
            if (err.message.includes('登录')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        });
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

    API.getRecipeDetail(id)
        .then(r => {
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
        })
        .catch(err => showToast('加载失败：' + err.message, 'danger'));
}

function loadRecipeCategories() {
    API.getCategories('RECIPE')
        .then(cats => {
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
        })
        .catch(err => console.error('加载菜谱分类失败', err));
}

function loadRecipeCategoriesForModal(selectedId) {
    API.getCategories('RECIPE')
        .then(cats => {
            const select = document.getElementById('recipeCategory');
            select.innerHTML = '';
            cats.filter(c => c.parentId === 0).forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                if (selectedId && c.id == selectedId) opt.selected = true;
                select.appendChild(opt);
            });
        })
        .catch(err => console.error('加载菜谱分类失败', err));
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

    if (!data.name) {
        showToast('请输入菜谱名称', 'warning');
        return;
    }

    const promise = id ? API.updateRecipe(id, data) : API.createRecipe(data);
    promise
        .then(() => {
            showToast('保存成功', 'success');
            document.getElementById('recipeModal').querySelector('.btn-close').click();
            loadRecipes();
        })
        .catch(err => showToast('保存失败：' + err.message, 'danger'));
}

function viewRecipeDetail(id) {
    API.getRecipeDetail(id)
        .then(r => {
            const images = r.imageUrls ? JSON.parse(r.imageUrls) : [];
            document.getElementById('recipeViewTitle').textContent = r.name;

            let imgHtml = images.map(img =>
                `<img src="${img}" class="img-fluid rounded mb-2" style="max-height:300px;">`
            ).join('');

            document.getElementById('recipeViewContent').innerHTML = `
                <div class="row">
                    <div class="col-md-6">${imgHtml || '<div class="text-muted">无图片</div>'}</div>
                    <div class="col-md-6">
                        <p><strong>描述：</strong>${r.description || '无'}</p>
                        <p><strong>难度：</strong>${r.difficulty}</p>
                        <p><strong>准备时间：</strong>${r.prepTime || 0}分钟</p>
                        <p><strong>烹饪时间：</strong>${r.cookTime || 0}分钟</p>
                        <p><strong>制作方法：</strong></p>
                        <div class="p-2 bg-light rounded">${r.content || '暂无'}</div>
                    </div>
                </div>
            `;
            new bootstrap.Modal(document.getElementById('recipeViewModal')).show();
        })
        .catch(err => showToast('加载菜谱详情失败：' + err.message, 'danger'));
}

function deleteRecipe(id) {
    if (!confirm('确定删除该菜谱吗？')) return;
    API.deleteRecipe(id, true)
        .then(() => {
            showToast('删除成功', 'success');
            loadRecipes();
        })
        .catch(err => showToast('删除失败：' + err.message, 'danger'));
}

// ==========================================
// ===== 分类管理 =====
// ==========================================

function loadCategories() {
    showToast('分类管理功能开发中', 'info');
}

// ==========================================
// ===== 退出登录 =====
// ==========================================

function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}