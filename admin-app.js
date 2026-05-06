
(function(window) {
  'use strict';

  var AdminApp = {
    config: {
      version: '1.0.0',
      apiPrefix: '/api/v1',
      uploadFileMaxSize: 50 * 1024 * 1024
    },
    
    state: {
      currentUser: null,
      currentReport: null,
      reports: [],
      stores: [],
      monthlyData: [],
      provinceData: [],
      sourceData: [],
      isLoading: false,
      dbConnected: false
    },

    utils: {
      formatNumber: function(num) {
        if (num === null || num === undefined) return '0';
        return Number(num).toLocaleString('zh-CN');
      },
      
      formatDate: function(dateStr, format) {
        var d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr || '-';
        format = format || 'YYYY-MM-DD';
        var year = d.getFullYear();
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        var hours = String(d.getHours()).padStart(2, '0');
        var minutes = String(d.getMinutes()).padStart(2, '0');
        return format.replace('YYYY', year)
                     .replace('MM', month)
                     .replace('DD', day)
                     .replace('HH', hours)
                     .replace('mm', minutes);
      },
      
      getRiskLevel: function(rate) {
        rate = parseFloat(rate) || 0;
        if (rate >= 8) return { level: 'danger', label: '高风险', color: '#dc2626' };
        if (rate >= 5) return { level: 'warning', label: '中风险', color: '#d97706' };
        if (rate >= 3) return { level: 'info', label: '低风险', color: '#2563eb' };
        return { level: 'success', label: '安全', color: '#16a34a' };
      },
      
      generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
      },
      
      debounce: function(func, wait) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(function() { func.apply(context, args); }, wait);
        };
      }
    },

    notifications: {
      container: null,
      
      init: function() {
        var container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        this.container = container;
      },
      
      show: function(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;
        
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.innerHTML = '&lt;div class="notification-content"&gt;' + message + '&lt;/div&gt;';
        
        this.container.appendChild(notification);
        
        setTimeout(function() {
          notification.style.animation = 'fadeOut 0.3s ease forwards';
          setTimeout(function() {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }, duration);
      },
      
      success: function(msg) { this.show(msg, 'success', 3000); },
      error: function(msg) { this.show(msg, 'error', 5000); },
      warning: function(msg) { this.show(msg, 'warning', 4000); },
      info: function(msg) { this.show(msg, 'info', 3000); }
    },

    loading: {
      overlay: null,
      
      show: function(text) {
        text = text || '加载中...';
        if (!this.overlay) {
          this.overlay = document.createElement('div');
          this.overlay.id = 'loading-overlay';
          this.overlay.className = 'loading-overlay';
          this.overlay.innerHTML = '&lt;div class="loading-spinner"&gt;&lt;/div&gt;&lt;div class="loading-text"&gt;' + text + '&lt;/div&gt;';
          document.body.appendChild(this.overlay);
        } else {
          this.overlay.querySelector('.loading-text').textContent = text;
          this.overlay.style.display = 'flex';
        }
        AdminApp.state.isLoading = true;
      },
      
      hide: function() {
        if (this.overlay) {
          this.overlay.style.display = 'none';
        }
        AdminApp.state.isLoading = false;
      }
    },

    modal: {
      overlay: null,
      container: null,
      
      show: function(options) {
        options = options || {};
        var title = options.title || '';
        var content = options.content || '';
        var width = options.width || '500px';
        var onClose = options.onClose;
        
        this.close();
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        
        this.container = document.createElement('div');
        this.container.className = 'modal-container';
        this.container.style.maxWidth = width;
        
        var headerHtml = '&lt;div class="modal-header"&gt;';
        headerHtml += '&lt;h3 class="modal-title"&gt;' + title + '&lt;/h3&gt;';
        headerHtml += '&lt;button class="modal-close" onclick="AdminApp.modal.close()"&gt;&amp;times;&lt;/button&gt;';
        headerHtml += '&lt;/div&gt;';
        
        var bodyHtml = '&lt;div class="modal-body"&gt;' + content + '&lt;/div&gt;';
        
        this.container.innerHTML = headerHtml + bodyHtml;
        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';
        
        if (onClose) {
          this.overlay._onClose = onClose;
        }
      },
      
      close: function() {
        if (this.overlay) {
          if (this.overlay._onClose) {
            this.overlay._onClose();
          }
          document.body.removeChild(this.overlay);
          this.overlay = null;
          this.container = null;
          document.body.style.overflow = '';
        }
      }
    },

    init: function() {
      console.log('[AdminApp] 初始化后台管理系统 v' + this.config.version);
      
      this.notifications.init();
      this.initEventListeners();
      this.initNavigation();
      this.checkConnection();
      
      setTimeout(function() {
        AdminApp.loadInitialData();
      }, 500);
      
      console.log('[AdminApp] 初始化完成');
    },
    
    initNavigation: function() {
      var menuItems = [
        { id: 'dashboard', icon: '📊', label: '仪表板', module: 'dashboard' },
        { id: 'reports', icon: '📋', label: '报告管理', module: 'reports' },
        { id: 'upload', icon: '📤', label: '数据上传', module: 'upload' },
        { id: 'stores', icon: '🏪', label: '店铺数据', module: 'stores' },
        { id: 'monthly', icon: '📅', label: '月度趋势', module: 'monthly' },
        { id: 'provinces', icon: '🗺️', label: '省份分析', module: 'provinces' },
        { id: 'sources', icon: '📊', label: '来源分析', module: 'sources' },
        { id: 'audit', icon: '🔍', label: '审核数据', module: 'audit' },
        { id: 'settings', icon: '⚙️', label: '系统设置', module: 'settings' }
      ];
      
      var navHtml = '&lt;nav class="sidebar-nav"&gt;&lt;ul class="nav-list"&gt;';
      menuItems.forEach(function(item) {
        var activeClass = item.id === 'dashboard' ? ' active' : '';
        navHtml += '&lt;li class="nav-item" data-module="' + item.id + '"&gt;';
        navHtml += '&lt;a href="#" class="nav-link' + activeClass + '" data-module="' + item.id + '"&gt;';
        navHtml += '&lt;span class="nav-icon"&gt;' + item.icon + '&lt;/span&gt;';
        navHtml += '&lt;span class="nav-label"&gt;' + item.label + '&lt;/span&gt;';
        navHtml += '&lt;/a&gt;&lt;/li&gt;';
      });
      navHtml += '&lt;/ul&gt;&lt;/nav&gt;';
      
      var sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.innerHTML = '&lt;div class="sidebar-header"&gt;&lt;h2&gt;🔧 管理后台&lt;/h2&gt;&lt;/div&gt;' + navHtml;
      }
    },
    
    initEventListeners: function() {
      var that = this;
      
      document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-link')) {
          e.preventDefault();
          var moduleId = e.target.closest('.nav-link').dataset.module;
          that.switchModule(moduleId);
        }
      });
    },
    
    switchModule: function(moduleId) {
      console.log('[AdminApp] 切换到模块:', moduleId);
      
      document.querySelectorAll('.nav-link').forEach(function(el) {
        el.classList.toggle('active', el.dataset.module === moduleId);
      });
      
      var modules = ['dashboard', 'reports', 'upload', 'stores', 'monthly', 'provinces', 'sources', 'audit', 'settings'];
      modules.forEach(function(m) {
        var el = document.getElementById('module-' + m);
        if (el) {
          el.classList.toggle('active', m === moduleId);
        }
      });
      
      if (AdminApp.modules[moduleId] && AdminApp.modules[moduleId].init) {
        AdminApp.modules[moduleId].init();
      }
    },
    
    checkConnection: function() {
      var statusEl = document.getElementById('db-status');
      if (statusEl) {
        statusEl.innerHTML = '&lt;span class="status-indicator checking"&gt;&lt;/span&gt;检查中...';
      }
      
      if (typeof DbApi !== 'undefined') {
        DbApi.getReports().then(function(data) {
          AdminApp.state.dbConnected = true;
          AdminApp.state.reports = data || [];
          if (statusEl) {
            statusEl.innerHTML = '&lt;span class="status-indicator connected"&gt;&lt;/span&gt;已连接';
          }
          AdminApp.notifications.success('数据库连接成功');
        }).catch(function(err) {
          AdminApp.state.dbConnected = false;
          if (statusEl) {
            statusEl.innerHTML = '&lt;span class="status-indicator error"&gt;&lt;/span&gt;连接失败';
          }
          AdminApp.notifications.warning('数据库连接失败: ' + err.message);
        });
      }
    },
    
    loadInitialData: function() {
      var promises = [];
      
      if (typeof DbApi !== 'undefined') {
        promises.push(DbApi.getReports().then(function(data) {
          AdminApp.state.reports = data || [];
          if (data.length > 0) {
            AdminApp.state.currentReport = data[0];
          }
        }));
        
        promises.push(DbApi.getStores().then(function(data) {
          AdminApp.state.stores = data || [];
        }));
        
        promises.push(DbApi.getMonthlyData().then(function(data) {
          AdminApp.state.monthlyData = data || [];
        }));
        
        promises.push(DbApi.getProvinceData().then(function(data) {
          AdminApp.state.provinceData = data || [];
        }));
        
        promises.push(DbApi.getSourceData().then(function(data) {
          AdminApp.state.sourceData = data || [];
        }));
      }
      
      Promise.all(promises).then(function() {
        AdminApp.updateDashboard();
        if (AdminApp.modules.dashboard && AdminApp.modules.dashboard.render) {
          AdminApp.modules.dashboard.render();
        }
      }).catch(function(err) {
        console.error('[AdminApp] 加载数据失败:', err);
      });
    },
    
    updateDashboard: function() {
      var stats = {
        reportCount: AdminApp.state.reports.length,
        totalOrders: 0,
        avgDpd30: 0,
        storeCount: AdminApp.state.stores.length
      };
      
      AdminApp.state.reports.forEach(function(r) {
        stats.totalOrders += r.total_orders || 0;
        stats.avgDpd30 += parseFloat(r.dpd30_rate) || 0;
      });
      
      if (AdminApp.state.reports.length > 0) {
        stats.avgDpd30 = (stats.avgDpd30 / AdminApp.state.reports.length).toFixed(2);
      }
      
      var statCards = document.querySelectorAll('.stat-value');
      if (statCards.length >= 4) {
        statCards[0].textContent = AdminApp.utils.formatNumber(stats.reportCount);
        statCards[1].textContent = AdminApp.utils.formatNumber(stats.totalOrders);
        statCards[2].textContent = stats.avgDpd30 + '%';
        statCards[3].textContent = AdminApp.utils.formatNumber(stats.storeCount);
      }
    },
    
    refreshData: function() {
      AdminApp.loading.show('刷新数据中...');
      AdminApp.loadInitialData().then(function() {
        AdminApp.loading.hide();
        AdminApp.notifications.success('数据刷新成功');
      }).catch(function(err) {
        AdminApp.loading.hide();
        AdminApp.notifications.error('刷新失败: ' + err.message);
      });
    }
  };

  AdminApp.modules = {};

  window.AdminApp = AdminApp;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      AdminApp.init();
    });
  } else {
    AdminApp.init();
  }

})(window);
