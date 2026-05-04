var AppData = {
  stores: [
    { name: '箭头', orders: 3688, dpd30: 3.17, dpd90: 1.44, m1: 73, m2: 33, m3: 31, m3plus: 53, normal: 3446, normalReturn: 52 },
    { name: '驴上', orders: 2787, dpd30: 5.85, dpd90: 2.37, m1: 112, m2: 55, m3: 42, m3plus: 66, normal: 2493, normalReturn: 19 },
    { name: '雷猴', orders: 1419, dpd30: 4.86, dpd90: 1.90, m1: 52, m2: 25, m3: 17, m3plus: 27, normal: 1294, normalReturn: 4 }
  ],
  total: { orders: 7894, dpd30: 4.42, dpd90: 1.85, overdue: 586, overdueRate: 7.42 },
  monthly: [
    { year: 2025, month: 1, total: 114, dpd30: 0.88, dpd90: 0.88 },
    { year: 2025, month: 2, total: 117, dpd30: 0.85, dpd90: 0.00 },
    { year: 2025, month: 3, total: 321, dpd30: 1.56, dpd90: 0.31 },
    { year: 2025, month: 4, total: 643, dpd30: 2.18, dpd90: 0.47 },
    { year: 2025, month: 5, total: 759, dpd30: 2.77, dpd90: 0.79 },
    { year: 2025, month: 6, total: 843, dpd30: 3.80, dpd90: 1.42 },
    { year: 2025, month: 7, total: 937, dpd30: 4.16, dpd90: 1.60 },
    { year: 2025, month: 8, total: 916, dpd30: 5.02, dpd90: 2.18 },
    { year: 2025, month: 9, total: 870, dpd30: 5.52, dpd90: 2.30 },
    { year: 2025, month: 10, total: 858, dpd30: 5.83, dpd90: 2.56 },
    { year: 2025, month: 11, total: 856, dpd30: 6.84, dpd90: 3.04 },
    { year: 2025, month: 12, total: 830, dpd30: 5.42, dpd90: 2.53 },
    { year: 2026, month: 1, total: 448, dpd30: 1.79, dpd90: 1.12 },
    { year: 2026, month: 2, total: 482, dpd30: 0.21, dpd90: 0.00 }
  ],
  sources: {
    total: [
      { name: '企业小程序(含渠道商)', total: 5450, dpd30: 4.49, dpd90: 1.47 },
      { name: '人人租-生活号', total: 2444, dpd30: 4.32, dpd90: 2.82 }
    ],
    jiantou: [
      { name: '企业小程序(含渠道商)', total: 1823, dpd30: 3.89, dpd90: 0.99 },
      { name: '人人租-生活号', total: 1862, dpd30: 2.47, dpd90: 1.88 }
    ],
    lvshang: [
      { name: '企业小程序(含渠道商)', total: 1927, dpd30: 4.67, dpd90: 1.30 },
      { name: '人人租-生活号', total: 859, dpd30: 8.50, dpd90: 4.77 }
    ],
    leihou: [
      { name: '企业小程序(含渠道商)', total: 1700, dpd30: 5.16, dpd90: 1.94 },
      { name: '人人租-生活号', total: 723, dpd30: 3.92, dpd90: 1.66 }
    ]
  },
  provinces: [
    { name: '天津市', total: 63, dpd30: 11.11, dpd90: 0.00 },
    { name: '江苏省', total: 323, dpd30: 10.22, dpd90: 0.93 },
    { name: '贵州省', total: 326, dpd30: 9.20, dpd90: 3.68 },
    { name: '重庆市', total: 260, dpd30: 8.08, dpd90: 2.69 },
    { name: '山东省', total: 405, dpd30: 7.90, dpd90: 2.72 },
    { name: '青海省', total: 13, dpd30: 7.69, dpd90: 0.00 },
    { name: '浙江省', total: 387, dpd30: 6.46, dpd90: 3.36 },
    { name: '四川省', total: 362, dpd30: 5.80, dpd90: 3.31 },
    { name: '辽宁省', total: 138, dpd30: 5.80, dpd90: 2.90 },
    { name: '陕西省', total: 131, dpd30: 5.34, dpd90: 0.76 },
    { name: '江西省', total: 194, dpd30: 5.15, dpd90: 3.09 },
    { name: '湖南省', total: 241, dpd30: 4.98, dpd90: 4.15 },
    { name: '内蒙古', total: 90, dpd30: 4.44, dpd90: 4.44 },
    { name: '云南省', total: 192, dpd30: 4.17, dpd90: 1.56 },
    { name: '福建省', total: 256, dpd30: 3.91, dpd90: 1.95 }
  ],
  reportDate: '2026-04-28',
  period: '2025年1月 ~ 2026年2月'
};

var NAV_ITEMS = [
  { icon: '📊', label: '数据总览', href: 'index.html', id: 'index' },
  { icon: '📤', label: '数据上传', href: 'upload.html', id: 'upload' },
  { icon: '📈', label: '对比分析', href: 'compare.html', id: 'compare' },
  { icon: '📉', label: '趋势追踪', href: 'trend.html', id: 'trend' },
  { icon: '🎯', label: '策略评估', href: 'strategy.html', id: 'strategy' },
  { icon: '🗺️', label: '地域风险', href: 'region.html', id: 'region' },
  { icon: '⚠️', label: '风控建议', href: 'risk.html', id: 'risk' },
  { icon: '📄', label: '报告生成', href: 'report.html', id: 'report' },
  { icon: '📁', label: '历史报告', href: 'reports.html', id: 'reports' },
  { type: 'divider' },
  { icon: '🔧', label: '管理后台', href: 'admin.html', id: 'admin', admin: true }
];

function getCurrentPageId() {
  var path = window.location.pathname;
  var filename = path.substring(path.lastIndexOf('/') + 1);
  return filename.replace('.html', '') || 'index';
}

function renderSidebar() {
  var currentId = getCurrentPageId();
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  var menuHtml = '';
  for (var i = 0; i < NAV_ITEMS.length; i++) {
    var item = NAV_ITEMS[i];
    if (item.type === 'divider') {
      menuHtml += '<li class="sidebar-divider"></li>';
      continue;
    }
    var activeClass = item.id === currentId ? ' active' : '';
    var adminClass = item.admin ? ' admin-item' : '';
    menuHtml += '<li><a href="' + item.href + '"' + activeClass + ' class="' + adminClass + '"><span>' + item.icon + '</span><span>' + item.label + '</span></a></li>';
  }

  sidebar.innerHTML =
    '<div class="sidebar-header">' +
      '<div class="logo"><span>🛡️</span><span>风控数据平台</span></div>' +
    '</div>' +
    '<ul class="sidebar-menu">' + menuHtml + '</ul>';
}

function initSearch() {
  var searchInputs = document.querySelectorAll('.search-box input');
  searchInputs.forEach(function(input) {
    input.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      var content = document.querySelector('.content');
      if (!content) return;

      var tables = content.querySelectorAll('.data-table');
      tables.forEach(function(table) {
        var rows = table.querySelectorAll('tbody tr');
        var visibleCount = 0;
        rows.forEach(function(row) {
          var text = row.textContent.toLowerCase();
          var match = query === '' || text.indexOf(query) !== -1;
          row.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });
        var emptyMsg = table.parentNode.querySelector('.search-empty-msg');
        if (visibleCount === 0 && query !== '') {
          if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'search-empty-msg empty-state';
            emptyMsg.innerHTML = '<div class="icon">🔍</div><div class="title">未找到匹配结果</div><div class="desc">尝试使用其他关键词搜索</div>';
            table.parentNode.appendChild(emptyMsg);
          }
          emptyMsg.style.display = '';
          table.style.display = 'none';
        } else {
          if (emptyMsg) emptyMsg.style.display = 'none';
          table.style.display = '';
        }
      });

      var cards = content.querySelectorAll('.card, .chart-card, .data-card, .risk-item');
      if (tables.length === 0 && cards.length > 0) {
        cards.forEach(function(card) {
          var text = card.textContent.toLowerCase();
          card.style.display = query === '' || text.indexOf(query) !== -1 ? '' : 'none';
        });
      }
    });
  });
}

function initFilterBar() {
  var storeFilter = document.getElementById('storeFilter');
  if (storeFilter) {
    storeFilter.addEventListener('change', function() {
      var val = this.value;
      var rows = document.querySelectorAll('.data-table tbody tr[data-store]');
      rows.forEach(function(row) {
        row.style.display = val === 'all' || row.dataset.store === val ? '' : 'none';
      });
    });
  }

  var riskFilter = document.getElementById('riskFilter');
  if (riskFilter) {
    riskFilter.addEventListener('change', function() {
      var val = this.value;
      var items = document.querySelectorAll('[data-risk-level]');
      items.forEach(function(item) {
        item.style.display = val === 'all' || item.dataset.riskLevel === val ? '' : 'none';
      });
    });
  }

  var dateFilter = document.getElementById('dateFilter');
  if (dateFilter) {
    dateFilter.addEventListener('change', function() {
      var val = this.value;
      var rows = document.querySelectorAll('.data-table tbody tr[data-month]');
      rows.forEach(function(row) {
        row.style.display = val === 'all' || row.dataset.month === val ? '' : 'none';
      });
    });
  }
}

function initTableSort() {
  var tables = document.querySelectorAll('.data-table');
  tables.forEach(function(table) {
    var headers = table.querySelectorAll('th[data-sort]');
    headers.forEach(function(th) {
      th.style.cursor = 'pointer';
      th.title = '点击排序';
      var asc = true;
      th.addEventListener('click', function() {
        asc = !asc;
        var colIdx = Array.prototype.indexOf.call(th.parentNode.children, th);
        var tbody = table.querySelector('tbody');
        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        rows.sort(function(a, b) {
          var aVal = a.children[colIdx] ? a.children[colIdx].textContent.trim() : '';
          var bVal = b.children[colIdx] ? b.children[colIdx].textContent.trim() : '';
          var aNum = parseFloat(aVal.replace(/[%,]/g, ''));
          var bNum = parseFloat(bVal.replace(/[%,]/g, ''));
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return asc ? aNum - bNum : bNum - aNum;
          }
          return asc ? aVal.localeCompare(bVal, 'zh') : bVal.localeCompare(aVal, 'zh');
        });
        rows.forEach(function(row) { tbody.appendChild(row); });
        headers.forEach(function(h) { h.classList.remove('sort-asc', 'sort-desc'); });
        th.classList.add(asc ? 'sort-asc' : 'sort-desc');
      });
    });
  });
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getRiskLevel(dpd30) {
  if (dpd30 >= 8) return { level: 'danger', label: '高风险', color: '#dc2626' };
  if (dpd30 >= 5) return { level: 'warning', label: '中风险', color: '#d97706' };
  if (dpd30 >= 3) return { level: 'info', label: '低风险', color: '#2563eb' };
  return { level: 'success', label: '安全', color: '#16a34a' };
}

function initTabs() {
  var tabBtns = document.querySelectorAll('.chart-tab');
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var group = this.closest('.chart-tabs');
      group.querySelectorAll('.chart-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      var target = this.dataset.tab;
      var container = this.closest('.card') || this.closest('.chart-card');
      if (container) {
        container.querySelectorAll('.tab-content').forEach(function(tc) {
          tc.classList.toggle('active', tc.id === target);
        });
      }
    });
  });
}

function initApp() {
  renderSidebar();
  initSearch();
  initFilterBar();
  initTabs();
  initTableSort();
}

function loadFromSupabase(callback) {
  if (typeof DbApi === 'undefined') {
    callback(false);
    return;
  }
  var reportId = new URLSearchParams(window.location.search).get('report');
  var promise = reportId ? DbApi.getReport(reportId) : DbApi.getLatestReport();
  promise.then(function(report) {
    if (!report) { callback(false); return; }
    Promise.all([
      DbApi.getStores(report.id),
      DbApi.getMonthlyData(report.id),
      DbApi.getSourceData(report.id),
      DbApi.getProvinceData(report.id)
    ]).then(function(results) {
      var stores = (results[0] || []).map(function(s) { return { name: s.store_name, orders: s.total_orders, dpd30: parseFloat(s.dpd30_rate), dpd90: parseFloat(s.dpd90_rate), m1: s.m1, m2: s.m2, m3: s.m3, m3plus: s.m3_plus, normal: s.normal_orders, normalReturn: s.normal_return }; });
      var monthly = (results[1] || []).map(function(m) { return { year: m.year, month: m.month, total: m.total_orders, dpd30: parseFloat(m.dpd30_rate), dpd90: parseFloat(m.dpd90_rate); });
      var sourcesRaw = results[2] || [];
      var provinces = (results[3] || []).map(function(p) { return { name: p.province_name, total: p.total_orders, dpd30: parseFloat(p.dpd30_rate), dpd90: parseFloat(p.dpd90_rate); });

      AppData.stores = stores.length > 0 ? stores : AppData.stores;
      AppData.monthly = monthly.length > 0 ? monthly : AppData.monthly;
      AppData.provinces = provinces.length > 0 ? provinces : AppData.provinces;

      if (sourcesRaw.length > 0) {
        var srcMap = {};
        sourcesRaw.forEach(function(s) {
          var key = s.store_name === '全店铺' ? 'total' : s.store_name.toLowerCase();
          if (!srcMap[key]) srcMap[key] = [];
          srcMap[key].push({ name: s.source_name, total: s.total_orders, dpd30: parseFloat(s.dpd30_rate), dpd90: parseFloat(s.dpd90_rate) });
        });
        Object.keys(srcMap).forEach(function(k) { AppData.sources[k] = srcMap[k]; });
      }

      AppData.reportDate = report.created_at.substring(0, 10);
      AppData.period = report.period || AppData.period;
      AppData.total.orders = report.total_orders || AppData.total.orders;
      AppData.total.dpd30 = parseFloat(report.dpd30_rate) || AppData.total.dpd30;
      AppData.total.dpd90 = parseFloat(report.dpd90_rate) || AppData.total.dpd90;
      AppData.total.overdue = report.overdue_count || AppData.total.overdue;
      AppData.total.overdueRate = parseFloat(report.overdue_rate) || AppData.total.overdueRate;

      callback(true);
    }).catch(function() { callback(false); });
  }).catch(function() { callback(false); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
