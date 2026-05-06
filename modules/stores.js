
(function(AdminApp) {
  'use strict';

  AdminApp.modules.stores = {
    init: function() {
      console.log('[Stores] 初始化模块');
      this.render();
    },

    render: function() {
      this.renderStoreList();
    },

    renderStoreList: function() {
      var container = document.getElementById('stores-container');
      if (!container) return;

      var stores = AdminApp.state.stores;

      if (stores.length === 0) {
        container.innerHTML = this.getEmptyState();
        return;
      }

      container.innerHTML = '&lt;div class="card"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;店铺数据 (' + stores.length + ' 个)&lt;/h3&gt;' +
        '&lt;div class="card-actions"&gt;' +
        '&lt;input type="text" class="form-input" id="store-search" placeholder="搜索店铺..." style="width: 250px; padding: 8px 12px;"&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;div style="overflow-x: auto;"&gt;' +
        '&lt;table class="data-table" id="stores-table"&gt;' +
        '&lt;thead&gt;&lt;tr&gt;' +
        '&lt;th&gt;店铺名称&lt;/th&gt;' +
        '&lt;th&gt;订单数&lt;/th&gt;' +
        '&lt;th&gt;DPD30+ (%)&lt;/th&gt;' +
        '&lt;th&gt;DPD90+ (%)&lt;/th&gt;' +
        '&lt;th&gt;风险等级&lt;/th&gt;' +
        '&lt;th&gt;操作&lt;/th&gt;' +
        '&lt;/tr&gt;&lt;/thead&gt;' +
        '&lt;tbody id="stores-tbody"&gt;' + this.renderStoreRows(stores) + '&lt;/tbody&gt;' +
        '&lt;/table&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';

      var searchInput = document.getElementById('store-search');
      if (searchInput) {
        var that = this;
        searchInput.addEventListener('input', AdminApp.utils.debounce(function(e) {
          that.filterStores(e.target.value);
        }, 300));
      }
    },

    renderStoreRows: function(stores) {
      return stores.map(function(s) {
        var name = s.store_name || s.name || '未知店铺';
        var orders = s.total_orders || 0;
        var dpd30 = parseFloat(s.dpd30_rate) || 0;
        var dpd90 = parseFloat(s.dpd90_rate) || 0;
        var risk = AdminApp.utils.getRiskLevel(dpd30);
        
        return '&lt;tr&gt;' +
               '&lt;td&gt;&lt;strong&gt;' + name + '&lt;/strong&gt;&lt;/td&gt;' +
               '&lt;td&gt;' + AdminApp.utils.formatNumber(orders) + '&lt;/td&gt;' +
               '&lt;td&gt;' + dpd30.toFixed(2) + '%&lt;/td&gt;' +
               '&lt;td&gt;' + dpd90.toFixed(2) + '%&lt;/td&gt;' +
               '&lt;td&gt;&lt;span class="badge badge-' + risk.level + '"&gt;' + risk.label + '&lt;/span&gt;&lt;/td&gt;' +
               '&lt;td&gt;&lt;button class="btn btn-sm btn-secondary" onclick="AdminApp.modules.stores.editStore(' + (s.id || "''") + ", '" + name.replace(/'/g, "\\'") + "')" + '"&gt;编辑&lt;/button&gt;&lt;/td&gt;' +
               '&lt;/tr&gt;';
      }).join('');
    },

    filterStores: function(keyword) {
      var tbody = document.getElementById('stores-tbody');
      if (!tbody) return;

      var filtered = AdminApp.state.stores.filter(function(s) {
        var name = (s.store_name || s.name || '').toLowerCase();
        return name.includes(keyword.toLowerCase());
      });

      tbody.innerHTML = this.renderStoreRows(filtered);
    },

    editStore: function(storeId, storeName) {
      var store = AdminApp.state.stores.find(function(s) {
        return s.id === storeId || (s.store_name || s.name) === storeName;
      });

      if (!store) return;

      var modalContent = '&lt;form id="edit-store-form"&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;店铺名称&lt;/label&gt;' +
        '&lt;input type="text" class="form-input" id="edit-store-name" value="' + (store.store_name || store.name || '') + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;订单数&lt;/label&gt;' +
        '&lt;input type="number" class="form-input" id="edit-store-orders" value="' + (store.total_orders || 0) + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;DPD30+ 逾期率 (%)&lt;/label&gt;' +
        '&lt;input type="number" step="0.01" class="form-input" id="edit-store-dpd30" value="' + (parseFloat(store.dpd30_rate) || 0) + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;DPD90+ 逾期率 (%)&lt;/label&gt;' +
        '&lt;input type="number" step="0.01" class="form-input" id="edit-store-dpd90" value="' + (parseFloat(store.dpd90_rate) || 0) + '"&gt;' +
        '&lt;/div&gt;' +
        '&lt;div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;"&gt;' +
        '&lt;button type="button" class="btn btn-secondary" onclick="AdminApp.modal.close()"&gt;取消&lt;/button&gt;' +
        '&lt;button type="submit" class="btn btn-primary"&gt;保存&lt;/button&gt;' +
        '&lt;/div&gt;' +
        '&lt;/form&gt;';

      AdminApp.modal.show({
        title: '编辑店铺',
        content: modalContent,
        width: '500px'
      });

      var form = document.getElementById('edit-store-form');
      if (form) {
        var that = this;
        form.onsubmit = function(e) {
          e.preventDefault();
          that.saveStore(store);
        };
      }
    },

    saveStore: function(store) {
      var name = document.getElementById('edit-store-name').value;
      var orders = parseInt(document.getElementById('edit-store-orders').value) || 0;
      var dpd30 = parseFloat(document.getElementById('edit-store-dpd30').value) || 0;
      var dpd90 = parseFloat(document.getElementById('edit-store-dpd90').value) || 0;

      AdminApp.loading.show('保存中...');

      DbApi.updateStore(store.id, {
        store_name: name,
        total_orders: orders,
        dpd30_rate: dpd30,
        dpd90_rate: dpd90
      }).then(function() {
        AdminApp.loading.hide();
        AdminApp.modal.close();
        AdminApp.notifications.success('店铺数据已更新');
        AdminApp.refreshData();
      }).catch(function(err) {
        AdminApp.loading.hide();
        AdminApp.notifications.error('保存失败: ' + err.message);
      });
    },

    getEmptyState: function() {
      return '&lt;div class="empty-state"&gt;' +
             '&lt;div class="empty-icon"&gt;🏪&lt;/div&gt;' +
             '&lt;div class="empty-title"&gt;暂无店铺数据&lt;/div&gt;' +
             '&lt;div class="empty-description"&gt;上传数据后将显示店铺信息&lt;/div&gt;' +
             '&lt;button class="btn btn-primary" onclick="AdminApp.switchModule(\'upload\')"&gt;去上传数据&lt;/button&gt;' +
             '&lt;/div&gt;';
    }
  };

})(AdminApp);
