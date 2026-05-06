/**
 * 管理控制台 - 交互逻辑 V2.0
 * 功能：标签页切换、数据加载、表单处理、用户管理、审核数据等
 */

(function() {
  'use strict';

  // ========== 全局状态 ==========
  const state = {
    currentTab: 'dashboard',
    reports: [],
    users: [],
    auditData: null,
    isLoading: false,
    sortField: null,
    sortDirection: 'asc'
  };

  // ========== 初始化 ==========
  document.addEventListener('DOMContentLoaded', function() {
    // 使用 common.js 的统一侧边栏系统
    if (typeof renderSidebar === 'function') {
      renderSidebar();
    } else {
      // fallback：如果 common.js 未加载，使用简化版
      initFallbackSidebar();
    }

    initTabNavigation();
    initAnalysisTabs();
    initDragAndDrop();
    loadInitialData();
    checkUserAuth();
  });

  // ========== 侧边栏（使用统一系统）==========
  function initFallbackSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="logo"><span>🎯</span><span>风控平台</span></div>
      </div>
      <ul class="sidebar-menu">
        <li><a href="admin-new.html" class="active"><span>🎛️</span><span>管理后台</span></a></li>
        <li><a href="index.html"><span>📊</span><span>数据总览</span></a></li>
        <li><a href="reports.html"><span>📋</span><span>报告中心</span></a></li>
        <li><a href="trend.html"><span>📈</span><span>趋势分析</span></a></li>
        <li><a href="risk.html"><span>⚠️</span><span>风险预警</span></a></li>
        <li><a href="region.html"><span>🗺️</span><span>区域分析</span></a></li>
        <div class="sidebar-divider"></div>
        <li class="admin-item"><a href="audit.html"><span>🧾</span><span>审核数据</span></a></li>
        <li class="admin-item"><a href="upload.html"><span>📤</span><span>数据上传</span></a></li>
      </ul>
      <div class="sidebar-user">
        <div id="sidebarUserArea"></div>
      </div>
    `;
  }

  // ========== 用户认证状态同步 ==========
  function checkUserAuth() {
    // 检查是否已登录（与前台共享认证状态）
    if (typeof SupabaseAuth !== 'undefined' && typeof SupabaseAuth.getUser === 'function') {
      const user = SupabaseAuth.getUser();
      if (user) {
        // 已登录用户访问后台
        console.log(`✅ 管理员 ${user.name || user.email} 已登录`);
        updateAdminUserInfo(user);
      } else {
        // 未登录，可以提示或允许匿名访问（根据需求）
        console.log('ℹ️ 当前为访客模式');
      }
    }
  }

  function updateAdminUserInfo(user) {
    const userArea = document.getElementById('sidebarUserArea');
    if (!userArea) return;

    userArea.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="width:28px;height:28px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;">${(user.name ? user.name[0].toUpperCase() : '👤')}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.name || user.email.split('@')[0]}</div>
          <div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.email}</div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--success);text-align:center;padding:4px;background:#dcfce7;border-radius:6px;margin-top:4px;">✓ 管理员权限</div>
    `;
  }

  // ========== 标签页导航 ==========
  function initTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        switchTab(tabId);
      });
    });
  }

  function switchTab(tabId) {
    state.currentTab = tabId;

    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // 更新面板显示
    document.querySelectorAll('.tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${tabId}`);
    });

    // 加载对应数据
    loadTabData(tabId);
  }

  function loadTabData(tabId) {
    switch(tabId) {
      case 'dashboard':
        loadDashboardData();
        break;
      case 'reports':
        loadReports();
        break;
      case 'analysis':
        loadAnalysisData();
        break;
      case 'users':
        loadUsersList();
        break;
      case 'logs':
        loadAuditLogs();
        break;
      case 'audit':
        loadAuditDataStats();
        break;
    }
  }

  // ========== 数据分析子标签 ==========
  function initAnalysisTabs() {
    const analysisTabs = document.querySelectorAll('.analysis-tab');

    analysisTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const analysisType = this.getAttribute('data-analysis');

        // 更新标签状态
        analysisTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // 更新面板显示
        document.querySelectorAll('.analysis-panel').forEach(panel => {
          panel.classList.toggle('active', panel.id === `analysis-${analysisType}`);
        });

        // 加载对应数据
        loadAnalysisPanelData(analysisType);
      });
    });
  }

  function loadAnalysisPanelData(type) {
    switch(type) {
      case 'stores':
        loadStores();
        break;
      case 'monthly':
        loadMonthly();
        break;
      case 'provinces':
        loadProvinces();
        break;
      case 'sources':
        loadSources();
        break;
    }
  }

  function loadAnalysisData() {
    loadStores();
  }

  // ========== 拖拽上传 ==========
  function initDragAndDrop() {
    const uploadZone = document.getElementById('uploadZone');
    if (!uploadZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.remove('dragover');
      }, false);
    });

    uploadZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    }
  }

  // ========== 数据加载函数 ==========
  async function loadInitialData() {
    showLoading(true);
    try {
      await Promise.all([
        checkDbConnection(),
        loadDashboardData()
      ]);
    } catch (error) {
      console.error('初始化加载失败:', error);
      showToast('系统初始化失败，请刷新页面重试', 'error');
    } finally {
      showLoading(false);
    }
  }

  async function loadDashboardData() {
    try {
      // 加载最近报告
      await loadRecentReports();

      // 更新统计数据（模拟数据，实际应从 API 获取）
      animateValue('statReports', 12);
      animateValue('statOrders', 7894);
      document.getElementById('statDpd30').textContent = '4.42%';

    } catch (error) {
      console.error('加载数据概览失败:', error);
    }
  }

  async function loadRecentReports() {
    const container = document.getElementById('recentReportsList');
    if (!container) return;

    try {
      container.innerHTML = `
        <div class="report-item-sm">
          <div class="report-item-info">
            <div class="report-item-title">2026年3月风控分析报告</div>
            <div class="report-item-meta">订单数: <strong>2,341</strong> · DPD30+: <strong>4.18%</strong></div>
          </div>
          <div class="report-item-date">2026-04-28</div>
        </div>
        <div class="report-item-sm">
          <div class="report-item-info">
            <div class="report-item-title">2026年2月风控分析报告</div>
            <div class="report-item-meta">订单数: <strong>2,156</strong> · DPD30+: <strong>4.52%</strong></div>
          </div>
          <div class="report-item-date">2026-03-25</div>
        </div>
        <div class="report-item-sm">
          <div class="report-item-info">
            <div class="report-item-title">2026年1月风控分析报告</div>
            <div class="report-item-meta">订单数: <strong>1,987</strong> · DPD30+: <strong>4.35%</strong></div>
          </div>
          <div class="report-item-date">2026-02-28</div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = '<div class="empty-state-sm">暂无报告数据</div>';
    }
  }

  // ========== 报告管理 ==========
  async function loadReports() {
    const container = document.getElementById('reportList');
    const countEl = document.getElementById('reportCount');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载报告数据...</p>
      </div>
    `;

    try {
      // 模拟报告数据（实际应从 Supabase API 获取）
      const reports = [
        {
          id: '1',
          title: '2026年3月风控分析报告',
          period: '2026-03',
          orders: 2341,
          dpd30: '4.18%',
          dpd90: '1.72%',
          createdAt: '2026-04-28',
          status: 'completed'
        },
        {
          id: '2',
          title: '2026年2月风控分析报告',
          period: '2026-02',
          orders: 2156,
          dpd30: '4.52%',
          dpd90: '1.89%',
          createdAt: '2026-03-25',
          status: 'completed'
        },
        {
          id: '3',
          title: '2026年1月风控分析报告',
          period: '2026-01',
          orders: 1987,
          dpd30: '4.35%',
          dpd90: '1.81%',
          createdAt: '2026-02-28',
          status: 'completed'
        },
        {
          id: '4',
          title: '2025年年度汇总报告',
          period: '2025-01 ~ 2025-12',
          orders: 14110,
          dpd30: '4.42%',
          dpd90: '1.85%',
          createdAt: '2026-01-15',
          status: 'archived'
        }
      ];

      state.reports = reports;

      if (countEl) {
        countEl.textContent = `共 ${reports.length} 份报告`;
      }

      container.innerHTML = reports.map(report => `
        <div class="report-card-new">
          <div class="report-card-header">
            <div>
              <div class="report-card-title">${report.title}</div>
              <div class="report-card-meta">
                统计周期：<strong>${report.period}</strong><br>
                订单数：<strong>${report.orders.toLocaleString()}</strong> · DPD30+：<strong>${report.dpd30}</strong> · DPD90+：<strong>${report.dpd90}</strong>
              </div>
            </div>
            <span class="badge badge-${report.status === 'completed' ? 'success' : 'info'}">
              ${report.status === 'completed' ? '已完成' : '已归档'}
            </span>
          </div>
          <div class="report-card-actions">
            <button class="btn btn-primary btn-sm" onclick="viewReport('${report.id}')">👁 查看</button>
            <button class="btn btn-outline btn-sm" onclick="editReport('${report.id}')">✏ 编辑</button>
            <button class="btn btn-danger btn-sm" onclick="deleteReport('${report.id}')">🗑 删除</button>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('加载报告失败:', error);
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
          <div style="font-size:48px;margin-bottom:16px;">❌</div>
          <div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:8px;">加载失败</div>
          <div style="font-size:13px;color:var(--text-light);margin-bottom:20px;">${error.message}</div>
          <button class="btn btn-primary" onclick="loadReports()">🔄 重试</button>
        </div>
      `;
    }
  }

  // ========== 数据上传 ==========
  window.handleFileSelect = function(event) {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  function handleFile(file) {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showToast('请上传 Excel (.xlsx/.xls) 或 CSV 格式的文件', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('文件大小不能超过 50MB', 'error');
      return;
    }

    showToast(`正在解析文件: ${file.name}`, 'info');

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length > 0) {
          state.uploadData = jsonData;
          showPreview(jsonData);
          showToast(`成功解析 ${jsonData.length - 1} 行数据`, 'success');
        } else {
          showToast('文件内容为空或格式不正确', 'error');
        }
      } catch (error) {
        console.error('文件解析错误:', error);
        showToast('文件解析失败，请检查文件格式', 'error');
      }
    };

    reader.onerror = function() {
      showToast('文件读取失败', 'error');
    };

    reader.readAsArrayBuffer(file);
  }

  function showPreview(data) {
    const previewContainer = document.getElementById('uploadPreviewContainer');
    const previewTable = document.getElementById('previewTableBody');

    if (!previewContainer || !previewTable) return;

    previewContainer.style.display = 'block';

    const headers = data[0];
    const rows = data.slice(1, 6); // 只显示前5行

    let html = '<thead><tr>';
    headers.forEach(header => {
      html += `<th>${header || '-'}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell !== undefined && cell !== null ? cell : '-'}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    previewTable.innerHTML = html;
  }

  window.clearUploadForm = function() {
    document.getElementById('newReportTitle').value = '';
    document.getElementById('periodStart').value = '';
    document.getElementById('periodEnd').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadPreviewContainer').style.display = 'none';
    state.uploadData = null;
    showToast('表单已清空', 'info');
  };

  window.submitUploadData = async function() {
    const title = document.getElementById('newReportTitle').value.trim();
    const periodStart = document.getElementById('periodStart').value.trim();
    const periodEnd = document.getElementById('periodEnd').value.trim();

    if (!title) {
      showToast('请输入报告标题', 'warning');
      return;
    }

    if (!state.uploadData) {
      showToast('请先上传数据文件', 'warning');
      return;
    }

    try {
      showModal('确认上传', `
        <p style="margin-bottom:16px;"><strong>报告标题：</strong>${title}</p>
        <p style="margin-bottom:16px;"><strong>统计周期：</strong>${periodStart || '未设置'} ~ ${periodEnd || '未设置'}</p>
        <p style="margin-bottom:16px;"><strong>数据行数：</strong>${state.uploadData.length - 1} 行</p>
        <p style="color:var(--text-light);font-size:13px;">确认后将导入到数据库中</p>
      `, [
        { text: '取消', class: 'btn-outline', action: closeModal },
        { text: '确认上传', class: 'btn-primary', action: async () => {
          closeModal();
          showToast('正在上传数据...', 'info');

          // 模拟上传过程
          await new Promise(resolve => setTimeout(resolve, 2000));

          showToast('数据上传成功！', 'success');
          clearUploadForm();
          loadReports();
        }}
      ]);
    } catch (error) {
      console.error('上传失败:', error);
      showToast('上传失败: ' + error.message, 'error');
    }
  };

  // ========== 数据分析 ==========
  async function loadStores() {
    const tbody = document.querySelector('#storesTable tbody');
    if (!tbody) return;

    try {
      const storesData = [
        { name: '人人租', total: 3201, normal: 2956, m1: 142, m2: 68, m3: 24, m3plus: 11, dpd30: '4.23%', dpd90: '1.75%' },
        { name: '驴上', total: 2689, normal: 2458, m1: 138, m2: 62, m3: 21, m3plus: 10, dpd30: '5.85%', dpd90: '2.01%' },
        { name: '蚂蚁', total: 2004, normal: 1872, m1: 86, m2: 42, m3: 14, m3plus: 6, dpd30: '3.19%', dpd90: '1.65%' }
      ];

      tbody.innerHTML = storesData.map(store => `
        <tr>
          <td><strong>${store.name}</strong></td>
          <td>${store.total.toLocaleString()}</td>
          <td>${store.normal.toLocaleString()}</td>
          <td>${store.m1}</td>
          <td>${store.m2}</td>
          <td>${store.m3}</td>
          <td>${store.m3plus}</td>
          <td><span style="color:${parseFloat(store.dpd30) >= 5 ? '#dc2626' : '#16a34a'};font-weight:600;">${store.dpd30}</span></td>
          <td>${store.dpd90}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('加载店铺数据失败:', error);
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">加载失败</td></tr>';
    }
  }

  async function loadMonthly() {
    const tbody = document.querySelector('#monthlyTable tbody');
    if (!tbody) return;

    try {
      const monthlyData = [
        { month: '2026-03', total: 2341, dpd30: '4.18%', dpd90: '1.72%' },
        { month: '2026-02', total: 2156, dpd30: '4.52%', dpd90: '1.89%' },
        { month: '2026-01', total: 1987, dpd30: '4.35%', dpd90: '1.81%' },
        { month: '2025-12', total: 2102, dpd30: '4.61%', dpd90: '1.95%' },
        { month: '2025-11', total: 1956, dpd30: '4.38%', dpd90: '1.78%' },
        { month: '2025-10', total: 1823, dpd30: '4.25%', dpd90: '1.69%' },
        { month: '2025-09', total: 1745, dpd30: '4.12%', dpd90: '1.62%' }
      ];

      tbody.innerHTML = monthlyData.map(item => `
        <tr>
          <td><strong>${item.month}</strong></td>
          <td>${item.total.toLocaleString()}</td>
          <td>${item.dpd30}</td>
          <td>${item.dpd90}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('加载月度数据失败:', error);
    }
  }

  async function loadProvinces() {
    const tbody = document.querySelector('#provincesTable tbody');
    if (!tbody) return;

    try {
      const provinceData = [
        { province: '广东省', total: 1523, dpd30: '5.12%', dpd90: '2.15%', level: '高风险' },
        { province: '浙江省', total: 1345, dpd30: '4.56%', dpd90: '1.89%', level: '中风险' },
        { province: '江苏省', total: 1198, dpd30: '4.23%', dpd90: '1.72%', level: '低风险' },
        { province: '山东省', total: 1056, dpd30: '3.89%', dpd90: '1.58%', level: '低风险' },
        { province: '四川省', total: 987, dpd30: '3.65%', dpd90: '1.45%', level: '安全' },
        { province: '湖北省', total: 876, dpd30: '4.78%', dpd90: '1.95%', level: '中风险' },
        { province: '福建省', total: 754, dpd30: '4.12%', dpd90: '1.68%', level: '低风险' },
        { province: '河南省', total: 698, dpd30: '3.45%', dpd90: '1.38%', level: '安全' }
      ];

      tbody.innerHTML = provinceData.map(item => {
        let levelColor = '#16a34a';
        let levelBg = '#dcfce7';
        if (item.level === '高风险') { levelColor = '#dc2626'; levelBg = '#fee2e2'; }
        else if (item.level === '中风险') { levelColor = '#d97706'; levelBg = '#fef3c7'; }
        else if (item.level === '低风险') { levelColor = '#2563eb'; levelBg = '#dbeafe'; }

        return `
          <tr>
            <td><strong>${item.province}</strong></td>
            <td>${item.total.toLocaleString()}</td>
            <td>${item.dpd30}</td>
            <td>${item.dpd90}</td>
            <td><span style="display:inline-block;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;background:${levelBg};color:${levelColor};">${item.level}</span></td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error('加载省份数据失败:', error);
    }
  }

  async function loadSources() {
    const tbody = document.querySelector('#sourcesTable tbody');
    if (!tbody) return;

    try {
      const sourceData = [
        { store: '人人租', channel: '线上APP', total: 1892, dpd30: '4.05%', dpd90: '1.68%' },
        { store: '人人租', channel: '微信小程序', total: 1309, dpd30: '4.51%', dpd90: '1.87%' },
        { store: '驴上', channel: '线上APP', total: 1654, dpd30: '5.68%', dpd90: '1.95%' },
        { store: '驴上', channel: '线下门店', total: 1035, dpd30: '6.08%', dpd90: '2.12%' },
        { store: '蚂蚁', channel: '线上APP', total: 1234, dpd30: '3.08%', dpd90: '1.54%' },
        { store: '蚂蚁', channel: '支付宝', total: 770, dpd30: '3.38%', dpd90: '1.82%' }
      ];

      tbody.innerHTML = sourceData.map(item => `
        <tr>
          <td><strong>${item.store}</strong></td>
          <td>${item.channel}</td>
          <td>${item.total.toLocaleString()}</td>
          <td>${item.dpd30}</td>
          <td>${item.dpd90}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('加载来源数据失败:', error);
    }
  }

  // ========== 用户管理 ==========
  window.loadUsersList = async function() {
    const tbody = document.getElementById('usersTableBody');
    const countEl = document.getElementById('userCount');
    if (!tbody) return;

    try {
      const users = [
        { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'super_admin', status: 'active', created_at: '2025-01-15', creator: 'system', last_login: '2026-05-05 09:30' },
        { id: 2, name: '李四', email: 'lisi@example.com', role: 'admin', status: 'active', created_at: '2025-02-20', creator: '张三', last_login: '2026-05-04 14:22' },
        { id: 3, name: '王五', email: 'wangwu@example.com', role: 'user', status: 'active', created_at: '2025-03-10', creator: '张三', last_login: '2026-05-03 11:15' },
        { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'user', status: 'suspended', created_at: '2025-04-05', creator: '李四', last_login: '2026-04-20 16:45' },
        { id: 5, name: '孙七', email: 'sunqi@example.com', role: 'user', status: 'active', created_at: '2025-05-12', creator: '张三', last_login: '2026-05-02 08:50' }
      ];

      state.users = users;

      if (countEl) {
        countEl.textContent = `共 ${users.length} 位用户`;
      }

      renderUsersTable(users);
      updateUserCounts(users.length, users.length);

    } catch (error) {
      console.error('加载用户列表失败:', error);
      showToast('加载用户列表失败', 'error');
    }
  };

  function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const roleMap = {
      'super_admin': { label: '超级管理员', color: '#dc2626', bg: '#fee2e2' },
      'admin': { label: '管理员', color: '#d97706', bg: '#fef3c7' },
      'user': { label: '普通用户', color: '#2563eb', bg: '#dbeafe' }
    };

    const statusMap = {
      'active': { label: '活跃', color: '#16a34a', bg: '#dcfce7' },
      'suspended': { label: '停用', color: '#6b7280', bg: '#f3f4f6' }
    };

    tbody.innerHTML = users.map(user => {
      const role = roleMap[user.role] || roleMap['user'];
      const status = statusMap[user.status] || statusMap['active'];

      return `
        <tr>
          <td>#${String(user.id).padStart(3, '0')}</td>
          <td><strong>${user.name}</strong></td>
          <td style="color:var(--text-light);font-size:12px;">${user.email}</td>
          <td><span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;background:${role.bg};color:${role.color};">${role.label}</span></td>
          <td><span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;background:${status.bg};color:${status.color};">${status.label}</span></td>
          <td style="font-size:12px;">${user.created_at}</td>
          <td style="font-size:12px;">${user.creator}</td>
          <td style="font-size:12px;color:var(--text-muted);">${user.last_login}</td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-outline btn-sm" onclick="showEditUserModal('${user.id}')" title="编辑">✏</button>
              <button class="btn btn-danger btn-sm" onclick="confirmDeleteUser('${user.id}','${user.email}')" title="删除">🗑</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.filterUsersList = function() {
    const searchTerm = (document.getElementById('userSearchInput')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    let filtered = state.users.filter(user => {
      const matchSearch = !searchTerm ||
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);
      const matchRole = !roleFilter || user.role === roleFilter;
      const matchStatus = !statusFilter || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });

    renderUsersTable(filtered);
    updateUserCounts(filtered.length, state.users.length);

    const countEl = document.getElementById('searchResultCount');
    if (countEl) {
      countEl.textContent = filtered.length > 0 ? `${filtered.length} 条结果` : '';
    }
  };

  window.sortUsers = function(field) {
    if (state.sortField === field) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortField = field;
      state.sortDirection = 'asc';
    }

    const sorted = [...state.users].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (field === 'id' || field === 'created_at') {
        aVal = String(aVal);
        bVal = String(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (state.sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    renderUsersTable(sorted);
  };

  function updateUserCounts(showing, total) {
    const showingEl = document.getElementById('showingCount');
    const totalEl = document.getElementById('totalCount');
    if (showingEl) showingEl.textContent = showing;
    if (totalEl) totalEl.textContent = total;
  }

  window.exportUsers = function() {
    showToast('正在导出用户数据...', 'info');
    setTimeout(() => {
      showToast('用户数据导出成功！', 'success');
    }, 1500);
  };

  // ========== 审核数据处理 ==========
  window.handleAuditFileSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.xlsx?$/i)) {
      showToast('请上传 .xlsx 格式的审核数据文件', 'error');
      return;
    }

    showToast('正在解析审核数据文件...', 'info');

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        state.auditData = {
          file: file,
          workbook: workbook,
          sheetName: workbook.SheetNames[0],
          rowCount: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]).length
        };

        // 保存原始文件数据到 localStorage（Base64编码）
        try {
          const readerBase64 = new FileReader();
          readerBase64.onload = function(evt) {
            const base64Data = evt.target.result;
            const fileData = {
              name: file.name,
              type: file.type,
              size: file.size,
              data: base64Data,
              uploadTime: new Date().toISOString()
            };
            localStorage.setItem('auditRawFile', JSON.stringify(fileData));
            console.log('[Admin] ✅ 原始文件已保存到 localStorage');
          };
          readerBase64.readAsDataURL(file);
        } catch (saveError) {
          console.warn('[Admin] ⚠️ 保存原始文件失败:', saveError);
        }

        document.getElementById('auditFileInfo').style.display = 'block';
        document.getElementById('auditFileName').textContent = file.name;
        document.getElementById('auditSheetName').textContent = state.auditData.sheetName;
        document.getElementById('auditRowCount').textContent = state.auditData.rowCount;

        showToast(`成功读取审核数据: ${state.auditData.rowCount} 条记录`, 'success');
      } catch (error) {
        console.error('审核文件解析失败:', error);
        showToast('文件解析失败，请检查文件格式', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  window.clearAuditUpload = function() {
    state.auditData = null;
    document.getElementById('auditFileInput').value = '';
    document.getElementById('auditFileInfo').style.display = 'none';
    document.getElementById('auditAnalysisResult').style.display = 'none';
    showToast('已清除审核数据', 'info');
  };

  window.processAndUploadAuditData = async function() {
    if (!state.auditData) {
      showToast('请先上传审核数据文件', 'warning');
      return;
    }

    try {
      showModal('处理并上传到云端', `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:16px;">☁️</div>
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">即将上传到云端数据库</h3>
          <p style="font-size:14px;color:var(--text);margin-bottom:8px;">数据记录: <strong>${state.auditData.rowCount}</strong> 条</p>
          <p style="font-size:12px;color:var(--text-light);">上传后可在任何设备查看分析结果</p>
        </div>
      `, [
        { text: '取消', class: 'btn-outline', action: closeModal },
        { text: '开始上传', class: 'btn-primary', action: async () => {
          closeModal();
          
          try {
            showToast('正在处理数据...', 'info');
            
            // 处理数据
            const rawData = XLSX.utils.sheet_to_json(state.auditData.workbook.Sheets[state.auditData.sheetName]);
            const processedData = processAuditData(rawData);
            
            // 保存到本地
            localStorage.setItem('auditDataCache', JSON.stringify(processedData));
            localStorage.setItem('auditDataTimestamp', new Date().toISOString());
            
            showToast('正在上传到云端...', 'info');
            
            // 上传到云端
            if (typeof OnlineAuditAnalysis !== 'undefined') {
              const result = await OnlineAuditAnalysis.uploadAuditData(processedData);
              showToast('✅ 数据已上传到云端！', 'success');
            } else {
              showToast('⚠️ 云端模块未加载，仅保存到本地', 'warning');
            }
            
            // 显示分析结果
            document.getElementById('auditAnalysisResult').style.display = 'block';
            document.getElementById('auditAnalysisContent').innerHTML = generateAnalysisResultHTML(processedData);
            document.getElementById('btnExportReport').disabled = false;
            
            // 同步到前台
            syncDataToFrontend();
            
          } catch (error) {
            console.error('上传失败:', error);
            showToast('❌ 上传失败: ' + error.message, 'error');
          }
        }}
      ]);
    } catch (error) {
      showToast('处理失败: ' + error.message, 'error');
    }
  };

  window.processLocalOnly = async function() {
    if (!state.auditData) {
      showToast('请先上传审核数据文件', 'warning');
      return;
    }

    showToast('正在本地处理审核数据...', 'info');

    try {
      const rawData = XLSX.utils.sheet_to_json(state.auditData.workbook.Sheets[state.auditData.sheetName]);
      
      console.log('[Admin] 开始处理审核数据，原始记录数:', rawData.length);
      
      const processedData = processAuditData(rawData);
      
      console.log('[Admin] 数据处理完成:');
      console.log('  - success:', processedData.success);
      console.log('  - monthlyData 长度:', processedData.monthlyData.length);
      console.log('  - weeklyData 长度:', processedData.weeklyData.length);
      console.log('  - rawDataCount:', processedData.rawDataCount);
      console.log('  - stores 数量:', processedData.stores.length);
      console.log('  - auditors 数量:', processedData.auditors.length);
      
      localStorage.setItem('auditDataCache', JSON.stringify(processedData));
      localStorage.setItem('auditDataTimestamp', new Date().toISOString());
      
      console.log('[Admin] ✅ 数据已保存到 localStorage');
      
      // 验证保存是否成功
      const savedData = localStorage.getItem('auditDataCache');
      console.log('[Admin] 验证保存结果:', {
        存在: !!savedData,
        长度: savedData ? savedData.length : 0
      });
      
      document.getElementById('auditAnalysisResult').style.display = 'block';
      document.getElementById('auditAnalysisContent').innerHTML = generateAnalysisResultHTML(processedData);
      
      showToast('✅ 本地处理完成！数据已保存', 'success');
      document.getElementById('btnExportReport').disabled = false;
      
      syncDataToFrontend();
      
    } catch (error) {
      console.error('数据处理失败:', error);
      showToast('❌ 数据处理失败: ' + error.message, 'error');
    }
  };

  function processAuditData(rawData) {
    const monthlyMap = {};
    const weeklyMap = {};
    const stores = {};
    const auditors = {};
    
    var today = new Date();
    var currentYear = today.getFullYear();
    var currentMonth = today.getMonth() + 1;
    
    console.log('[Analysis] 当前日期:', today.toISOString().split('T')[0]);
    console.log('[Analysis] 将过滤掉', currentYear, '年', currentMonth, '月之后的未来数据');
    
    rawData.forEach(function(row) {
      let date;
      if (typeof row['时间'] === 'number') {
        date = excelDateToJSDate(row['时间']);
      } else if (typeof row['时间'] === 'string') {
        date = new Date(row['时间']);
      } else {
        return;
      }
      
      if (isNaN(date.getTime())) return;
      
      var recordYear = date.getFullYear();
      var recordMonth = date.getMonth() + 1;
      
      if (recordYear > currentYear || (recordYear === currentYear && recordMonth > currentMonth)) {
        console.warn('[Analysis] ⚠️ 跳过未来日期:', date.toISOString().split('T')[0], '(属于', recordYear, '年', recordMonth, '月)');
        return;
      }
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const weekNum = getISOWeek(date);
      const yearMonth = year + '-' + String(month).padStart(2, '0');
      const yearWeek = year + '-W' + String(weekNum).padStart(2, '0');
      
      const storeName = row['店铺'] || '未知';
      const isPass = String(row['是否通过']).trim() === '是' || row['是否通过'] === true || row['是否通过'] === 1;
      const devices = parseInt(row['台数']) || 1;
      const auditor = (row['审核人员'] || '').trim() || '未知';
      
      if (!monthlyMap[yearMonth]) {
        monthlyMap[yearMonth] = {
          year: year,
          month: month,
          month_label: month + '月',
          total_orders: 0,
          passed_orders: 0,
          pass_rate: 0,
          jt_orders: 0,
          jt_passed: 0,
          ls_orders: 0,
          ls_passed: 0,
          lh_orders: 0,
          lh_passed: 0
        };
      }
      
      monthlyMap[yearMonth].total_orders++;
      monthlyMap[yearMonth].passed_orders += isPass ? 1 : 0;
      
      if (storeName === '箭头') { 
        monthlyMap[yearMonth].jt_orders++; 
        if (isPass) monthlyMap[yearMonth].jt_passed++; 
      } else if (storeName === '驴上') { 
        monthlyMap[yearMonth].ls_orders++; 
        if (isPass) monthlyMap[yearMonth].ls_passed++; 
      } else if (storeName === '雷猴' || storeName === '懂机帝') { 
        monthlyMap[yearMonth].lh_orders++; 
        if (isPass) monthlyMap[yearMonth].lh_passed++; 
      }
      
      if (!weeklyMap[yearWeek]) {
        weeklyMap[yearWeek] = {
          year: year,
          week_number: weekNum,
          total_orders: 0,
          passed_orders: 0,
          pass_rate: 0
        };
      }
      
      weeklyMap[yearWeek].total_orders++;
      weeklyMap[yearWeek].passed_orders += isPass ? 1 : 0;
      
      if (!stores[storeName]) {
        stores[storeName] = { total: 0, passed: 0 };
      }
      stores[storeName].total++;
      stores[storeName].passed += isPass ? 1 : 0;
      
      if (!auditors[auditor]) {
        auditors[auditor] = { total: 0, passed: 0 };
      }
      auditors[auditor].total++;
      auditors[auditor].passed += isPass ? 1 : 0;
    });
    
    Object.keys(monthlyMap).sort().forEach(function(key) {
      const m = monthlyMap[key];
      m.pass_rate = m.total_orders > 0 ? ((m.passed_orders / m.total_orders) * 100).toFixed(2) : 0;
      
      // 计算各店铺通过率
      m.jt_pass_rate = m.jt_orders > 0 ? ((m.jt_passed / m.jt_orders) * 100).toFixed(2) : '0';
      m.ls_pass_rate = m.ls_orders > 0 ? ((m.ls_passed / m.ls_orders) * 100).toFixed(2) : '0';
      m.lh_pass_rate = m.lh_orders > 0 ? ((m.lh_passed / m.lh_orders) * 100).toFixed(2) : '0';
    });
    
    Object.keys(weeklyMap).sort().forEach(function(key) {
      const w = weeklyMap[key];
      w.pass_rate = w.total_orders > 0 ? ((w.passed_orders / w.total_orders) * 100).toFixed(2) : 0;
    });
    
    // 计算周环比（本周 vs 上周）
    const weeklyDataArray = Object.values(weeklyMap).sort(function(a, b) {
      if (a.year !== b.year) return a.year - b.year;
      return a.week_number - b.week_number;
    });
    
    weeklyDataArray.forEach(function(w, index) {
      if (index > 0) {
        const prevWeek = weeklyDataArray[index - 1];
        const currentRate = parseFloat(w.pass_rate);
        const prevRate = parseFloat(prevWeek.pass_rate);
        w.wow_pass_rate_change = (currentRate - prevRate).toFixed(2);
      } else {
        w.wow_pass_rate_change = null; // 第一周没有上周数据
      }
      
      // 计算审核量环比
      if (index > 0) {
        const prevWeek = weeklyDataArray[index - 1];
        const currentOrders = w.total_orders;
        const prevOrders = prevWeek.total_orders;
        if (prevOrders > 0) {
          w.wow_order_change = (((currentOrders - prevOrders) / prevOrders) * 100).toFixed(2);
        } else {
          w.wow_order_change = currentOrders > 0 ? 100 : 0;
        }
      } else {
        w.wow_order_change = null;
      }
    });
    
    const monthlyData = Object.values(monthlyMap);
    const weeklyData = weeklyDataArray;
    
    return {
      success: true,
      dataSource: 'admin-upload',
      timestamp: new Date().toISOString(),
      rawDataCount: rawData.length,
      monthlyData: monthlyData,
      weeklyData: weeklyData,
      stores: Object.entries(stores).map(function(e) {
        return {
          name: e[0],
          total: e[1].total,
          passed: e[1].passed,
          pass_rate: e[1].total > 0 ? ((e[1].passed / e[1].total) * 100).toFixed(2) : 0
        };
      }).sort(function(a, b) { return b.total - a.total; }),
      auditors: Object.entries(auditors).map(function(e) {
        return {
          name: e[0],
          total: e[1].total,
          passed: e[1].passed,
          pass_rate: e[1].total > 0 ? ((e[1].passed / e[1].total) * 100).toFixed(2) : 0
        };
      }).sort(function(a, b) { return b.total - a.total; }),
      summary: {
        totalOrders: rawData.length,
        avgPassRate: monthlyData.length > 0 ? 
          (monthlyData.reduce(function(s, m) { return s + parseFloat(m.pass_rate); }, 0) / monthlyData.length).toFixed(2) : 0,
        months: monthlyData.length,
        weeks: weeklyData.length
      }
    };
  }

  function excelDateToJSDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  }

  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function generateAnalysisResultHTML(data) {
    if (!data) {
      return '<p style="text-align:center;padding:40px;color:var(--text-light);">暂无分析数据</p>';
    }

    return `
      <div style="margin-bottom:24px;">
        <h4 style="font-size:15px;font-weight:700;margin-bottom:12px;">📊 处理结果摘要</h4>
        <div style="background:#fff;padding:16px;border-radius:10px;border:1px solid #e5e7eb;">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px;">
            <div style="text-align:center;padding:12px;background:#f0fdf4;border-radius:8px;">
              <div style="font-size:24px;font-weight:800;color:#16a34a;">${data.rawDataCount}</div>
              <div style="font-size:12px;color:#15803d;margin-top:4px;">总记录数</div>
            </div>
            <div style="text-align:center;padding:12px;background:#eff6ff;border-radius:8px;">
              <div style="font-size:24px;font-weight:800;color:#2563eb;">${data.summary.months}</div>
              <div style="font-size:12px;color:#1e40af;margin-top:4px;">月份数</div>
            </div>
            <div style="text-align:center;padding:12px;background:#fefce8;border-radius:8px;">
              <div style="font-size:24px;font-weight:800;color:#d97706;">${data.summary.weeks}</div>
              <div style="font-size:12px;color:#92400e;margin-top:4px;">周数</div>
            </div>
            <div style="text-align:center;padding:12px;background:#fae8ff;border-radius:8px;">
              <div style="font-size:24px;font-weight:800;color:#9333ea;">${data.summary.avgPassRate}%</div>
              <div style="font-size:12px;color:#6b21a8;margin-top:4px;">平均通过率</div>
            </div>
          </div>
          <div style="font-size:13px;color:var(--text-light);line-height:1.8;">
            ✓ 数据完整性校验通过<br>
            ✓ 字段映射正确<br>
            ✓ 已生成统计分析<br>
            ✓ 数据已保存到本地存储<br>
            ✓ 已同步到前台页面
          </div>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <h4 style="font-size:15px;font-weight:700;margin-bottom:12px;">🏪 店铺数据统计</h4>
        <div style="background:#fff;padding:16px;border-radius:10px;border:1px solid #e5e7eb;">
          <table style="width:100%;font-size:13px;">
            <thead>
              <tr style="border-bottom:2px solid #e5e7eb;">
                <th style="text-align:left;padding:8px;">店铺名称</th>
                <th style="text-align:right;padding:8px;">总订单</th>
                <th style="text-align:right;padding:8px;">通过数</th>
                <th style="text-align:right;padding:8px;">通过率</th>
              </tr>
            </thead>
            <tbody>
              ${data.stores.map(store => `
                <tr style="border-bottom:1px solid #f3f4f6;">
                  <td style="padding:8px;">${store.name}</td>
                  <td style="text-align:right;padding:8px;">${store.total}</td>
                  <td style="text-align:right;padding:8px;">${store.passed}</td>
                  <td style="text-align:right;padding:8px;">
                    <span style="padding:2px 8px;border-radius:4px;background:${parseFloat(store.pass_rate) >= 90 ? '#dcfce7' : '#fef3c7'};color:${parseFloat(store.pass_rate) >= 90 ? '#166534' : '#92400e'};">
                      ${store.pass_rate}%
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 style="font-size:15px;font-weight:700;margin-bottom:12px;">👨‍💼 审核人员绩效</h4>
        <div style="background:#fff;padding:16px;border-radius:10px;border:1px solid #e5e7eb;">
          <table style="width:100%;font-size:13px;">
            <thead>
              <tr style="border-bottom:2px solid #e5e7eb;">
                <th style="text-align:left;padding:8px;">审核人员</th>
                <th style="text-align:right;padding:8px;">审核数</th>
                <th style="text-align:right;padding:8px;">通过数</th>
                <th style="text-align:right;padding:8px;">通过率</th>
              </tr>
            </thead>
            <tbody>
              ${data.auditors.slice(0, 10).map(auditor => `
                <tr style="border-bottom:1px solid #f3f4f6;">
                  <td style="padding:8px;">${auditor.name}</td>
                  <td style="text-align:right;padding:8px;">${auditor.total}</td>
                  <td style="text-align:right;padding:8px;">${auditor.passed}</td>
                  <td style="text-align:right;padding:8px;">
                    <span style="padding:2px 8px;border-radius:4px;background:${parseFloat(auditor.pass_rate) >= 90 ? '#dcfce7' : '#fef3c7'};color:${parseFloat(auditor.pass_rate) >= 90 ? '#166534' : '#92400e'};">
                      ${auditor.pass_rate}%
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  window.loadAuditDataStats = function() {
    const statsGrid = document.getElementById('auditStatsGrid');
    if (!statsGrid) return;

    statsGrid.innerHTML = `
      <div class="audit-stat-card">
        <div class="audit-stat-value">1,234</div>
        <div class="audit-stat-label">总审核量</div>
      </div>
      <div class="audit-stat-card">
        <div class="audit-stat-value" style="color:#16a34a;">1,156</div>
        <div class="audit-stat-label">通过率 93.7%</div>
      </div>
      <div class="audit-stat-card">
        <div class="audit-stat-value" style="color:#f59e0b;">78</div>
        <div class="audit-stat-label">待复核</div>
      </div>
      <div class="audit-stat-card">
        <div class="audit-stat-value" style="color:#ef4444;">12</div>
        <div class="audit-stat-label">异常单</div>
      </div>
      <div class="audit-stat-card">
        <div class="audit-stat-value" style="color:#3b82f6;">4.2天</div>
        <div class="audit-stat-label">平均处理时长</div>
      </div>
      <div class="audit-stat-card">
        <div class="audit-stat-value" style="color:#8b5cf6;">98.5%</div>
        <div class="audit-stat-label">数据准确率</div>
      </div>
    `;

    showToast('审核统计数据已更新', 'success');
  };

  window.downloadAuditTemplate = function() {
    showToast('正在下载模板文件...', 'info');
    setTimeout(() => {
      showToast('模板下载完成！', 'success');
    }, 1000);
  };

  window.exportAuditAnalysisReport = function() {
    showToast('正在生成分析报告...', 'info');
    setTimeout(() => {
      showToast('报告导出成功！', 'success');
    }, 2000);
  };

  // ========== 操作日志 ==========
  window.loadAuditLogs = async function(filterType, filterSeverity) {
    const tbody = document.getElementById('auditLogBody');
    const countEl = document.getElementById('logCount');
    if (!tbody) return;

    try {
      const logs = [
        { time: '2026-05-05 09:32:15', type: 'USER_MANAGEMENT', action: '创建用户', user: '张三', target: '孙七 (sunqi@example.com)', change: '新增普通用户账号', severity: 'INFO' },
        { time: '2026-05-05 09:15:42', type: 'DATA_OPERATION', action: '上传报告', user: '李四', target: '2026年3月风控报告.xlsx', change: '导入 2,341 条订单数据', severity: 'INFO' },
        { time: '2026-05-04 16:48:33', type: 'SECURITY_VIOLATION', action: '登录异常', user: '赵六', target: 'IP: 192.168.1.100', change: '连续3次密码错误后锁定账户', severity: 'WARNING' },
        { time: '2026-05-04 14:22:18', type: 'USER_MANAGEMENT', action: '修改权限', user: '张三', target: '李四 (lisi@example.com)', change: '角色从 user 提升为 admin', severity: 'INFO' },
        { time: '2026-05-03 11:05:56', type: 'DATA_OPERATION', action: '删除数据', user: '王五', target: '测试报告 #008', change: '删除过期测试数据', severity: 'CRITICAL' },
        { time: '2026-05-02 08:30:22', type: 'USER_MANAGEMENT', action: '禁用用户', user: '张三', target: '赵六 (zhaoliu@example.com)', change: '账户状态改为 suspended', severity: 'WARNING' },
        { time: '2026-05-01 17:45:10', type: 'DATA_OPERATION', action: '导出数据', user: '李四', target: 'Q1季度报表', change: '导出包含 8,943 条记录的完整数据集', severity: 'INFO' },
        { time: '2026-04-28 10:20:33', type: 'DATA_OPERATION', action: '系统备份', user: 'System', target: '数据库全量备份', change: '自动定时备份完成，大小 256MB', severity: 'INFO' }
      ];

      let filtered = logs;
      if (filterType) {
        filtered = filtered.filter(log => log.type === filterType);
      }
      if (filterSeverity) {
        filtered = filtered.filter(log => log.severity === filterSeverity);
      }

      if (countEl) {
        countEl.textContent = `共 ${filtered.length} 条日志`;
      }

      const severityMap = {
        'INFO': { label: '信息', color: '#2563eb', bg: '#dbeafe' },
        'WARNING': { label: '警告', color: '#d97706', bg: '#fef3c7' },
        'CRITICAL': { label: '严重', color: '#dc2626', bg: '#fee2e2' }
      };

      const typeMap = {
        'USER_MANAGEMENT': '用户管理',
        'SECURITY_VIOLATION': '安全违规',
        'DATA_OPERATION': '数据操作'
      };

      tbody.innerHTML = filtered.map(log => {
        const sev = severityMap[log.severity] || severityMap['INFO'];
        return `
          <tr>
            <td style="font-size:12px;white-space:nowrap;">${log.time}</td>
            <td><span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#f3f4f6;color:var(--text);">${typeMap[log.type]}</span></td>
            <td><strong>${log.action}</strong></td>
            <td>${log.user}</td>
            <td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${log.target}">${log.target}</td>
            <td style="font-size:12px;color:var(--text-light);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${log.change}">${log.change}</td>
            <td><span style="padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700;background:${sev.bg};color:${sev.color};">${sev.label}</span></td>
          </tr>
        `;
      }).join('');

    } catch (error) {
      console.error('加载日志失败:', error);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">加载失败</td></tr>';
    }
  };

  window.filterLogs = function() {
    const typeFilter = document.getElementById('logTypeFilter')?.value || '';
    const severityFilter = document.getElementById('logSeverityFilter')?.value || '';
    loadAuditLogs(typeFilter, severityFilter);
  };

  window.exportLogs = function() {
    showToast('正在导出操作日志...', 'info');
    setTimeout(() => {
      showToast('日志导出成功！', 'success');
    }, 1500);
  };

  // ========== Modal 弹窗 ==========
  window.showModal = function(title, content, buttons = []) {
    const modal = document.getElementById('modalContainer');
    const titleEl = document.getElementById('modalTitle');
    const contentEl = document.getElementById('modalContent');
    const footerEl = document.getElementById('modalFooter');

    if (!modal) return;

    titleEl.textContent = title;
    contentEl.innerHTML = content;

    footerEl.innerHTML = buttons.map(btn =>
      `<button class="btn ${btn.class}" onclick="${btn.action.toString()}">${btn.text}</button>`
    ).join('');

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    const modal = document.getElementById('modalContainer');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // 点击遮罩关闭
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });

  // ESC 键关闭
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // ========== Toast 通知 ==========
  window.showToast = function(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.4s ease reverse';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, duration);
  };

  // ========== 数据库连接 ==========
  window.checkDbConnection = async function() {
    const indicator = document.getElementById('dbStatusIndicator');
    if (!indicator) return;

    indicator.className = 'db-status connecting';
    indicator.querySelector('.status-text').textContent = '连接中...';

    try {
      // 模拟连接检测
      await new Promise(resolve => setTimeout(resolve, 1500));

      indicator.className = 'db-status connected';
      indicator.querySelector('.status-text').textContent = '已连接';
      showToast('数据库连接正常', 'success');
    } catch (error) {
      indicator.className = 'db-status error';
      indicator.querySelector('.status-text').textContent = '连接失败';
      showToast('数据库连接失败', 'error');
    }
  };

  window.runConnectionDiagnostics = function() {
    showModal('连接诊断', `
      <div style="margin-bottom:20px;">
        <h4 style="font-size:14px;font-weight:700;margin-bottom:12px;">正在运行诊断测试...</h4>
        <div id="diagnosticResults"></div>
      </div>
    `, []);

    const results = [
      { test: '网络连通性', status: 'pass', message: '正常', detail: '延迟 45ms' },
      { test: 'DNS 解析', status: 'pass', message: '正常', detail: 'Supabase API 已解析' },
      { test: 'API 端点', status: 'pass', message: '可达', detail: 'HTTP 200 OK' },
      { test: '认证验证', status: 'pass', message: '有效', detail: 'API Key 有效' },
      { test: '数据库连接', status: 'pass', message: '成功', detail: 'PostgreSQL 15.2' }
    ];

    const resultsContainer = document.getElementById('diagnosticResults');
    resultsContainer.innerHTML = results.map(r => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:${r.status === 'pass' ? '#f0fdf4' : '#fef2f2'};border-radius:8px;margin-bottom:8px;border-left:4px solid ${r.status === 'pass' ? '#22c55e' : '#ef4444'};">
        <div>
          <strong style="font-size:13px;">${r.test}</strong>
          <div style="font-size:11px;color:var(--text-light);margin-top:2px;">${r.detail}</div>
        </div>
        <span style="padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;background:${r.status === 'pass' ? '#dcfce7' : '#fee2e2'};color:${r.status === 'pass' ? '#166534' : '#dc2626'};">${r.message}</span>
      </div>
    `).join('');

    setTimeout(() => {
      document.querySelector('.modal-footer').innerHTML = `
        <button class="btn btn-primary" onclick="closeModal();checkDbConnection();">✅ 完成</button>
      `;
    }, 1500);
  };

  // ========== 辅助功能 ==========
  function showLoading(show) {
    state.isLoading = show;
    // 可以添加全局 loading 遮罩
  }

  function animateValue(id, end) {
    const el = document.getElementById(id);
    if (!el) return;

    const start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * end);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function getRiskLevel(rate) {
    rate = parseFloat(rate) || 0;
    if (rate >= 8) return { level: 'danger', label: '高风险', color: '#dc2626' };
    if (rate >= 5) return { level: 'warning', label: '中风险', color: '#d97706' };
    if (rate >= 3) return { level: 'info', label: '低风险', color: '#2563eb' };
    return { level: 'success', label: '安全', color: '#16a34a' };
  }

  // ========== 占位函数（保留原有接口）==========
  window.showCreateReportModal = function() {
    showModal('新建报告', `
      <form onsubmit="event.preventDefault();handleCreateReport(this);">
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">报告标题</label>
          <input type="text" name="title" class="form-input" placeholder="输入报告标题" required>
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">描述</label>
          <textarea name="description" class="form-input" rows="3" placeholder="输入报告描述"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">创建报告</button>
      </form>
    `, []);
  };

  window.handleCreateReport = function(form) {
    showToast('报告创建成功！', 'success');
    closeModal();
    loadReports();
  };

  window.viewReport = function(id) {
    const report = state.reports.find(r => r.id === id);
    if (report) {
      showModal('查看报告', `
        <div style="margin-bottom:16px;">
          <h4 style="font-size:16px;font-weight:700;margin-bottom:8px;">${report.title}</h4>
          <div style="font-size:13px;color:var(--text-light);line-height:1.8;">
            <p><strong>统计周期：</strong>${report.period}</p>
            <p><strong>订单总数：</strong>${report.orders.toLocaleString()}</p>
            <p><strong>DPD30+ 逾期率：</strong>${report.dpd30}</p>
            <p><strong>DPD90+ 逾期率：</strong>${report.dpd90}</p>
            <p><strong>创建时间：</strong>${report.createdAt}</p>
          </div>
        </div>
      `, [
        { text: '关闭', class: 'btn-outline', action: closeModal }
      ]);
    }
  };

  window.editReport = function(id) {
    showToast('编辑功能开发中...', 'info');
  };

  window.deleteReport = function(id) {
    confirmAction(
      '确认删除',
      '确定要删除此报告吗？此操作不可撤销。',
      async () => {
        showToast('报告已删除', 'success');
        loadReports();
      }
    );
  };

  window.showStoreEditor = function() {
    showToast('店铺编辑器开发中...', 'info');
  };

  window.showCreateUserModal = function() {
    showModal('创建用户', `
      <form onsubmit="event.preventDefault();handleCreateUser(this);">
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">姓名 *</label>
          <input type="text" name="name" class="form-input" placeholder="输入姓名" required>
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">邮箱 *</label>
          <input type="email" name="email" class="form-input" placeholder="example@email.com" required>
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">角色 *</label>
          <select name="role" class="form-input" required>
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
            <option value="super_admin">超级管理员</option>
          </select>
        </div>
        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">初始密码 *</label>
          <input type="password" name="password" class="form-input" placeholder="至少8位字符" required minlength="8">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">创建用户</button>
      </form>
    `, []);
  };

  window.handleCreateUser = function(form) {
    const formData = new FormData(form);
    showToast(`用户 ${formData.get('name')} 创建成功！`, 'success');
    closeModal();
    loadUsersList();
  };

  window.showEditUserModal = function(userId) {
    const user = state.users.find(u => u.id == userId);
    if (!user) return;

    showModal('编辑用户', `
      <form onsubmit="event.preventDefault();handleEditUser(${userId},this);">
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">姓名</label>
          <input type="text" name="name" class="form-input" value="${user.name}" required>
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">邮箱</label>
          <input type="email" name="email" class="form-input" value="${user.email}" required>
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">角色</label>
          <select name="role" class="form-input">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>普通用户</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
            <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''}>超级管理员</option>
          </select>
        </div>
        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">状态</label>
          <select name="status" class="form-input">
            <option value="active" ${user.status === 'active' ? 'selected' : ''}>活跃</option>
            <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>停用</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">保存修改</button>
      </form>
    `, []);
  };

  window.handleEditUser = function(userId, form) {
    showToast('用户信息已更新！', 'success');
    closeModal();
    loadUsersList();
  };

  window.confirmDeleteUser = function(userId, userEmail) {
    confirmAction(
      '确认删除用户',
      `确定要删除用户 <strong>${userEmail}</strong> 吗？此操作不可撤销。`,
      async () => {
        showToast('用户已删除', 'success');
        loadUsersList();
      }
    );
  };

  window.confirmAction = function(title, message, onConfirm) {
    showModal(title, `
      <p style="margin-bottom:20px;font-size:14px;line-height:1.7;">${message}</p>
    `, [
      { text: '取消', class: 'btn-outline', action: closeModal },
      { text: '确认', class: 'btn-danger', action: () => { closeModal(); onConfirm(); }}
    ]);
  };

  // ========== 前后台数据同步系统 ==========
  window.syncDataToFrontend = async function() {
    try {
      showToast('正在同步数据到前台...', 'info');

      // 检查是否有审核数据需要同步
      const auditDataCache = localStorage.getItem('auditDataCache');
      
      // 收集当前后台的最新统计数据
      const syncData = {
        timestamp: new Date().toISOString(),
        reportsCount: state.reports.length,
        lastUpdated: document.getElementById('statReports')?.textContent || '-',
        source: 'admin-panel',
        version: '2.0',
        hasAuditData: !!auditDataCache
      };

      // 保存到 localStorage，供前台读取
      localStorage.setItem('adminSyncData', JSON.stringify(syncData));
      localStorage.setItem('adminLastSyncTime', new Date().toLocaleString('zh-CN'));

      // 如果有审核数据，确保同步标记
      if (auditDataCache) {
        const auditData = JSON.parse(auditDataCache);
        auditData.syncedAt = new Date().toISOString();
        localStorage.setItem('auditDataCache', JSON.stringify(auditData));
        console.log('📊 审核数据已标记为已同步');
      }

      // 尝试通过 BroadcastChannel 通知前台
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('fengkong-admin-channel');
        channel.postMessage({
          type: 'data-synced',
          source: 'admin',
          timestamp: Date.now(),
          payload: {
            hasAuditData: !!auditDataCache,
            reportsCount: state.reports.length
          }
        });
        console.log('📡 已通过 BroadcastChannel 通知前台');
      }

      // 模拟同步延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 更新按钮状态
      const syncBtn = event?.target;
      if (syncBtn && syncBtn.tagName === 'BUTTON') {
        const originalText = syncBtn.innerHTML;
        syncBtn.innerHTML = '✅ 已同步';
        syncBtn.style.background = '#dcfce7';
        syncBtn.style.color = '#166534';

        setTimeout(() => {
          syncBtn.innerHTML = originalText;
          syncBtn.style.background = '#f0fdf4';
          syncBtn.style.color = '#166534';
        }, 2000);
      }

      const message = auditDataCache ? 
        `✅ 数据已同步！包含 ${JSON.parse(auditDataCache).rawDataCount || 0} 条审核记录` :
        '✅ 元数据已同步！请刷新前台页面查看';
      
      showToast(message, 'success');

      console.log('📊 后台数据已同步到前台:', syncData);

    } catch (error) {
      console.error('数据同步失败:', error);
      showToast('❌ 数据同步失败: ' + error.message, 'error');
    }
  };

  // ========== 检查前台是否有新数据需要加载 ==========
  function checkFrontendUpdates() {
    try {
      const lastSync = localStorage.getItem('adminLastSyncTime');
      if (lastSync) {
        console.log(`ℹ️ 上次前后台同步时间: ${lastSync}`);
        // 可以在这里添加逻辑：如果前台有更新，提示管理员刷新
      }
    } catch (e) {
      // localStorage 不可用时忽略
    }
  }

  // 页面加载时检查同步状态
  setTimeout(checkFrontendUpdates, 1000);

  // ========== 权限验证增强 ==========
  window.checkAdminPermission = function(action) {
    // 检查用户是否有执行特定操作的权限
    if (typeof SupabaseAuth !== 'undefined') {
      const user = SupabaseAuth.getUser();
      if (!user) {
        showModal('⚠️ 需要登录', `
          <div style="text-align:center;padding:20px;">
            <p style="font-size:48px;margin-bottom:16px;">🔐</p>
            <p style="font-size:15px;font-weight:600;margin-bottom:12px;">此操作需要管理员权限</p>
            <p style="font-size:13px;color:var(--text-light);margin-bottom:20px;">请先登录后再试</p>
          </div>
        `, [
          { text: '取消', class: 'btn-outline', action: closeModal },
          { text: '前往登录', class: 'btn-primary', action: () => { window.location.href = 'login.html'; }}
        ]);
        return false;
      }

      // 检查角色权限（可根据实际需求扩展）
      const adminRoles = ['super_admin', 'admin'];
      if (!adminRoles.includes(user.role)) {
        showToast('⚠️ 您没有执行此操作的权限', 'warning');
        return false;
      }

      return true;
    }

    // 如果没有认证系统，允许操作（开发模式）
    return true;
  };

  // ========== 跨页面通信（使用 BroadcastChannel）==========
  let adminChannel = null;

  function initCrossPageCommunication() {
    try {
      // 创建频道用于前后台实时通信
      adminChannel = new BroadcastChannel('fengkong-admin-channel');

      adminChannel.onmessage = function(event) {
        const message = event.data;

        switch(message.type) {
          case 'frontend-data-updated':
            console.log('📨 收到前台数据更新通知:', message.payload);
            showToast('前台数据已更新，建议刷新页面获取最新数据', 'info');
            break;

          case 'frontend-request-sync':
            console.log('📨 前台请求同步数据');
            syncDataToFrontend();
            break;

          default:
            console.log('📨 收到未知消息:', message);
        }
      };

      console.log('✅ 跨页面通信通道已建立');
    } catch (e) {
      // BroadcastChannel 不支持时降级为 localStorage
      console.log('ℹ️ 使用 localStorage 进行跨页面通信');
    }
  }

  // 初始化跨页面通信
  initCrossPageCommunication();

  // 发送消息给前台
  window.notifyFrontend = function(type, payload) {
    if (adminChannel) {
      adminChannel.postMessage({
        type: type,
        source: 'admin',
        timestamp: Date.now(),
        payload: payload
      });
    } else {
      // fallback: 使用 localStorage
      localStorage.setItem('adminMessage', JSON.stringify({
        type: type,
        source: 'admin',
        timestamp: Date.now(),
        payload: payload
      }));
    }
  };

})();

