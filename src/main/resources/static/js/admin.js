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
    // loadMenus();

    // 绑定侧边栏点击事件
    initSidebarEvents();

    // 默认显示菜单管理
    switchTab('menu');
});


// ==========================================
// ===== 菜单管理 =====
// ==========================================

function loadMenus() {
    document.getElementById('pageTitle').textContent = '菜单管理';
    document.getElementById('menuTab').style.display = 'block';
    document.getElementById('recipeTab').style.display = 'none';
    document.getElementById('categoryTab').style.display = 'none';

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

    console.log('========== 开始保存菜单 ==========');

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
    console.log('菜单ID:', id || '新增');

    if (recipeType.value === '0') {
        const recipeId = document.getElementById('menuRecipe').value;
        if (!recipeId) {
            showToast('请选择菜谱', 'warning');
            return;
        }
        menuData.recipeId = parseInt(recipeId);
        menuData.isCustom = 0;
        menuData.customContent = null;
        console.log('使用已有菜谱，ID:', recipeId);
    } else if (recipeType.value === '1') {
        const customContent = document.getElementById('menuCustomContent').value;
        menuData.recipeId = null;
        menuData.isCustom = 1;
        menuData.customContent = customContent || '暂无内容';
        console.log('自定义内容:', customContent);
    } else if (recipeType.value === '2') {
        console.log('新增菜谱并关联');

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
        console.log('新菜谱数据:', recipeData);

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

    console.log('最终提交的数据:', menuData);
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
    document.getElementById('pageTitle').textContent = '菜谱管理';
    document.getElementById('recipeTab').style.display = 'block';
    document.getElementById('menuTab').style.display = 'none';
    document.getElementById('categoryTab').style.display = 'none';

    const container = document.getElementById('recipeContainer');
    // 显示加载状态
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-2 text-muted">加载菜谱中...</p>
        </div>
    `;

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

                // 使用 firstImage 作为封面
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
    // 清空图片
    clearRecipeImages();
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
            // 回显图片
            if (r.imageUrls) {
                const urls = JSON.parse(r.imageUrls);
                loadRecipeImages(urls);
            } else {
                clearRecipeImages();
            }
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
// ========== 菜谱图片上传 ==========
let uploadedRecipeImages = [];

// 上传菜谱图片
function uploadRecipeImages(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    // 显示上传进度
    const list = document.getElementById('recipeImageList');

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        // 显示上传中的占位
        const placeholderId = 'uploading-' + Date.now() + '-' + i;
        list.innerHTML += `
            <div class="col-4 col-sm-3 col-md-2" id="${placeholderId}">
                <div class="position-relative">
                    <div class="bg-light rounded" style="height:100px;display:flex;align-items:center;justify-content:center;">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">上传中...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 调用上传 API
        fetch('/api/upload/recipe-image', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(data => {
                // 移除占位
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) placeholder.remove();

                if (data.code === 200) {
                    const url = data.data.url;
                    uploadedRecipeImages.push(url);
                    renderRecipeImage(url);
                    showToast('上传成功', 'success');
                } else {
                    showToast('上传失败：' + data.message, 'danger');
                }
            })
            .catch(err => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) placeholder.remove();
                showToast('上传失败：' + err.message, 'danger');
            });
    }

    // 清空 input，允许重复选择同一文件
    input.value = '';
}

// 渲染已上传图片
function renderRecipeImage(url) {
    const list = document.getElementById('recipeImageList');
    const id = 'img-' + Date.now();
    list.innerHTML += `
        <div class="col-4 col-sm-3 col-md-2" id="${id}">
            <div class="position-relative">
                <img src="${url}" class="img-fluid rounded" style="height:100px;object-fit:cover;width:100%;">
                <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" 
                        onclick="removeRecipeImage('${id}', '${url}')" style="padding:2px 6px;font-size:12px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}

// 移除图片（仅前端移除，如需后端删除需额外接口）
function removeRecipeImage(elementId, url) {
    if (!confirm('确定移除该图片吗？')) return;
    const index = uploadedRecipeImages.indexOf(url);
    if (index > -1) {
        uploadedRecipeImages.splice(index, 1);
    }
    const el = document.getElementById(elementId);
    if (el) el.remove();
}

// 清空图片列表（用于重置表单）
function clearRecipeImages() {
    uploadedRecipeImages = [];
    const list = document.getElementById('recipeImageList');
    list.innerHTML = `<div class="col-12"><span class="text-muted">暂无图片</span></div>`;
}

// 加载菜谱详情时，回显图片
function loadRecipeImages(images) {
    uploadedRecipeImages = images || [];
    const list = document.getElementById('recipeImageList');
    list.innerHTML = '';
    if (!images || images.length === 0) {
        // 显示默认图片
        list.innerHTML = `
            <div class="col-4 col-sm-3 col-md-2">
                <img src="/images/default-recipe.png" class="img-fluid rounded" style="height:100px;object-fit:cover;width:100%;">
                <div class="text-center small text-muted">默认图片</div>
            </div>
        `;
        return;
    }
    images.forEach(url => renderRecipeImage(url));
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
        imageUrls: uploadedRecipeImages  // 提交已上传的图片URL列表
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
            console.log("r = {}", r);

            document.getElementById('recipeViewTitle').textContent = r.name;

            const images = r.imageUrls ? JSON.parse(r.imageUrls) : [];
            // 生成图片轮播或网格
            let imgHtml = '';
            if (images.length > 0) {
                imgHtml = images.map(img =>
                    `<img src="${img}" class="img-fluid rounded mb-2" style="max-height:300px;object-fit:cover;width:100%;">`
                ).join('');
            } else {
                imgHtml = `<img src="/images/default-recipe.png" class="img-fluid rounded" style="max-height:300px;object-fit:cover;width:100%;">`;
            }

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
let currentCategoryFilter = 'all'; // 当前过滤类型

function loadCategories(filterType) {
    // 显示分类管理区域，隐藏其他
    document.getElementById('categoryTab').style.display = 'block';
    document.getElementById('menuTab').style.display = 'none';
    document.getElementById('recipeTab').style.display = 'none';
    document.getElementById('pageTitle').textContent = '分类管理';

    const url = filterType && filterType !== 'all' ? `/category/list?type=${filterType}` : '/category/list';
    API.request(url)
        .then(categories => {
            renderCategoryTable(categories);
        })
        .catch(err => {
            showToast('加载分类失败：' + err.message, 'danger');
        });
}

function renderCategoryTable(categories) {
    const tbody = document.getElementById('categoryTableBody');
    tbody.innerHTML = '';
    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无分类</td></tr>';
        return;
    }
    categories.forEach(c => {
        const tr = document.createElement('tr');
        const typeMap = { 'MENU': '菜单分类', 'RECIPE': '菜谱分类' };
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td><span class="badge ${c.type === 'MENU' ? 'bg-primary' : 'bg-success'}">${typeMap[c.type] || c.type}</span></td>
            <td>${c.sortOrder || 0}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${c.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.id})"><i class="fas fa-trash"></i></button>
                <!-- 软删除后可以恢复，但此处简化，实际需要判断isDeleted -->
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterCategoryType(type) {
    currentCategoryFilter = type;
    loadCategories(type);
    // 更新按钮激活状态
    document.querySelectorAll('#categoryManagement .btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // 根据type激活对应按钮（略）
}

function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = '新增分类';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

function editCategory(id) {
    // 获取分类详情（需后端提供接口 /api/category/{id}，若没有则需新增）
    API.request(`/category/${id}`)
        .then(category => {
            document.getElementById('categoryModalTitle').textContent = '编辑分类';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryType').value = category.type;
            document.getElementById('categorySort').value = category.sortOrder || 0;
            new bootstrap.Modal(document.getElementById('categoryModal')).show();
        })
        .catch(err => showToast('加载分类失败：' + err.message, 'danger'));
}

function deleteCategory(id) {
    if (!confirm('确定删除该分类？')) return;
    API.request(`/category/${id}`, { method: 'DELETE' })
        .then(() => {
            showToast('删除成功', 'success');
            loadCategories(currentCategoryFilter);
        })
        .catch(err => showToast('删除失败：' + err.message, 'danger'));
}

function saveCategory(event) {
    event.preventDefault();
    const id = document.getElementById('categoryId').value;
    const data = {
        name: document.getElementById('categoryName').value,
        type: document.getElementById('categoryType').value,
        sortOrder: parseInt(document.getElementById('categorySort').value) || 0
    };
    const url = id ? `/category/${id}` : '/category';
    const method = id ? 'PUT' : 'POST';
    API.request(url, { method, body: JSON.stringify(data) })
        .then(() => {
            showToast('保存成功', 'success');
            document.getElementById('categoryModal').querySelector('.btn-close').click();
            loadCategories(currentCategoryFilter);
        })
        .catch(err => showToast('保存失败：' + err.message, 'danger'));
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

// ==========================================
// ===== 页面导航 =====
// ==========================================

/**
 * 返回首页
 */
function goHome(event) {
    if (event) event.preventDefault();
    window.location.href = '/';
}

/**
 * 切换侧边栏（移动端）
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

/**
 * 切换 Tab
 */
function switchTab(tab) {
    // 1. 清除所有 active
    document.querySelectorAll('.sidebar .nav-link').forEach(el => el.classList.remove('active'));

    // 2. 高亮当前标签
    const activeLink = document.querySelector(`.sidebar .nav-link[data-tab="${tab}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // 3. 切换内容区域
    document.getElementById('menuTab').style.display = 'none';
    document.getElementById('recipeTab').style.display = 'none';
    document.getElementById('categoryTab').style.display = 'none';

    // 3. 显示对应区域并加载数据
    // 更新页面标题和按钮
    if (tab === 'menu') {
        document.getElementById('pageTitle').textContent = '菜单管理';
        document.getElementById('menuTab').style.display = 'block';
        loadMenus();
    } else if (tab === 'recipe') {
        document.getElementById('pageTitle').textContent = '菜谱管理';
        document.getElementById('recipeTab').style.display = 'block';
        loadRecipes();
    } else if (tab === 'category') {
        document.getElementById('pageTitle').textContent = '分类管理';
        document.getElementById('categoryTab').style.display = 'block';
        // showToast('分类管理功能开发中', 'info');
        loadCategories('all');
    }

    // 移动端关闭侧边栏
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

// 为侧边栏链接绑定点击事件（在初始化中执行）
function initSidebarEvents() {
    document.querySelectorAll('.sidebar .nav-link[data-tab]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}
