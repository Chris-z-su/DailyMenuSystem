// api.js - API接口封装
const API = {
    baseURL: '/api',

    // 获取菜单
    getMenuByDate: function(date) {
        return this.request(`/menu/date?date=${date}`);
    },

    getMenusByRange: function(startDate, endDate) {
        return this.request(`/menu/range?start=${startDate}&end=${endDate}`);
    },

    searchMenus: function(keyword) {
        return this.request(`/menu/search?keyword=${encodeURIComponent(keyword)}`);
    },

    // 分类
    getCategories: function() {
        return this.request('/category/list');
    },

    // 菜谱
    getRecipe: function(menuId) {
        return this.request(`/recipe/${menuId}`);
    },

    // 认证
    login: function(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // 管理接口（需要token）
    createMenu: function(menuData) {
        return this.request('/menu', {
            method: 'POST',
            body: JSON.stringify(menuData)
        });
    },

    updateMenu: function(id, menuData) {
        return this.request(`/menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify(menuData)
        });
    },

    deleteMenu: function(id, soft = true) {
        return this.request(`/menu/${soft ? 'soft' : 'hard'}/${id}`, {
            method: 'DELETE'
        });
    },

    // 核心请求方法
    request: function(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        return fetch(this.baseURL + url, {
            ...options,
            headers
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        // token过期，清除登录状态
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.reload();
                    }
                    return response.json().then(data => {
                        throw new Error(data.message || '请求失败');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.code !== 200) {
                    throw new Error(data.message || '请求失败');
                }
                return data.data;
            });
    }
};