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
  { icon: '📋', label: '审核数据', href: 'audit.html', id: 'audit' },
  { icon: '🎯', label: '策略评估', href: 'strategy.html', id: 'strategy' },
  { icon: '🗺️', label: '地域风险', href: 'region.html', id: 'region' },
  { icon: '⚠️', label: '风控建议', href: 'risk.html', id: 'risk' },
  { icon: '📄', label: '报告生成', href: 'report.html', id: 'report' },
  { icon: '📁', label: '历史报告', href: 'reports.html', id: 'reports' },
  { type: 'divider' },
  { icon: '🎛️', label: '管理后台', href: 'admin-new.html', id: 'admin-new', admin: true }
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
    '<ul class="sidebar-menu">' + menuHtml + '</ul>' +
    '<div class="sidebar-user">' +
      '<div id="sidebarUserArea"></div>' +
    '</div>';

  updateSidebarUser();
}

function updateSidebarUser() {
  var area = document.getElementById('sidebarUserArea');
  if (!area) return;

  var user = SupabaseAuth.getUser();
  if (user) {
    area.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
        '<span style="width:28px;height:28px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;">' + (user.name ? user.name[0].toUpperCase() : '👤') + '</span>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (user.name || user.email.split('@')[0]) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + user.email + '</div>' +
        '</div>' +
      '</div>' +
      '<button onclick="handleLogout()" style="width:100%;padding:8px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;" onmouseover="this.background=\'#fee2e2\'" onmouseout="this.background=\'#fef2f2\'">🚪 退出登录</button>';
  } else {
    area.innerHTML =
      '<a href="login.html" style="display:block;width:100%;padding:10px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;transition:transform 0.2s;" onmouseover="this.style.transform=\'translateY(-1px)\'" onmouseout="this.style.transform=\'\'">🔐 登录系统</a>';
  }
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
  initAuth();
  initSearch();
  initFilterBar();
  initTabs();
  initTableSort();
}

function initAuth() {
  var user = SupabaseAuth.getUser();
  if (user) {
    updateUserInfo(user);
    updateSidebarUser();
  } else {
    updateSidebarUser();
  }

  SupabaseAuth.onAuthChange(function(event, data) {
    if (event === 'login' || event === 'session') {
      updateUserInfo(data.user);
      updateSidebarUser();
    } else if (event === 'logout') {
      clearUserInfo();
      updateSidebarUser();
    }
  });

  document.addEventListener('click', function(e) {
    if (e.target.closest('.logout-btn')) {
      e.preventDefault();
      handleLogout();
    }
  });
}

function updateUserInfo(user) {
  var userInfos = document.querySelectorAll('.user-info');
  userInfos.forEach(function(el) {
    var nameEl = el.querySelector('.name');
    if (nameEl) {
      nameEl.textContent = user.name || user.email.split('@')[0] || '用户';
    }
    el.title = user.email;
    el.style.cursor = 'pointer';

    if (!el.querySelector('.user-dropdown')) {
      var dropdown = document.createElement('div');
      dropdown.className = 'user-dropdown';
      dropdown.style.cssText = 'position:absolute;top:100%;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:200px;padding:8px;z-index:100;display:none;margin-top:4px;';
      dropdown.innerHTML =
        '<div style="padding:10px 14px;border-bottom:1px solid #f1f5f9;">' +
          '<div style="font-size:13px;font-weight:600;color:#16213e;">' + (user.name || user.email.split('@')[0]) + '</div>' +
          '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">' + user.email + '</div>' +
        '</div>' +
        '<a href="login.html" class="logout-btn" style="display:block;padding:10px 14px;font-size:13px;color:#dc2626;text-decoration:none;border-radius:8px;transition:background 0.2s;">🚪 退出登录</a>';

      el.style.position = 'relative';
      el.appendChild(dropdown);

      el.addEventListener('click', function(e) {
        e.stopPropagation();
        var dd = this.querySelector('.user-dropdown');
        if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
      });
    }
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-info')) {
      var dropdowns = document.querySelectorAll('.user-dropdown');
      dropdowns.forEach(function(d) { d.style.display = 'none'; });
    }
  });
}

function clearUserInfo() {
  var userInfos = document.querySelectorAll('.user-info');
  userInfos.forEach(function(el) {
    var nameEl = el.querySelector('.name');
    if (nameEl) nameEl.textContent = '未登录';
    var dropdown = el.querySelector('.user-dropdown');
    if (dropdown) dropdown.remove();
  });
}

async function handleLogout() {
  var result = await SupabaseAuth.signOut();

  if (result.success) {
    showToast('已退出登录', 'info');
    setTimeout(function() {
      window.location.href = 'login.html';
    }, 800);
  } else {
    showToast('退出失败，请重试', 'error');
  }
}

function loadFromSupabase(callback) {
  if (typeof DbApi === 'undefined') {
    callback(false);
    return;
  }
  var reportId = new URLSearchParams(window.location.search).get('report');
  if (!reportId && typeof localStorage !== 'undefined') {
    reportId = localStorage.getItem('currentReportId');
  }
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
      var monthly = (results[1] || []).map(function(m) { return { year: m.year, month: m.month, total: m.total_orders, dpd30: parseFloat(m.dpd30_rate), dpd90: parseFloat(m.dpd90_rate) }; });
      var sourcesRaw = results[2] || [];
      var provinces = (results[3] || []).map(function(p) { return { name: p.province_name, total: p.total_orders, dpd30: parseFloat(p.dpd30_rate), dpd90: parseFloat(p.dpd90_rate) }; });

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

var modalOverlay = null;
var modalContainer = null;

function showModal(title, content, options, isForm) {
  if (modalOverlay) {
    closeModal();
  }

  options = options || {};
  var width = options.width || '520px';
  var height = options.height || 'auto';
  var closable = options.closable !== false;

  modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'globalModal';

  modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  modalContainer.style.maxWidth = width;
  modalContainer.style.height = height;

  var headerHtml = '<div class="modal-header">' +
    '<h3 class="modal-title">' + title + '</h3>' +
    (closable ? '<button class="modal-close" onclick="closeModal()">✕</button>' : '') +
  '</div>';

  var bodyHtml = '<div class="modal-body">' + (content || '') + '</div>';

  modalContainer.innerHTML = headerHtml + bodyHtml;
  modalOverlay.appendChild(modalContainer);
  document.body.appendChild(modalOverlay);

  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay && closable) {
      closeModal();
    }
  });

  document.body.style.overflow = 'hidden';

  setTimeout(function() {
    modalOverlay.classList.add('active');
    modalContainer.classList.add('active');
  }, 10);

  return modalContainer;
}

function closeModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.remove('active');
  modalContainer.classList.remove('active');

  setTimeout(function() {
    if (modalOverlay && modalOverlay.parentNode) {
      modalOverlay.parentNode.removeChild(modalOverlay);
    }
    modalOverlay = null;
    modalContainer = null;
    document.body.style.overflow = '';
  }, 300);
}

function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3000;

  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  var iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = '<span class="toast-icon">' + (iconMap[type] || 'ℹ️') + '</span>' +
                   '<span class="toast-message">' + message + '</span>' +
                   '<button class="toast-close" onclick="this.parentElement.remove()">✕</button>';

  container.appendChild(toast);

  setTimeout(function() {
    toast.classList.add('fade-out');
    setTimeout(function() {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, duration);
}

function showLoading(message) {
  message = message || '加载中...';

  var overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';
  overlay.innerHTML =
    '<div class="loading-spinner">' +
      '<div class="spinner"></div>' +
      '<p class="loading-text">' + message + '</p>' +
    '</div>';

  document.body.appendChild(overlay);

  setTimeout(function() {
    overlay.classList.add('active');
  }, 10);

  return overlay;
}

function hideLoading() {
  var overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(function() {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
}

function confirmAction(message, onConfirm, onCancel) {
  showModal(
    '确认操作',
    '<div style="text-align:center;padding:20px 0;">' +
      '<div style="font-size:48px;margin-bottom:16px;">⚠️</div>' +
      '<p style="font-size:15px;color:var(--text);margin-bottom:24px;line-height:1.6;">' + message + '</p>' +
      '<div style="display:flex;gap:12px;justify-content:center;">' +
        '<button class="btn btn-outline" onclick="closeModal();' + (typeof onCancel === 'function' ? 'onCancel()' : '') + '" style="padding:10px 28px;">取消</button>' +
        '<button class="btn btn-danger" id="confirmBtn" style="padding:10px 28px;">确认</button>' +
      '</div>' +
    '</div>',
    { width: '420px' },
    false
  );

  setTimeout(function() {
    var btn = document.getElementById('confirmBtn');
    if (btn) {
      btn.addEventListener('click', function() {
        closeModal();
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
      });
    }
  }, 100);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && modalOverlay) {
    closeModal();
  }
});

var sessionWarningShown = false;
var sessionTimerElement = null;

function initSessionManager() {
  if (!SupabaseAuth || !SupabaseAuth.isAuthenticated()) return;

  createSessionStatusBar();
  setupSessionListeners();
  updateSessionDisplay();
}

function createSessionStatusBar() {
  var existingBar = document.getElementById('sessionStatusBar');
  if (existingBar) existingBar.remove();

  var statusBar = document.createElement('div');
  statusBar.id = 'sessionStatusBar';
  statusBar.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'right: 0',
    'height: ' + (window.innerWidth < 768 ? '32px' : '36px'),
    'background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    'color: #fff',
    'display: flex',
    'align-items: center',
    'justify-content: space-between',
    'padding: 0 20px',
    'font-size: ' + (window.innerWidth < 768 ? '11px' : '12px'),
    'z-index: 9998',
    'box-shadow: 0 2px 8px rgba(0,0,0,0.15)',
    'transition: all 0.3s ease'
  ].join(';');

  var leftSection = document.createElement('div');
  leftSection.style.cssText = 'display:flex;align-items:center;gap:12px;';

  var userIcon = document.createElement('span');
  userIcon.innerHTML = '👤';
  userIcon.style.fontSize = '14px';

  var userInfo = document.createElement('span');
  userInfo.id = 'sessionUserInfo';
  userInfo.style.fontWeight = '600';
  var user = SupabaseAuth.getUser();
  userInfo.textContent = user ? (user.name || user.email.split('@')[0]) : '用户';

  var sessionTime = document.createElement('span');
  sessionTime.id = 'sessionTimeDisplay';
  sessionTime.style.cssText = [
    'background: rgba(255,255,255,0.15)',
    'padding: 3px 10px',
    'border-radius: 12px',
    'font-family: monospace',
    'font-size: 11px'
  ].join(';');

  leftSection.appendChild(userIcon);
  leftSection.appendChild(userInfo);
  leftSection.appendChild(sessionTime);

  var rightSection = document.createElement('div');
  rightSection.style.cssText = 'display:flex;align-items:center;gap:10px;';

  var extendBtn = document.createElement('button');
  extendBtn.id = 'extendSessionBtn';
  extendBtn.textContent = '⏰ 延长会话';
  extendBtn.style.cssText = [
    'background: rgba(255,255,255,0.2)',
    'color: #fff',
    'border: 1px solid rgba(255,255,255,0.3)',
    'padding: 4px 12px',
    'border-radius: 6px',
    'cursor: pointer',
    'font-size: 11px',
    'font-weight: 600',
    'transition: all 0.2s'
  ].join(';');
  extendBtn.onmouseenter = function() { this.style.background = 'rgba(255,255,255,0.3)'; };
  extendBtn.onmouseleave = function() { this.style.background = 'rgba(255,255,255,0.2)'; };
  extendBtn.onclick = handleExtendSession;

  var logoutBtn = document.createElement('button');
  logoutBtn.id = 'logoutBtn';
  logoutBtn.textContent = '🚪 安全退出';
  logoutBtn.style.cssText = [
    'background: rgba(220,38,38,0.8)',
    'color: #fff',
    'border: none',
    'padding: 4px 12px',
    'border-radius: 6px',
    'cursor: pointer',
    'font-size: 11px',
    'font-weight: 600',
    'transition: all 0.2s'
  ].join(';');
  logoutBtn.onmouseenter = function() { this.style.background = '#dc2626'; };
  logoutBtn.onmouseleave = function() { this.style.background = 'rgba(220,38,38,0.8)'; };
  logoutBtn.onclick = handleSecureLogout;

  rightSection.appendChild(extendBtn);
  rightSection.appendChild(logoutBtn);

  statusBar.appendChild(leftSection);
  statusBar.appendChild(rightSection);

  document.body.insertBefore(statusBar, document.body.firstChild);

  var mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
  if (mainContent && mainContent !== document.body) {
    mainContent.style.paddingTop = (window.innerWidth < 768 ? '32px' : '36px');
  }

  sessionTimerElement = sessionTime;

  console.log('[UI] 会话状态栏已创建');
}

function updateSessionDisplay() {
  if (!sessionTimerElement) return;

  var remaining = SupabaseAuth.getSessionRemainingTime();
  var formatted = SupabaseAuth.formatSessionTime(remaining);

  sessionTimerElement.textContent = '⏱ 剩余: ' + formatted;

  if (remaining <= 15 * 60 * 1000 && remaining > 0) {
    sessionTimerElement.style.background = 'rgba(245,158,11,0.3)';
    sessionTimerElement.style.color = '#fef3c7';
  } else if (remaining <= 5 * 60 * 1000 && remaining > 0) {
    sessionTimerElement.style.background = 'rgba(220,38,38,0.3)';
    sessionTimerElement.style.color = '#fee2e2';
    sessionTimerElement.style.animation = 'pulse 1s infinite';
  } else {
    sessionTimerElement.style.background = 'rgba(255,255,255,0.15)';
    sessionTimerElement.style.color = '#fff';
    sessionTimerElement.style.animation = 'none';
  }
}

function setupSessionListeners() {
  SupabaseAuth.onAuthChange(function(event, data) {
    switch (event) {
      case 'session_tick':
        updateSessionDisplay();
        break;

      case 'session_warning':
        showSessionWarning(data);
        break;

      case 'logout':
        removeSessionStatusBar();
        break;
    }
  });
}

function showSessionWarning(data) {
  if (sessionWarningShown) return;
  sessionWarningShown = true;

  showModal(
    '⚠️ 会话即将过期',
    '<div style="text-align:center;padding:20px;">' +
      '<div style="font-size:64px;margin-bottom:16px;">⏰</div>' +
      '<h3 style="font-size:18px;color:var(--warning);margin-bottom:12px;">登录即将过期</h3>' +
      '<p style="font-size:14px;color:var(--text-light);margin-bottom:8px;line-height:1.6;">您的登录会话将在 <strong style="color:var(--warning);font-size:16px;">' + data.formatted + '</strong> 后过期</p>' +
      '<p style="font-size:13px;color:var(--text-muted);margin-bottom:24px;">过期后系统将自动退出，未保存的数据可能丢失</p>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" onclick="handleExtendSession();closeModal();sessionWarningShown=false;" style="padding:12px 28px;font-size:14px;">⏰ 延长4小时</button>' +
        '<button class="btn btn-outline" onclick="handleSecureLogout()" style="padding:12px 28px;font-size:14px;">🚪 立即退出</button>' +
      '</div>' +
    '</div>',
    { width: '440px' },
    false
  );
}

function handleExtendSession() {
  var result = SupabaseAuth.extendSession();

  if (result.success) {
    showToast('✅ 会话已延长4小时', 'success');
    sessionWarningShown = false;
    updateSessionDisplay();

    setTimeout(function() {
      showToast('💡 新的过期时间: ' + new Date(result.newExpiry).toLocaleString('zh-CN'), 'info');
    }, 1500);
  } else {
    showToast('❌ 延长失败: ' + result.error, 'error');
  }

  closeModal();
}

function handleSecureLogout() {
  confirmAction(
    '确定要安全退出系统吗？<br><span style="color:var(--text-muted);font-size:13px;">退出后需要重新登录才能继续使用</span>',
    function() {
      closeModal();

      showLoading('正在安全退出...');

      setTimeout(function() {
        SupabaseAuth.signOut().then(function() {
          hideLoading();
          showToast('👋 已安全退出', 'success');

          setTimeout(function() {
            window.location.href = '/login.html?reason=MANUAL_LOGOUT&t=' + Date.now();
          }, 500);
        }).catch(function(error) {
          hideLoading();
          console.error('[Logout] 退出异常:', error);
          window.location.href = '/login.html?reason=LOGOUT_ERROR&t=' + Date.now();
        });
      }, 800);
    },
    function() {
      closeModal();
    }
  );
}

function removeSessionStatusBar() {
  var bar = document.getElementById('sessionStatusBar');
  if (bar) {
    bar.remove();
    console.log('[UI] 会话状态栏已移除');
  }

  sessionTimerElement = null;
  sessionWarningShown = false;
}

function checkLogoutReason() {
  var reason = sessionStorage.getItem('logout_reason');
  var time = sessionStorage.getItem('logout_time');

  if (!reason) return;

  sessionStorage.removeItem('logout_reason');
  sessionStorage.removeItem('logout_time');

  setTimeout(function() {
    var reasonMessages = {
      'SESSION_EXPIRED': {
        title: '⏰ 登录已过期',
        message: '由于长时间未操作，您的登录会话已自动过期。为了账户安全，请重新登录。',
        icon: '⏰',
        type: 'warning'
      },
      'MANUAL_LOGOUT': {
        title: '👋 已成功退出',
        message: '您已安全退出系统。如需继续使用，请重新登录。',
        icon: '👋',
        type: 'success'
      },
      'LOGOUT_ERROR': {
        title: '⚠️ 退出异常',
        message: '退出过程出现异常，但您已被强制登出。请重新登录。',
        icon: '⚠️',
        type: 'warning'
      }
    };

    var config = reasonMessages[reason] || {
      title: '💡 提示',
      message: '请重新登录以继续使用系统。',
      icon: '💡',
      type: 'info'
    };

    showModal(
      config.title,
      '<div style="text-align:center;padding:20px;">' +
        '<div style="font-size:56px;margin-bottom:16px;">' + config.icon + '</div>' +
        '<p style="font-size:14px;color:var(--text-light);line-height:1.6;margin-bottom:20px;">' + config.message + '</p>' +
        (time ? '<p style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">退出时间: ' + new Date(time).toLocaleString('zh-CN') + '</p>' : '') +
        '<button class="btn btn-primary" onclick="closeModal()" style="padding:10px 28px;">我知道了，去登录</button>' +
      '</div>',
      { width: '400px' }
    );

    if (reason === 'SESSION_EXPIRED') {
      console.warn('[Session] 用户会话过期，提示重新登录');
    }
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initApp();
    initSessionManager();
    checkLogoutReason();
  });
} else {
  initApp();
  initSessionManager();
  checkLogoutReason();
}
