var SUPABASE_URL = 'https://mufudfalsojocgibetpm.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_cnxW0pvZomoCtrxKRF49Uw_yuQT8B_A';

function createClient() {
  return {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
}

function supabaseRequest(method, table, options) {
  var client = createClient();
  var url = client.url + '/rest/v1/' + table;
  
  if (options && options.select) {
    url += '?select=' + encodeURIComponent(options.select);
  }
  if (options && options.filter) {
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    Object.keys(options.filter).forEach(function(key) {
      url += sep + key + '=eq.' + encodeURIComponent(options.filter[key]);
      sep = '&';
    });
  }
  if (options && options.order) {
    url += '&order=' + encodeURIComponent(options.order);
  }
  if (options && options.limit) {
    url += '&limit=' + options.limit;
  }
  if (options && options.single) {
    url += '&limit=1&single=true';
  }
  
  var fetchOptions = {
    method: method,
    headers: client.headers
  };
  if (method !== 'GET' && options && options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  return fetch(url, fetchOptions).then(function(res) {
    if (!res.ok) {
      var errorDetails = '';

      switch (res.status) {
        case 400:
          errorDetails = '请求参数错误 (Bad Request)';
          break;
        case 401:
          errorDetails = '未授权访问，API密钥无效或已过期 (Unauthorized)';
          break;
        case 403:
          errorDetails = '禁止访问，权限不足 (Forbidden)';
          break;
        case 404:
          errorDetails = '资源不存在，数据表可能未创建 (Not Found)';
          break;
        case 409:
          errorDetails = '数据冲突，记录已存在 (Conflict)';
          break;
        case 422:
          errorDetails = '数据验证失败，请检查字段格式 (Unprocessable Entity)';
          break;
        case 429:
          errorDetails = '请求过于频繁，请稍后重试 (Too Many Requests)';
          break;
        case 500:
          errorDetails = '服务器内部错误 (Internal Server Error)';
          break;
        case 502:
          errorDetails = '网关错误，服务暂时不可用 (Bad Gateway)';
          break;
        case 503:
          errorDetails = '服务不可用，可能正在维护 (Service Unavailable)';
          break;
        default:
          errorDetails = res.statusText || '未知错误';
      }

      console.error('[Supabase] API错误:', {
        status: res.status,
        statusText: res.statusText,
        url: url,
        method: method
      });

      throw new Error('[' + res.status + '] ' + errorDetails);
    }
    if (res.status === 204) { return null; }
    return res.json();
  }).catch(function(err) {
    if (err.message && err.message.indexOf('[') === -1) {
      console.error('[Supabase] 网络异常:', {
        message: err.message,
        url: url,
        method: method,
        timestamp: new Date().toISOString()
      });

      if (err.message.indexOf('Failed to fetch') !== -1 ||
          err.message.indexOf('NetworkError') !== -1 ||
          err.message.indexOf('network') !== -1) {
        throw new Error('网络连接失败，无法访问Supabase服务器。请检查：1. 网络连接是否正常 2. 防火墙设置 3. DNS解析');
      } else if (err.message.indexOf('abort') !== -1) {
        throw new Error('请求被取消，可能是页面刷新或超时');
      }
    }

    throw err;
  });
}

var DbApi = {
  getReports: function() {
    return supabaseRequest('GET', 'reports', {
      select: '*',
      order: 'created_at.desc'
    });
  },
  getReport: function(id) {
    return supabaseRequest('GET', 'reports', {
      select: '*',
      filter: { id: id },
      single: true
    });
  },
  getLatestReport: function() {
    return supabaseRequest('GET', 'reports', {
      select: '*',
      order: 'created_at.desc',
      limit: 1
    }).then(function(data) { return data && data[0] ? data[0] : null; });
  },

  getStores: function(reportId) {
    return supabaseRequest('GET', 'stores', {
      select: '*',
      filter: reportId ? { report_id: reportId } : undefined,
      order: 'name'
    });
  },

  getMonthlyData: function(reportId) {
    return supabaseRequest('GET', 'monthly_data', {
      select: '*',
      filter: reportId ? { report_id: reportId } : undefined,
      order: 'year.asc,month.asc'
    });
  },

  getSourceData: function(reportId, storeName) {
    var filter = {};
    if (reportId) filter.report_id = reportId;
    if (storeName) filter.store_name = storeName;
    return supabaseRequest('GET', 'source_data', {
      select: '*',
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });
  },

  getProvinceData: function(reportId) {
    return supabaseRequest('GET', 'province_data', {
      select: '*',
      filter: reportId ? { report_id: reportId } : undefined,
      order: 'dpd30_rate.desc'
    });
  },

  insertReport: function(data) {
    return supabaseRequest('POST', 'reports', { body: data });
  },

  updateReport: function(id, data) {
    return supabaseRequest('PATCH', 'reports/' + id, { body: data });
  },

  deleteReport: function(id) {
    return supabaseRequest('DELETE', 'reports/' + id);
  },

  bulkInsertStores: function(items) {
    return supabaseRequest('POST', 'stores', { body: items });
  },

  bulkInsertMonthly: function(items) {
    return supabaseRequest('POST', 'monthly_data', { body: items });
  },

  bulkInsertSources: function(items) {
    return supabaseRequest('POST', 'source_data', { body: items });
  },

  bulkInsertProvinces: function(items) {
    return supabaseRequest('POST', 'province_data', { body: items });
  },

  upsertReportFull: function(reportData) {
    var self = this;
    return self.insertReport({
      title: reportData.title || '',
      period: reportData.period || '',
      total_orders: reportData.totalOrders || 0,
      dpd30_rate: reportData.dpd30Rate || 0,
      dpd90_rate: reportData.dpd90Rate || 0,
      overdue_count: reportData.overdueCount || 0,
      overdue_rate: reportData.overdueRate || 0,
      store_count: reportData.storeCount || 0,
      status: 'published'
    }).then(function(reports) {
      if (!reports || !reports[0]) throw new Error('Failed to create report');
      var reportId = reports[0].id;
      var promises = [];
      
      if (reportData.stores && reportData.stores.length > 0) {
        reportData.stores.forEach(function(s) { s.report_id = reportId; });
        promises.push(self.bulkInsertStores(reportData.stores));
      }
      
      if (reportData.monthly && reportData.monthly.length > 0) {
        reportData.monthly.forEach(function(m) { m.report_id = reportId; });
        promises.push(self.bulkInsertMonthly(reportData.monthly));
      }
      
      if (reportData.sources) {
        Object.keys(reportData.sources).forEach(function(storeKey) {
          reportData.sources[storeKey].forEach(function(src) {
            src.report_id = reportId;
          });
          promises.push(self.bulkInsertSources(reportData.sources[storeKey]));
        });
      }
      
      if (reportData.provinces && reportData.provinces.length > 0) {
        reportData.provinces.forEach(function(p) { p.report_id = reportId; });
        promises.push(self.bulkInsertProvinces(reportData.provinces));
      }
      
      return Promise.all(promises).then(function() { return reports[0]; });
    });
  }
};
