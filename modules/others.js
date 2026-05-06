
(function(AdminApp) {
  'use strict';

  AdminApp.modules.provinces = {
    init: function() {
      console.log('[Provinces] 初始化模块');
      this.render();
    },

    render: function() {
      this.renderProvinceData();
    },

    renderProvinceData: function() {
      var container = document.getElementById('provinces-container');
      if (!container) return;

      var data = AdminApp.state.provinceData;

      if (data.length === 0) {
        container.innerHTML = this.getEmptyState();
        return;
      }

      var sortedData = data.slice().sort(function(a, b) {
        return (b.total_orders || 0) - (a.total_orders || 0);
      });

      container.innerHTML = '&lt;div class="stats-grid" style="margin-bottom: 24px;"&gt;' +
        '&lt;div class="stat-card"&gt;' +
        '&lt;div class="stat-label"&gt;覆盖省份&lt;/div&gt;' +
        '&lt;div class="stat-value"&gt;' + data.length + '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="stat-card"&gt;' +
        '&lt;div class="stat-label"&gt;总订单数&lt;/div&gt;' +
        '&lt;div class="stat-value"&gt;' + AdminApp.utils.formatNumber(sortedData.reduce(function(sum, p) { return sum + (p.total_orders || 0); }, 0)) + '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="stat-card"&gt;' +
        '&lt;div class="stat-label"&gt;平均DPD30+&lt;/div&gt;' +
        '&lt;div class="stat-value"&gt;' + (sortedData.length > 0 ? (sortedData.reduce(function(sum, p) { return sum + (parseFloat(p.dpd30_rate) || 0); }, 0) / sortedData.length).toFixed(2) : 0) + '%&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;省份数据&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;div style="overflow-x: auto;"&gt;' +
        '&lt;table class="data-table"&gt;' +
        '&lt;thead&gt;&lt;tr&gt;' +
        '&lt;th&gt;省份&lt;/th&gt;' +
        '&lt;th&gt;订单数&lt;/th&gt;' +
        '&lt;th&gt;占比&lt;/th&gt;' +
        '&lt;th&gt;DPD30+ (%)&lt;/th&gt;' +
        '&lt;th&gt;DPD90+ (%)&lt;/th&gt;' +
        '&lt;th&gt;风险等级&lt;/th&gt;' +
        '&lt;/tr&gt;&lt;/thead&gt;' +
        '&lt;tbody&gt;' + sortedData.map(function(p) {
          var name = p.province_name || p.name || '未知';
          var orders = p.total_orders || 0;
          var dpd30 = parseFloat(p.dpd30_rate) || 0;
          var dpd90 = parseFloat(p.dpd90_rate) || 0;
          var risk = AdminApp.utils.getRiskLevel(dpd30);
          var totalOrders = sortedData.reduce(function(sum, p) { return sum + (p.total_orders || 0); }, 0);
          var percentage = totalOrders &gt; 0 ? ((orders / totalOrders) * 100).toFixed(1) : 0;
          
          return '&lt;tr&gt;' +
                 '&lt;td&gt;&lt;strong&gt;' + name + '&lt;/strong&gt;&lt;/td&gt;' +
                 '&lt;td&gt;' + AdminApp.utils.formatNumber(orders) + '&lt;/td&gt;' +
                 '&lt;td&gt;' + percentage + '%&lt;/td&gt;' +
                 '&lt;td&gt;' + dpd30.toFixed(2) + '%&lt;/td&gt;' +
                 '&lt;td&gt;' + dpd90.toFixed(2) + '%&lt;/td&gt;' +
                 '&lt;td&gt;&lt;span class="badge badge-' + risk.level + '"&gt;' + risk.label + '&lt;/span&gt;&lt;/td&gt;' +
                 '&lt;/tr&gt;';
        }).join('') + '&lt;/tbody&gt;' +
        '&lt;/table&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';
    },

    getEmptyState: function() {
      return '&lt;div class="empty-state"&gt;' +
             '&lt;div class="empty-icon"&gt;🗺️&lt;/div&gt;' +
             '&lt;div class="empty-title"&gt;暂无省份数据&lt;/div&gt;' +
             '&lt;div class="empty-description"&gt;上传数据后将显示省份分布&lt;/div&gt;' +
             '&lt;button class="btn btn-primary" onclick="AdminApp.switchModule(\'upload\')"&gt;去上传数据&lt;/button&gt;' +
             '&lt;/div&gt;';
    }
  };

  AdminApp.modules.sources = {
    init: function() {
      console.log('[Sources] 初始化模块');
      this.render();
    },

    render: function() {
      this.renderSourceData();
    },

    renderSourceData: function() {
      var container = document.getElementById('sources-container');
      if (!container) return;

      var data = AdminApp.state.sourceData;

      if (data.length === 0) {
        container.innerHTML = this.getEmptyState();
        return;
      }

      var sortedData = data.slice().sort(function(a, b) {
        return (b.total_orders || 0) - (a.total_orders || 0);
      });

      container.innerHTML = '&lt;div class="card"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;渠道来源数据&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;div style="overflow-x: auto;"&gt;' +
        '&lt;table class="data-table"&gt;' +
        '&lt;thead&gt;&lt;tr&gt;' +
        '&lt;th&gt;店铺&lt;/th&gt;' +
        '&lt;th&gt;渠道来源&lt;/th&gt;' +
        '&lt;th&gt;订单数&lt;/th&gt;' +
        '&lt;th&gt;DPD30+ (%)&lt;/th&gt;' +
        '&lt;th&gt;DPD90+ (%)&lt;/th&gt;' +
        '&lt;th&gt;风险等级&lt;/th&gt;' +
        '&lt;/tr&gt;&lt;/thead&gt;' +
        '&lt;tbody&gt;' + sortedData.map(function(s) {
          var storeName = s.store_name || '未知';
          var sourceName = s.source_name || '未知';
          var orders = s.total_orders || 0;
          var dpd30 = parseFloat(s.dpd30_rate) || 0;
          var dpd90 = parseFloat(s.dpd90_rate) || 0;
          var risk = AdminApp.utils.getRiskLevel(dpd30);
          
          return '&lt;tr&gt;' +
                 '&lt;td&gt;&lt;strong&gt;' + storeName + '&lt;/strong&gt;&lt;/td&gt;' +
                 '&lt;td&gt;' + sourceName + '&lt;/td&gt;' +
                 '&lt;td&gt;' + AdminApp.utils.formatNumber(orders) + '&lt;/td&gt;' +
                 '&lt;td&gt;' + dpd30.toFixed(2) + '%&lt;/td&gt;' +
                 '&lt;td&gt;' + dpd90.toFixed(2) + '%&lt;/td&gt;' +
                 '&lt;td&gt;&lt;span class="badge badge-' + risk.level + '"&gt;' + risk.label + '&lt;/span&gt;&lt;/td&gt;' +
                 '&lt;/tr&gt;';
        }).join('') + '&lt;/tbody&gt;' +
        '&lt;/table&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';
    },

    getEmptyState: function() {
      return '&lt;div class="empty-state"&gt;' +
             '&lt;div class="empty-icon"&gt;📊&lt;/div&gt;' +
             '&lt;div class="empty-title"&gt;暂无渠道数据&lt;/div&gt;' +
             '&lt;div class="empty-description"&gt;上传数据后将显示渠道来源&lt;/div&gt;' +
             '&lt;button class="btn btn-primary" onclick="AdminApp.switchModule(\'upload\')"&gt;去上传数据&lt;/button&gt;' +
             '&lt;/div&gt;';
    }
  };

  AdminApp.modules.audit = {
    init: function() {
      console.log('[Audit] 初始化模块');
      this.render();
    },

    render: function() {
      var container = document.getElementById('audit-container');
      if (!container) return;

      container.innerHTML = '&lt;div class="card"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;审核数据管理&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;p style="color: #64748b; margin-bottom: 24px;"&gt;审核数据功能开发中，将支持审核记录的导入、查看和分析。&lt;/p&gt;' +
        '&lt;div style="display: flex; gap: 12px;"&gt;' +
        '&lt;button class="btn btn-secondary" disabled&gt;📥 导入审核数据&lt;/button&gt;' +
        '&lt;button class="btn btn-secondary" disabled&gt;📊 审核分析&lt;/button&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';
    }
  };

  AdminApp.modules.settings = {
    init: function() {
      console.log('[Settings] 初始化模块');
      this.render();
    },

    render: function() {
      var container = document.getElementById('settings-container');
      if (!container) return;

      container.innerHTML = '&lt;div class="card" style="margin-bottom: 24px;"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;数据库连接&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;div style="display: flex; justify-content: space-between; align-items: center;"&gt;' +
        '&lt;div&gt;' +
        '&lt;div style="font-weight: 600; margin-bottom: 4px;"&gt;Supabase 连接状态&lt;/div&gt;' +
        '&lt;div style="color: #64748b;"&gt;URL: ' + (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '未配置') + '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div&gt;' +
        '&lt;span id="settings-db-status" class="badge badge-' + (AdminApp.state.dbConnected ? 'success' : 'danger') + '"&gt;' + 
        (AdminApp.state.dbConnected ? '✅ 已连接' : '❌ 未连接') + 
        '&lt;/span&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div style="margin-top: 20px;"&gt;' +
        '&lt;button class="btn btn-secondary" onclick="AdminApp.checkConnection()"&gt;测试连接&lt;/button&gt;' +
        '&lt;button class="btn btn-primary" onclick="AdminApp.refreshData()" style="margin-left: 12px;"&gt;刷新数据&lt;/button&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card" style="margin-bottom: 24px;"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;前台数据同步&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;p style="color: #64748b; margin-bottom: 16px;"&gt;选择要在前台显示的报告数据。&lt;/p&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;当前报告&lt;/label&gt;' +
        '&lt;select class="form-select" id="current-report-select"&gt;' +
        '&lt;option value=""&gt;请选择&lt;/option&gt;' +
        AdminApp.state.reports.map(function(r) {
          var selected = AdminApp.state.currentReport && AdminApp.state.currentReport.id === r.id ? ' selected' : '';
          return '&lt;option value="' + r.id + '"' + selected + '&gt;' + (r.title || '未命名') + ' - ' + (r.period || '') + '&lt;/option&gt;';
        }).join('') +
        '&lt;/select&gt;' +
        '&lt;/div&gt;' +
        '&lt;button class="btn btn-primary" onclick="AdminApp.modules.settings.syncToFrontend()"&gt;同步到前台&lt;/button&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;系统信息&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;table class="data-table"&gt;' +
        '&lt;tbody&gt;' +
        '&lt;tr&gt;&lt;td&gt;系统版本&lt;/td&gt;&lt;td&gt;' + AdminApp.config.version + '&lt;/td&gt;&lt;/tr&gt;' +
        '&lt;tr&gt;&lt;td&gt;报告数量&lt;/td&gt;&lt;td&gt;' + AdminApp.state.reports.length + '&lt;/td&gt;&lt;/tr&gt;' +
        '&lt;tr&gt;&lt;td&gt;店铺数量&lt;/td&gt;&lt;td&gt;' + AdminApp.state.stores.length + '&lt;/td&gt;&lt;/tr&gt;' +
        '&lt;tr&gt;&lt;td&gt;运行环境&lt;/td&gt;&lt;td&gt;' + navigator.userAgent.split(' ').pop() + '&lt;/td&gt;&lt;/tr&gt;' +
        '&lt;/tbody&gt;' +
        '&lt;/table&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';
    },

    syncToFrontend: function() {
      var select = document.getElementById('current-report-select');
      var reportId = select ? select.value : null;

      if (!reportId) {
        AdminApp.notifications.warning('请选择要同步的报告');
        return;
      }

      AdminApp.loading.show('同步中...');

      var report = AdminApp.state.reports.find(function(r) { return r.id == reportId; });
      if (report) {
        AdminApp.state.currentReport = report;

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('currentReportId', reportId);
        }

        if (typeof updateFrontendData === 'function') {
          updateFrontendData(reportId);
        }
      }

      setTimeout(function() {
        AdminApp.loading.hide();
        AdminApp.notifications.success('数据已同步到前台');
      }, 500);
    }
  };

})(AdminApp);
