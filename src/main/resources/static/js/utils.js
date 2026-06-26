/**
 * 工具函数集合
 */

// ===== Toast 通知 =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast) {
        // 降级方案：使用 alert
        alert(message);
        return;
    }
    toastMessage.textContent = message;
    toast.className = `toast align-items-center border-0 bg-${type} text-white`;
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
}

// ===== 日期格式化 =====
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// ===== 获取分类名称（需要从外部传入分类列表） =====
let globalCategories = [];

function setCategories(categories) {
    globalCategories = categories;
}

function getCategoryName(id) {
    if (!globalCategories || globalCategories.length === 0) {
        return '分类' + id;
    }
    const found = globalCategories.find(c => c.id === id);
    return found ? found.name : '分类' + id;
}

function getCategoryColor(id) {
    const colors = {
        1: 'danger', 2: 'success', 3: 'warning', 4: 'info',
        5: 'primary', 6: 'secondary', 7: 'dark'
    };
    return colors[id] || 'secondary';
}

// ===== 防抖 =====
function debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ===== 加载状态 =====
function showLoading() {
    // 可扩展为全局加载动画
}

function hideLoading() {
    // 可扩展为隐藏加载动画
}