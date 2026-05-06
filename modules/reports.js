
(function(AdminApp) {
  'use strict';

  AdminApp.modules.reports = {
    init: function() {
      console.log('[Reports] 初始化模块');
      this.render();
    },

    render: function() {
      this.renderReportGrid();
    },

    renderReportGrid: function() {
      var container = document.getElementById('reports-grid');
      if (!container) return;

      var reports = AdminApp.state.reports;

      if (reports.length === 0) {
        container.innerHTML = this.getEmptyState();
        return;
      }

      container.innerHTML = '&lt;div class="report-grid"&gt;' + 
        reports.map(function(r) {
          var risk = AdminApp.utils.getRiskLevel(r.dpd30_rate);
          return '&lt;div class="report-card"&gt;' +
                 '&lt;div class="report-header"&gt;' +
                 '&lt;h3 class="report-title"&gt;' + (r.title || '未命名报告') + '&lt;/h3&gt;' +
                 '&lt;span class="badge badge-' + risk.level + '"&gt;' + risk.label + '&lt;/span&gt;' +
                 '&lt;/div&gt;' +
                 '&lt;div class="report-meta"&gt;' +
                 '&lt;div&gt;&lt;strong&gt;周期:&lt;/strong&gt; ' + (r.period || '-') + '&lt;/div&gt;' +
                 '&lt;div&gt;&lt;strong&gt;订单数:&lt;/strong&gt; ' + AdminApp.utils.formatNumber(r.total_orders) + '&lt;/div&gt;' +
                 '&lt;div&gt;&lt;strong&gt;DPD30+:&lt;/strong&gt; ' + (parseFloat(r.dpd30_rate) || 0).toFixed(2) + '%&lt;/div&gt;' +
                 '&lt;div&gt;&lt;strong&gt;DPD90+:&lt;/strong&gt; ' + (parseFloat(r.dpd90_rate) || 0).toFixed(2) + '%&lt;/div&gt;' +
                 '&lt;div&gt;&lt;strong&gt;创建时间:&lt;/strong&gt; ' + AdminApp.utils.formatDate(r.created_at, 'YYYY-MM-DD HH:mm') + '&lt;/div&gt;' +
                 '&lt;/div&gt;' +
                 '&lt;div class="report-actions"&gt;' +
                 '&lt;button class="btn btn-sm btn-primary" onclick="AdminApp.modules.reports.viewReport(' + r.id + ')"&gt;查看&lt;/button&gt;' +
                 '&lt;button class="btn btn-sm btn-secondary" onclick="AdminApp.modules.reports.editReport(' + r.id + ')"&gt;编辑&lt;/button&gt;' +
                 '&lt;button class="btn btn-sm btn-danger" onclick="AdminApp.modules.reports.deleteReport(' + r.id + ')"&gt;删除&lt;/button&gt;' +
                 '&lt;/div&gt;' +
                 '&lt;/div&gt;';
        }).join('') + '&lt;/div&gt;';
    },

    viewReport: function(reportId) {
      AdminApp.loading.show('加载报告...');
      
      Promise.all([
        DbApi.getReport(reportId),
        DbApi.getStores(reportId),
        DbApi.getMonthlyData(reportId),
        DbApi.getProvinceData(reportId),
        DbApi.getSourceData(reportId)
      ]).then(function(results) {
        AdminApp.loading.hide();
        
        var report = results[0];
        var stores = results[1] || [];
        var monthly = results[2] || [];
        var provinces = results[3] || [];
        var sources = results[4] || [];

        var modalContent = '&lt;div style="max-height: 70vh; overflow-y: auto;"&gt;' +
          '&lt;h4 style="margin-top: 0; margin-bottom: 20px;"&gt;报告详情&lt;/h4&gt;' +
          '&lt;div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;"&gt;' +
          '&lt;div style="padding: 16px; background: #f8fafc; border-radius: 8px;"&gt;' +
          '&lt;div style="font-size: 13px; color: #64748b;"&gt;总订单数&lt;/div&gt;' +
          '&lt;div style="font-size: 24px; font-weight: 700;"&gt;' + AdminApp.utils.formatNumber(report.total_orders) + '&lt;/div&gt;' +
          '&lt;/div&gt;' +
          '&lt;div style="padding: 16px; background: #f8fafc; border-radius: 8px;"&gt;' +
          '&lt;div style="font-size: 13px; color: #64748b;"&gt;DPD30+ 逾期率&lt;/div&gt;' +
          '&lt;div style="font-size: 24px; font-weight: 700;"&gt;' + (parseFloat(report.dpd30_rate) || 0).toFixed(2) + '%&lt;/div&gt;' +
          '&lt;/div&gt;' +
          '&lt;div style="padding: 16px; background: #f8fafc; border-radius: 8px;"&gt;' +
          '&lt;div style="font-size: 13px; color: #64748b;"&gt;DPD90+ 逾期率&lt;/div&gt;' +
          '&lt;div style="font-size: 24px; font-weight: 700;"&gt;' + (parseFloat(report.dpd90_rate) || 0).toFixed(2) + '%&lt;/div&gt;' +
          '&lt;/div&gt;' +
          '&lt;div style="padding: 16px; background: #f8fafc; border-radius: 8px;"&gt;' +
          '&lt;div style="font-size: 13px; color: #64748b;"&gt;店铺数&lt;/div&gt;' +
          '&lt;div style="font-size: 24px; font-weight: 700;"&gt;' + (report.store_count || stores.length) + '&lt;/div&gt;' +
          '&lt;/div&gt;' +
          '&lt;/div&gt;' +
          '&lt;div&gt;&lt;strong&gt;店铺数据 (' + stores.length + ' 个)&lt;/strong&gt;&lt;/div&gt;' +
          '&lt;div style="max-height: 200px; overflow-y: auto; margin-top: 8px;"&gt;' +
          '&lt;table class="data-table" style="font-size: 13px;"&gt;' +
          '&lt;thead&gt;&lt;tr&gt;&lt;th&gt;店铺&lt;/th&gt;&lt;th&gt;订单数&lt;/th&gt;&lt;th&gt;DPD30+&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt;' +
          '&lt;tbody&gt;' + stores.slice(0, 10).map(function(s) {
            return '&lt;tr&gt;&lt;td&gt;' + (s.store_name || s.name) + '&lt;/td&gt;' +
                   '&lt;td&gt;' + AdminApp.utils.formatNumber(s.total_orders) + '&lt;/td&gt;' +
                   '&lt;td&gt;' + (parseFloat(s.dpd30_rate) || 0).toFixed(2) + '%&lt;/td&gt;&lt;/tr&gt;';
          }).join('') + '&lt;/tbody&gt;' +
          '&lt;/table&gt;' +
          '&lt;/div&gt;' +
          '&lt;div style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;"&gt;' +
          '&lt;button class="btn btn-secondary" onclick="AdminApp.modal.close()"&gt;关闭&lt;/button&gt;' +
          '&lt;button class="btn btn-primary" onclick="AdminApp.modules.reports.setAsCurrent(' + reportId + ')"&gt;设为当前报告&lt;/button&gt;' +
          '&lt;/div&gt;' +
          '&lt;/div&gt;';

        AdminApp.modal.show({
          title: report.title || '报告详情',
          content: modalContent,
          width: '800px'
        });
      }).catch(function(err) {
        AdminApp.loading.hide();
        AdminApp.notifications.error('加载报告失败: ' + err.message);
      });
    },

    editReport: function(reportId) {
      var report = AdminApp.state.reports.find(function(r) { return r.id === reportId; });
      if (!report) return;

      var modalContent = '&lt;form id="edit-report-form"&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;报告标题&lt;/label&gt;' +
        '&lt;input type="text" class="form-input" id="edit-report-title" value="' + (report.title || '') + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;数据周期&lt;/label&gt;' +
        '&lt;input type="text" class="form-input" id="edit-report-period" value="' + (report.period || '') + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;总订单数&lt;/label&gt;' +
        '&lt;input type="number" class="form-input" id="edit-report-orders" value="' + (report.total_orders || 0) + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;DPD30+ 逾期率 (%)&lt;/label&gt;' +
        '&lt;input type="number" step="0.01" class="form-input" id="edit-report-dpd30" value="' + (parseFloat(report.dpd30_rate) || 0) + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;DPD90+ 逾期率 (%)&lt;/label&gt;' +
        '&lt;input type="number" step="0.01" class="form-input" id="edit-report-dpd90" value="' + (parseFloat(report.dpd90_rate) || 0) + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;"&gt;' +
        '&lt;button type="button" class="btn btn-secondary" onclick="AdminApp.modal.close()"&gt;取消&lt;/button&gt;' +
        '&lt;button type="submit" class="btn btn-primary"&gt;保存&lt;/button&gt;' +
        '&lt;/div&gt;' +
        '&lt;/form&gt;';

      AdminApp.modal.show({
        title: '编辑报告',
        content: modalContent,
        width: '500px'
      });

      var form = document.getElementById('edit-report-form');
      if (form) {
        form.onsubmit = function(e) {
          e.preventDefault();
          AdminApp.modules.reports.saveReport(reportId);
        };
      }
    },

    saveReport: function(reportId) {
      var title = document.getElementById('edit-report-title').value;
      var period = document.getElementById('edit-report-period').value;
      var orders = parseInt(document.getElementById('edit-report-orders').value) || 0;
      var dpd30 = parseFloat(document.getElementById('edit-report-dpd30').value) || 0;
      var dpd90 = parseFloat(document.getElementById('edit-report-dpd90').value) || 0;

      AdminApp.loading.show('保存中...');

      DbApi.updateReport(reportId, {
        title: title,
        period: period,
        total_orders: orders,
        dpd30_rate: dpd30,
        dpd90_rate: dpd90
      }).then(function() {
        AdminApp.loading.hide();
        AdminApp.modal.close();
        AdminApp.notifications.success('报告保存成功');
        AdminApp.refreshData();
      }).catch(function(err) {
        AdminApp.loading.hide();
        AdminApp.notifications.error('保存失败: ' + err.message);
      });
    },

    deleteReport: function(reportId) {
      if (!confirm('确定要删除此报告吗？此操作不可恢复。')) return;

      AdminApp.loading.show('删除中...');

      DbApi.deleteReport(reportId).then(function() {
        AdminApp.loading.hide();
        AdminApp.notifications.success('报告已删除');
        AdminApp.refreshData();
      }).catch(function(err) {
        AdminApp.loading.hide();
        AdminApp.notifications.error('删除失败: ' + err.message);
      });
    },

    setAsCurrent: function(reportId) {
      var report = AdminApp.state.reports.find(function(r) { return r.id === reportId; });
      if (report) {
        AdminApp.state.currentReport = report;
        AdminApp.notifications.success('已设为当前报告');
        AdminApp.modal.close();
        
        if (typeof updateFrontendData === 'function') {
          updateFrontendData(reportId);
        }
      }
    },

    getEmptyState: function() {
      return '&lt;div class="empty-state"&gt;' +
             '&lt;div class="empty-icon"&gt;📋&lt;/div&gt;' +
             '&lt;div class="empty-title"&gt;暂无报告&lt;/div&gt;' +
             '&lt;div class="empty-description"&gt;上传数据后将自动创建报告&lt;/div&gt;' +
             '&lt;button class="btn btn-primary" onclick="AdminApp.switchModule(\'upload\')"&gt;去上传数据&lt;/button&gt;' +
             '&lt;/div&gt;';
    }
  };

})(AdminApp);
