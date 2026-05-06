var AuditDataSync = {
  config: {
    supabaseUrl: typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : 'https://mufudfalsojocgibetpm.supabase.co',
    anonKey: typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : 'sb_publishable_cnxW0pvZomoCtrxKRF49Uw_yuQT8B_A',
    tables: {
      raw_data: 'audit_raw_data',
      monthly_summary: 'audit_monthly_summary',
      weekly_summary: 'audit_weekly_summary'
    }
  },

  init: function(supabaseUrl, anonKey) {
    if (supabaseUrl) this.config.supabaseUrl = supabaseUrl;
    if (anonKey) this.config.anonKey = anonKey;
    
    console.log('[AuditDataSync] 初始化完成');
    console.log('[AuditDataSync] Supabase URL:', this.config.supabaseUrl);
    console.log('[AuditDataSync] API Key:', this.config.anonKey.substring(0, 10) + '...');
  },

  getHeaders: function() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.config.anonKey,
      'Authorization': 'Bearer ' + this.config.anonKey,
      'Prefer': 'return=representation'
    };
  },

  async fetchMonthlyData() {
    try {
      console.log('[AuditDataSync] 正在获取月度数据...');
      console.log('[AuditDataSync] URL:', this.config.supabaseUrl + '/rest/v1/' + this.config.tables.monthly_summary);
      
      var response = await fetch(
        this.config.supabaseUrl + '/rest/v1/' + this.config.tables.monthly_summary + 
        '?select=*&order=year.asc,month.asc',
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        var errorText = await response.text().catch(function() { return ''; });
        console.error('[AuditDataSync] HTTP错误:', response.status, response.statusText);
        console.error('[AuditDataSync] 错误详情:', errorText);
        
        if (response.status === 404) {
          throw new Error('月度数据表不存在（audit_monthly_summary）。请先在Supabase中创建表结构，或执行 supabase-init.sql');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('认证失败（' + response.status + '）。请检查API Key是否正确');
        } else {
          throw new Error('获取月度数据失败: HTTP ' + response.status + ' - ' + (errorText || response.statusText));
        }
      }
      
      var data = await response.json();
      console.log('[AuditDataSync] 成功获取', data.length, '个月份的数据');
      return data;
    } catch (error) {
      console.error('[AuditDataSync] 获取月度数据错误:', error.message);
      
      if (error.message.indexOf('Failed to fetch') !== -1 || 
          error.message.indexOf('NetworkError') !== -1 ||
          error.message.indexOf('network') !== -1) {
        throw new Error('网络连接失败：无法访问Supabase服务器。请检查：1) 网络连接 2) Supabase服务状态 3) 防火墙设置');
      }
      
      throw error;
    }
  },

  async fetchWeeklyData() {
    try {
      console.log('[AuditDataSync] 正在获取周度数据...');
      
      var response = await fetch(
        this.config.supabaseUrl + '/rest/v1/' + this.config.tables.weekly_summary + 
        '?select=*&order=year.asc,week_number.asc',
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        var errorText2 = await response.text().catch(function() { return ''; });
        
        if (response.status === 404) {
          throw new Error('周度数据表不存在（audit_weekly_summary）。请先在Supabase中创建表结构');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('认证失败（' + response.status + '）');
        } else {
          throw new Error('获取周度数据失败: HTTP ' + response.status);
        }
      }
      
      var data2 = await response.json();
      console.log('[AuditDataSync] 成功获取', data2.length, '周的数据');
      return data2;
    } catch (error) {
      console.error('[AuditDataSync] 获取周度数据错误:', error.message);
      throw error;
    }
  },

  async uploadRawData(records) {
    try {
      if (!records || records.length === 0) {
        throw new Error('没有可上传的数据');
      }

      console.log('[AuditDataSync] 开始上传原始记录，共', records.length, '条');
      console.log('[AuditDataSync] 目标表:', this.config.tables.raw_data);
      
      var chunks = [];
      for (var i = 0; i < records.length; i += 1000) {
        chunks.push(records.slice(i, i + 1000));
      }

      var totalUploaded = 0;

      for (var j = 0; j < chunks.length; j++) {
        var chunk = chunks[j];
        
        console.log('[AuditDataSync] 上传第', (j + 1), '/', chunks.length, '批（', chunk.length, '条）...');
        
        var response = await fetch(
          this.config.supabaseUrl + '/rest/v1/' + this.config.tables.raw_data,
          {
            method: 'POST',
            headers: Object.assign({}, this.getHeaders(), { 
              'Prefer': 'resolution=merge-duplicates' 
            }),
            body: JSON.stringify(chunk)
          }
        );

        if (!response.ok) {
          var errorText = await response.text().catch(function() { return ''; });
          console.error('[AuditDataSync] 上传失败，HTTP状态:', response.status);
          console.error('[AuditDataSync] 错误详情:', errorText);
          
          if (response.status === 404) {
            throw new Error('原始数据表不存在（audit_raw_data）。请先在Supabase中执行 supabase-init.sql 创建表结构');
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('认证失败。请检查API Key是否正确');
          } else if (response.status === 422) {
            throw new Error('数据格式错误：' + errorText.substring(0, 200));
          } else {
            throw new Error('上传原始数据失败 (' + (j + 1) + '/' + chunks.length + '): HTTP ' + response.status + ' - ' + errorText.substring(0, 200));
          }
        }

        totalUploaded += chunk.length;
        console.log('[AuditDataSync] ✅ 已上传', totalUploaded, '/', records.length, '条记录');
      }

      return { success: true, uploaded: totalUploaded, message: '成功上传 ' + totalUploaded + ' 条记录' };
    } catch (error) {
      console.error('[AuditDataSync] 上传原始数据错误:', error.message);
      
      if (error.message.indexOf('Failed to fetch') !== -1 || 
          error.message.indexOf('NetworkError') !== -1) {
        return { success: false, error: '网络连接失败，无法访问Supabase服务器' };
      }
      
      return { success: false, error: error.message };
    }
  },

  async upsertMonthlySummary(monthlyData) {
    try {
      if (!monthlyData || monthlyData.length === 0) {
        throw new Error('没有月度汇总数据');
      }

      console.log('[AuditDataSync] 开始上传月度汇总，共', monthlyData.length, '个月份');
      
      var results = [];

      for (var i = 0; i < monthlyData.length; i++) {
        var data = monthlyData[i];
        
        console.log('[AuditDataSync] 上传', data.year, '-', String(data.month).padStart(2, '0'), '...');
        
        var response = await fetch(
          this.config.supabaseUrl + '/rest/v1/' + this.config.tables.monthly_summary,
          {
            method: 'POST',
            headers: Object.assign({}, this.getHeaders(), { 
              'Prefer': 'resolution=merge-duplicates' 
            }),
            body: JSON.stringify(data)
          }
        );

        if (!response.ok) {
          var errorText = await response.text().catch(function() { return ''; });
          
          if (response.status === 404) {
            throw new Error('月度汇总表不存在（audit_monthly_summary）。请先执行 supabase-init.sql');
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('认证失败');
          } else {
            throw new Error('更新月度汇总失败 (' + data.year + '-' + data.month + '): HTTP ' + response.status + ' - ' + errorText.substring(0, 200));
          }
        }

        results.push({ year: data.year, month: data.month, status: 'success' });
      }

      console.log('[AuditDataSync] ✅ 月度汇总上传完成，共', results.length, '个月份');
      return { success: true, updated: results.length, message: '成功更新 ' + results.length + ' 个月份的数据' };
    } catch (error) {
      console.error('[AuditDataSync] 更新月度汇总错误:', error.message);
      return { success: false, error: error.message };
    }
  },

  async upsertWeeklySummary(weeklyData) {
    try {
      if (!weeklyData || weeklyData.length === 0) {
        throw new Error('没有周度汇总数据');
      }

      var results = [];

      for (var j = 0; j < weeklyData.length; j++) {
        var week = weeklyData[j];
        
        var response = await fetch(
          this.config.supabaseUrl + '/rest/v1/' + this.config.tables.weekly_summary,
          {
            method: 'POST',
            headers: Object.assign({}, this.getHeaders(), { 
              'Prefer': 'resolution=merge-duplicates' 
            }),
            body: JSON.stringify(week)
          }
        );

        if (!response.ok) {
          var errorText = await response.text();
          throw new Error('更新周度汇总失败 (' + year + '-W' + week.week_number + '): ' + errorText);
        }

        results.push({ year: week.year, week_number: week.week_number, status: 'success' });
      }

      return { success: true, updated: results.length, message: '成功更新 ' + results.length + ' 周的数据' };
    } catch (error) {
      console.error('[AuditDataSync] 更新周度汇总错误:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteRawDataByMonth(yearMonth) {
    try {
      var response = await fetch(
        this.config.supabaseUrl + '/rest/v1/' + this.config.tables.raw_data + 
        '?year_month=eq.' + yearMonth,
        {
          method: 'DELETE',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('删除数据失败: ' + response.status);
      }

      return { success: true, deletedYearMonth: yearMonth, message: '已删除 ' + yearMonth + ' 的数据' };
    } catch (error) {
      console.error('[AuditDataSync] 删除数据错误:', error);
      return { success: false, error: error.message };
    }
  },

  async getDataStats() {
    try {
      var [rawCount, monthlyCount, weeklyCount] = await Promise.all([
        fetch(this.config.supabaseUrl + '/rest/v1/' + this.config.tables.raw_data + '?select=id', { headers: this.getHeaders() }).then(r => r.headers.get('content-range') ? parseInt(r.headers.get('content-range').split('/')[1]) : 0),
        fetch(this.config.supabaseUrl + '/rest/v1/' + this.config.tables.monthly_summary + '?select=year', { headers: this.getHeaders() }).then(r => r.headers.get('content-range') ? parseInt(r.headers.get('content-range').split('/')[1]) : 0),
        fetch(this.config.supabaseUrl + '/rest/v1/' + this.config.tables.weekly_summary + '?select=year', { headers: this.getHeaders() }).then(r => r.headers.get('content-range') ? parseInt(r.headers.get('content-range').split('/')[1]) : 0)
      ]);

      return {
        success: true,
        stats: {
          raw_records: rawCount || 0,
          monthly_summaries: monthlyCount || 0,
          weekly_summaries: weeklyCount || 0
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[AuditDataSync] 获取统计信息错误:', error);
      return { success: false, error: error.message };
    }
  },

  processExcelFile: function(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          var data = new Uint8Array(e.target.result);
          var workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            reject(new Error('Excel文件中没有工作表'));
            return;
          }
          
          var firstSheetName = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[firstSheetName];
          var jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            reject(new Error('Excel文件为空'));
            return;
          }

          resolve({
            success: true,
            data: jsonData,
            count: jsonData.length,
            sheetName: firstSheetName
          });
        } catch (error) {
          reject(new Error('解析Excel文件失败: ' + error.message));
        }
      };

      reader.onerror = function() {
        reject(new Error('读取文件失败'));
      };

      reader.readAsArrayBuffer(file);
    });
  },

  transformToRecords: function(jsonData) {
    var records = [];
    var monthlyMap = {};
    var weeklyMap = {};

    function excelDateToJSDate(excelDate) {
      if (typeof excelDate === 'number') {
        return new Date((excelDate - 25569) * 86400 * 1000);
      }
      return new Date(excelDate);
    }

    function getISOWeek(d) {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    function getWeekStartDate(date) {
      var d = new Date(date);
      var day = d.getDay();
      var diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return d.toISOString().split('T')[0];
    }

    function getWeekEndDate(date) {
      var start = new Date(getWeekStartDate(date));
      start.setDate(start.getDate() + 6);
      return start.toISOString().split('T')[0];
    }

    jsonData.forEach(function(row, index) {
      var date = excelDateToJSDate(row['时间']);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var weekNum = getISOWeek(date);
      var yearMonth = year + '-' + String(month).padStart(2, '0');
      var yearWeek = year + '-W' + String(weekNum).padStart(2, '0');

      var store = row['店铺'];
      var isPass = row['是否通过'] === '是';
      var devices = parseInt(row['台数']) || 1;
      var reason = row['拒绝原因'] || '';
      var auditor = row['审核人员'] ? row['审核人员'].trim() : '';
      var orderId = String(row['订单号'] || '');

      var record = {
        id: index + 1,
        audit_date: date.toISOString().split('T')[0],
        store_name: store,
        order_id: orderId,
        is_passed: isPass,
        device_count: devices,
        rejection_reason: reason,
        auditor_name: auditor,
        month_label: month + '月',
        year_month: yearMonth,
        week_number: weekNum,
        year_week: yearWeek,
        created_at: new Date().toISOString()
      };

      records.push(record);

      if (!monthlyMap[yearMonth]) {
        monthlyMap[yearMonth] = {
          year: year,
          month: month,
          month_label: month + '月',
          total_orders: 0,
          passed_orders: 0,
          rejected_orders: 0,
          total_devices: 0,
          stores: {},
          auditors: {},
          rejection_reasons: {}
        };
      }

      var ms = monthlyMap[yearMonth];
      ms.total_orders++;
      ms.total_devices += devices;
      if (isPass) ms.passed_orders++; else ms.rejected_orders++;
      
      if (store) ms.stores[store] = (ms.stores[store] || 0) + 1;
      if (auditor) ms.auditors[auditor] = (ms.auditors[auditor] || 0) + 1;
      if (!isPass && reason) ms.rejection_reasons[reason] = (ms.rejection_reasons[reason] || 0) + 1;

      if (!weeklyMap[yearWeek]) {
        weeklyMap[yearWeek] = {
          year: year,
          week_number: weekNum,
          week_start_date: getWeekStartDate(date),
          week_end_date: getWeekEndDate(date),
          total_orders: 0,
          passed_orders: 0,
          rejected_orders: 0,
          total_devices: 0,
          stores: {}
        };
      }

      var ws = weeklyMap[yearWeek];
      ws.total_orders++;
      ws.total_devices += devices;
      if (isPass) ws.passed_orders++; else ws.rejected_orders++;
      if (store) ws.stores[store] = (ws.stores[store] || 0) + 1;
    });

    var monthlyData = Object.keys(monthlyMap).sort().map(function(key) {
      var m = monthlyMap[key];
      m.pass_rate = parseFloat((m.total_orders > 0 ? ((m.passed_orders / m.total_orders) * 100).toFixed(2) : 0));
      m.reject_rate = parseFloat((m.total_orders > 0 ? ((m.rejected_orders / m.total_orders) * 100).toFixed(2) : 0));
      m.avg_devices = parseFloat((m.total_orders > 0 ? (m.total_devices / m.total_orders).toFixed(1) : 0));

      ['箭头', '驴上', '雷猴', '懂机帝'].forEach(function(store, idx) {
        var prefixes = ['jt', 'ls', 'lh', 'djd'];
        var prefix = prefixes[idx];
        m[prefix + '_orders'] = m.stores[store] || 0;
        m[prefix + '_pass_rate'] = parseFloat(m.stores[store] && m.total_orders > 0 
          ? ((m.stores[store] / m.total_orders) * 100).toFixed(2) : 0);
      });

      m.top_rejection_reasons = Object.entries(m.rejection_reasons)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 10)
        .map(function(item) { 
          return { reason: item[0], count: item[1], percentage: parseFloat(((item[1] / m.rejected_orders) * 100).toFixed(1)) }; 
        });

      m.auditor_stats = Object.entries(m.auditors)
        .map(function(item) { 
          return { name: item[0], total: item[1], passed: Math.round(item[1] * (m.pass_rate / 100)) }; 
        })
        .sort(function(a, b) { return b.total - a.total; });

      delete m.stores;
      delete m.rejection_reasons;
      delete m.auditors;

      m.created_at = new Date().toISOString();
      m.updated_at = new Date().toISOString();

      return m;
    });

    var weeklyData = Object.keys(weeklyMap).sort().map(function(key) {
      var w = weeklyMap[key];
      w.pass_rate = parseFloat((w.total_orders > 0 ? ((w.passed_orders / w.total_orders) * 100).toFixed(1) : 0));
      w.reject_rate = parseFloat((w.total_orders > 0 ? ((w.rejected_orders / w.total_orders) * 100).toFixed(1) : 0));

      ['箭头', '驴上', '雷猴'].forEach(function(store, idx2) {
        var prefixes2 = ['jt', 'ls', 'lh'];
        w[prefixes2[idx2] + '_orders'] = w.stores[store] || 0;
        w[prefixes2[idx2] + '_pass_rate'] = parseFloat(w.stores[store] && w.total_orders > 0 
          ? ((w.stores[store] / w.total_orders) * 100).toFixed(1) : 0);
      });

      delete w.stores;
      w.created_at = new Date().toISOString();
      w.updated_at = new Date().toISOString();

      return w;
    });

    return {
      raw_records: records,
      monthly_summary: monthlyData,
      weekly_summary: weeklyData
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuditDataSync;
}