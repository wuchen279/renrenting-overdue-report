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
      throw new Error('Supabase error: ' + res.status + ' ' + res.statusText);
    }
    if (res.status === 204) { return null; }
    return res.json();
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
