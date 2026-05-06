
(function(AdminApp) {
  'use strict';

  AdminApp.modules.upload = {
    currentFile: null,
    parsedData: null,

    init: function() {
      console.log('[Upload] 初始化模块');
      this.initUploadZone();
      this.initDownloadTemplate();
    },

    initUploadZone: function() {
      var uploadZone = document.getElementById('upload-zone');
      if (!uploadZone) return;

      var that = this;

      uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadZone.classList.add('dragover');
      });

      uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
      });

      uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        var files = e.dataTransfer.files;
        if (files.length > 0) {
          that.handleFile(files[0]);
        }
      });

      uploadZone.addEventListener('click', function() {
        document.getElementById('file-input').click();
      });

      document.getElementById('file-input').addEventListener('change', function(e) {
        var files = e.target.files;
        if (files.length > 0) {
          that.handleFile(files[0]);
        }
      });
    },

    initDownloadTemplate: function() {
      var btn = document.getElementById('download-template');
      if (btn) {
        btn.addEventListener('click', this.downloadTemplate);
      }
    },

    handleFile: function(file) {
      var that = this;

      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        AdminApp.notifications.error('请上传 Excel 或 CSV 文件');
        return;
      }

      if (file.size > AdminApp.config.uploadFileMaxSize) {
        AdminApp.notifications.error('文件大小超过限制 (最大50MB)');
        return;
      }

      this.currentFile = file;
      this.showFilePreview(file);
      this.parseFile(file);
    },

    showFilePreview: function(file) {
      var previewContainer = document.getElementById('upload-preview');
      if (!previewContainer) return;

      previewContainer.innerHTML = '&lt;div class="upload-preview"&gt;' +
        '&lt;div class="preview-info"&gt;' +
        '&lt;strong&gt;' + file.name + '&lt;/strong&gt;&lt;br&gt;' +
        '大小: ' + (file.size / 1024 / 1024).toFixed(2) + ' MB' +
        '&lt;/div&gt;' +
        '&lt;div class="preview-actions"&gt;' +
        '&lt;button class="btn btn-secondary" onclick="AdminApp.modules.upload.clearFile()"&gt;清除&lt;/button&gt;' +
        '&lt;button class="btn btn-primary" onclick="AdminApp.modules.upload.processAndUpload()" id="upload-btn" disabled&gt;处理并上传&lt;/button&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';
    },

    parseFile: function(file) {
      var that = this;
      AdminApp.notifications.info('正在解析文件...');

      if (typeof XLSX === 'undefined') {
        AdminApp.notifications.error('Excel 解析库未加载');
        return;
      }

      var reader = new FileReader();

      reader.onload = function(e) {
        try {
          var data = new Uint8Array(e.target.result);
          var workbook = XLSX.read(data, { type: 'array' });
          var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          var jsonData = XLSX.utils.sheet_to_json(firstSheet);

          that.parsedData = jsonData;
          
          var preview = document.getElementById('data-preview');
          if (preview && jsonData.length > 0) {
            that.renderDataPreview(jsonData);
          }

          var uploadBtn = document.getElementById('upload-btn');
          if (uploadBtn) {
            uploadBtn.disabled = false;
          }

          AdminApp.notifications.success('解析成功，共 ' + jsonData.length + ' 条数据');
        } catch (err) {
          AdminApp.notifications.error('解析文件失败: ' + err.message);
        }
      };

      reader.onerror = function() {
        AdminApp.notifications.error('读取文件失败');
      };

      reader.readAsArrayBuffer(file);
    },

    renderDataPreview: function(data) {
      var preview = document.getElementById('data-preview');
      if (!preview) return;

      var keys = Object.keys(data[0] || {});

      var html = '&lt;div class="card" style="margin-top: 20px;"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;数据预览 (前10条)&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;div style="overflow-x: auto;"&gt;' +
        '&lt;table class="data-table" style="font-size: 12px;"&gt;' +
        '&lt;thead&gt;&lt;tr&gt;' + keys.slice(0, 8).map(function(k) { return '&lt;th&gt;' + k + '&lt;/th&gt;'; }).join('') + '&lt;/tr&gt;&lt;/thead&gt;' +
        '&lt;tbody&gt;' + data.slice(0, 10).map(function(row) {
          return '&lt;tr&gt;' + keys.slice(0, 8).map(function(k) {
            return '&lt;td&gt;' + (row[k] != null ? row[k] : '') + '&lt;/td&gt;';
          }).join('') + '&lt;/tr&gt;';
        }).join('') + '&lt;/tbody&gt;' +
        '&lt;/table&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';

      preview.innerHTML = html;
    },

    clearFile: function() {
      this.currentFile = null;
      this.parsedData = null;

      var previewContainer = document.getElementById('upload-preview');
      if (previewContainer) previewContainer.innerHTML = '';

      var preview = document.getElementById('data-preview');
      if (preview) preview.innerHTML = '';

      var fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
    },

    processAndUpload: function() {
      if (!this.parsedData || this.parsedData.length === 0) {
        AdminApp.notifications.error('请先上传并解析文件');
        return;
      }

      var that = this;

      AdminApp.modal.show({
        title: '上传数据',
        content: this.getUploadForm(),
        width: '500px'
      });

      setTimeout(function() {
        var form = document.getElementById('upload-form');
        if (form) {
          form.onsubmit = function(e) {
            e.preventDefault();
            that.submitUpload();
          };
        }
      }, 100);
    },

    getUploadForm: function() {
      return '&lt;form id="upload-form"&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;报告标题 *&lt;/label&gt;' +
        '&lt;input type="text" class="form-input" id="upload-title" placeholder="例如: 2026年5月数据汇总" required&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;数据周期 *&lt;/label&gt;' +
        '&lt;input type="text" class="form-input" id="upload-period" placeholder="例如: 2026-05" required&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="form-group"&gt;' +
        '&lt;label class="form-label"&gt;备注&lt;/label&gt;' +
        '&lt;textarea class="form-input" id="upload-notes" rows="3"&gt;&lt;/textarea&gt;' +
        '&lt;/div&gt;' +
        '&lt;div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;"&gt;' +
        '&lt;button type="button" class="btn btn-secondary" onclick="AdminApp.modal.close()"&gt;取消&lt;/button&gt;' +
        '&lt;button type="submit" class="btn btn-primary"&gt;确认上传&lt;/button&gt;' +
        '&lt;/div&gt;' +
        '&lt;/form&gt;';
    },

    submitUpload: function() {
      var title = document.getElementById('upload-title').value;
      var period = document.getElementById('upload-period').value;

      if (!title || !period) {
        AdminApp.notifications.warning('请填写报告标题和数据周期');
        return;
      }

      var that = this;
      AdminApp.loading.show('正在处理数据并上传...');

      try {
        var processed = this.processData(this.parsedData);

        var reportData = {
          title: title,
          period: period,
          total_orders: processed.totalOrders,
          dpd30_rate: processed.avgDpd30,
          dpd90_rate: processed.avgDpd90,
          overdue_count: processed.overdueCount,
          overdue_rate: processed.overdueRate,
          store_count: processed.stores.length,
          stores: processed.stores,
          monthly: processed.monthly,
          provinces: processed.provinces,
          sources: processed.sources
        };

        DbApi.upsertReportFull(reportData).then(function(report) {
          AdminApp.loading.hide();
          AdminApp.modal.close();
          AdminApp.notifications.success('✅ 数据上传成功！报告 ID: ' + report.id);
          
          AdminApp.state.currentReport = report;
          AdminApp.refreshData();
          that.clearFile();

          AdminApp.switchModule('reports');
        }).catch(function(err) {
          AdminApp.loading.hide();
          AdminApp.notifications.error('上传失败: ' + err.message);
        });
      } catch (err) {
        AdminApp.loading.hide();
        AdminApp.notifications.error('处理数据时出错: ' + err.message);
      }
    },

    processData: function(rawData) {
      var keys = Object.keys(rawData[0] || {});
      
      var storeCol = keys.find(function(k) { 
        return k.toLowerCase().includes('店铺') || k.toLowerCase().includes('store'); 
      }) || keys[0];
      
      var orderCol = keys.find(function(k) { 
        return k.toLowerCase().includes('订单') || k.toLowerCase().includes('order'); 
      }) || keys[1];
      
      var dpd30Col = keys.find(function(k) { 
        return k.toLowerCase().includes('dpd30') || k.toLowerCase().includes('30+'); 
      }) || keys[2];
      
      var dpd90Col = keys.find(function(k) { 
        return k.toLowerCase().includes('dpd90') || k.toLowerCase().includes('90+'); 
      }) || keys[3];
      
      var provinceCol = keys.find(function(k) { 
        return k.toLowerCase().includes('省份') || k.toLowerCase().includes('province'); 
      }) || keys[4];
      
      var channelCol = keys.find(function(k) { 
        return k.toLowerCase().includes('渠道') || k.toLowerCase().includes('channel') || k.toLowerCase().includes('source'); 
      }) || keys[5];

      var storeMap = {};
      var provinceMap = {};
      var sourceMap = {};
      var totalOrders = 0;
      var totalDpd30 = 0;
      var totalDpd90 = 0;

      rawData.forEach(function(row) {
        var storeName = (row[storeCol] || '未知店铺').toString();
        var orders = parseInt(row[orderCol]) || 0;
        var dpd30 = parseFloat(row[dpd30Col]) || 0;
        var dpd90 = parseFloat(row[dpd90Col]) || 0;
        var province = (row[provinceCol] || '未知').toString();
        var source = (row[channelCol] || '未知').toString();

        if (!storeMap[storeName]) {
          storeMap[storeName] = {
            store_name: storeName,
            total_orders: 0,
            normal_orders: 0,
            m1: 0,
            m2: 0,
            m3: 0,
            m3_plus: 0,
            dpd30_rate: 0,
            dpd90_rate: 0
          };
        }

        storeMap[storeName].total_orders += orders;
        storeMap[storeName].dpd30_rate = Math.max(storeMap[storeName].dpd30_rate, dpd30);
        storeMap[storeName].dpd90_rate = Math.max(storeMap[storeName].dpd90_rate, dpd90);

        if (!provinceMap[province]) {
          provinceMap[province] = {
            province_name: province,
            total_orders: 0,
            dpd30_rate: 0,
            dpd90_rate: 0
          };
        }

        provinceMap[province].total_orders += orders;
        provinceMap[province].dpd30_rate = Math.max(provinceMap[province].dpd30_rate, dpd30);
        provinceMap[province].dpd90_rate = Math.max(provinceMap[province].dpd90_rate, dpd90);

        var sourceKey = storeName + '|' + source;
        if (!sourceMap[sourceKey]) {
          sourceMap[sourceKey] = {
            store_name: storeName,
            source_name: source,
            total_orders: 0,
            dpd30_rate: 0,
            dpd90_rate: 0
          };
        }

        sourceMap[sourceKey].total_orders += orders;
        sourceMap[sourceKey].dpd30_rate = Math.max(sourceMap[sourceKey].dpd30_rate, dpd30);
        sourceMap[sourceKey].dpd90_rate = Math.max(sourceMap[sourceKey].dpd90_rate, dpd90);

        totalOrders += orders;
        totalDpd30 += dpd30;
        totalDpd90 += dpd90;
      });

      var stores = Object.keys(storeMap).map(function(k) { return storeMap[k]; });
      var provinces = Object.keys(provinceMap).map(function(k) { return provinceMap[k]; });
      var sources = Object.keys(sourceMap).map(function(k) { return sourceMap[k]; });
      
      var storeCount = stores.length;
      var avgDpd30 = storeCount > 0 ? (totalDpd30 / storeCount).toFixed(2) : 0;
      var avgDpd90 = storeCount > 0 ? (totalDpd90 / storeCount).toFixed(2) : 0;
      var overdueCount = Math.floor(totalOrders * avgDpd30 / 100);
      var overdueRate = avgDpd30;

      var currentDate = new Date();
      var monthly = [{
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        total_orders: totalOrders,
        dpd30_rate: avgDpd30,
        dpd90_rate: avgDpd90
      }];

      return {
        stores: stores,
        provinces: provinces,
        sources: sources,
        monthly: monthly,
        totalOrders: totalOrders,
        avgDpd30: avgDpd30,
        avgDpd90: avgDpd90,
        overdueCount: overdueCount,
        overdueRate: overdueRate
      };
    },

    downloadTemplate: function() {
      if (typeof XLSX === 'undefined') {
        AdminApp.notifications.error('Excel 库未加载');
        return;
      }

      var templateData = [
        {
          '店铺名称': '示例店铺A',
          '订单数': 1500,
          'DPD30+': 4.25,
          'DPD90+': 1.80,
          '省份': '广东省',
          '渠道': '线上'
        },
        {
          '店铺名称': '示例店铺B',
          '订单数': 2200,
          'DPD30+': 3.50,
          'DPD90+': 1.20,
          '省份': '浙江省',
          '渠道': '线下'
        }
      ];

      var ws = XLSX.utils.json_to_sheet(templateData);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '数据模板');
      XLSX.writeFile(wb, '数据模板.xlsx');

      AdminApp.notifications.success('模板下载成功');
    }
  };

})(AdminApp);
