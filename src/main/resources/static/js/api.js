/**
 * API 接口封装
 * 统一管理所有后端 API 调用
 */
const API = {
    baseURL: '/api',

    /**
     * 核心请求方法
     */
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
                        // Token 过期，清除本地存储
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        throw new Error('登录已过期，请重新登录');
                    }
                    return res.json().then(data => {
                        throw new Error(data.message || '请求失败');
                    });
                }
                return res.json();
            })
            .then(data => {
                if (data.code !== 200) {
                    throw new Error(data.message || '请求失败');
                }
                return data.data;
            });
    },

    // ===== 认证接口 =====
    login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // ===== 菜单接口 =====
    getMenuByDate(date) {
        return this.request(`/menu/date?date=${date}`);
    },

    getMenusByMonth(year, month) {
        return this.request(`/menu/month?year=${year}&month=${month}`);
    },

    createMenu(data) {
        return this.request('/menu', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateMenu(id, data) {
        return this.request(`/menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteMenu(id, soft = true) {
        return this.request(`/menu/${soft ? 'soft' : 'hard'}/${id}`, {
            method: 'DELETE'
        });
    },

    restoreMenu(id) {
        return this.request(`/menu/restore/${id}`, {
            method: 'PUT'
        });
    },

    // ===== 菜谱接口 =====
    getPublicRecipes() {
        return this.request('/recipe/public');
    },

    getMyRecipes() {
        return this.request('/recipe/my');
    },

    getRecipeDetail(id) {
        return this.request(`/recipe/${id}`);
    },

    createRecipe(data) {
        return this.request('/recipe', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateRecipe(id, data) {
        return this.request(`/recipe/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteRecipe(id, soft = true) {
        return this.request(`/recipe/${soft ? 'soft' : 'hard'}/${id}`, {
            method: 'DELETE'
        });
    },

    restoreRecipe(id) {
        return this.request(`/recipe/restore/${id}`, {
            method: 'PUT'
        });
    },

    searchRecipes(keyword) {
        return this.request(`/recipe/search?keyword=${encodeURIComponent(keyword)}`);
    },

    // ===== 分类接口 =====
    getCategories(type) {
        return this.request(`/category/list${type ? '?type=' + type : ''}`);
    }
};