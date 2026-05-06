
(function(AdminApp) {
  'use strict';

  AdminApp.modules.dashboard = {
    charts: {},

    init: function() {
      console.log('[Dashboard] 初始化模块');
      this.render();
    },

    render: function() {
      this.renderStats();
      this.renderRecentReports();
      this.renderCharts();
    },

    renderStats: function() {
      var statsContainer = document.getElementById('dashboard-stats');
      if (!statsContainer) return;

      var stats = [
        { label: '报告数量', value: AdminApp.utils.formatNumber(AdminApp.state.reports.length), change: '+12%' },
        { label: '总订单数', value: AdminApp.utils.formatNumber(this.calculateTotalOrders()), change: '+8%' },
        { label: '平均DPD30+', value: this.calculateAvgDpd30() + '%', change: '-2%' },
        { label: '活跃店铺', value: AdminApp.utils.formatNumber(AdminApp.state.stores.length), change: '+5%' }
      ];

      statsContainer.innerHTML = '&lt;div class="stats-grid"&gt;' + stats.map(function(s) {
        var changeClass = s.change.startsWith('+') ? 'positive' : 'negative';
        return '&lt;div class="stat-card"&gt;' +
               '&lt;div class="stat-label"&gt;' + s.label + '&lt;/div&gt;' +
               '&lt;div class="stat-value"&gt;' + s.value + '&lt;/div&gt;' +
               '&lt;div class="stat-change ' + changeClass + '"&gt;' + s.change + '&lt;/div&gt;' +
               '&lt;/div&gt;';
      }).join('') + '&lt;/div&gt;';
    },

    calculateTotalOrders: function() {
      return AdminApp.state.reports.reduce(function(total, r) {
        return total + (r.total_orders || 0);
      }, 0);
    },

    calculateAvgDpd30: function() {
      var reports = AdminApp.state.reports;
      if (reports.length === 0) return '0.00';
      var sum = reports.reduce(function(total, r) {
        return total + (parseFloat(r.dpd30_rate) || 0);
      }, 0);
      return (sum / reports.length).toFixed(2);
    },

    renderRecentReports: function() {
      var container = document.getElementById('recent-reports');
      if (!container) return;

      var recentReports = AdminApp.state.reports.slice(0, 5);

      if (recentReports.length === 0) {
        container.innerHTML = this.getEmptyState('暂无报告数据', '上传数据后将显示在这里');
        return;
      }

      container.innerHTML = '&lt;table class="data-table"&gt;' +
        '&lt;thead&gt;&lt;tr&gt;&lt;th&gt;标题&lt;/th&gt;&lt;th&gt;周期&lt;/th&gt;&lt;th&gt;订单数&lt;/th&gt;&lt;th&gt;DPD30+&lt;/th&gt;&lt;th&gt;创建时间&lt;/th&gt;&lt;th&gt;操作&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt;' +
        '&lt;tbody&gt;' + recentReports.map(function(r) {
          var risk = AdminApp.utils.getRiskLevel(r.dpd30_rate);
          return '&lt;tr&gt;' +
                 '&lt;td&gt;&lt;strong&gt;' + (r.title || '未命名') + '&lt;/strong&gt;&lt;/td&gt;' +
                 '&lt;td&gt;' + (r.period || '-') + '&lt;/td&gt;' +
                 '&lt;td&gt;' + AdminApp.utils.formatNumber(r.total_orders) + '&lt;/td&gt;' +
                 '&lt;td&gt;&lt;span class="badge badge-' + risk.level + '"&gt;' + (parseFloat(r.dpd30_rate) || 0).toFixed(2) + '%&lt;/span&gt;&lt;/td&gt;' +
                 '&lt;td&gt;' + AdminApp.utils.formatDate(r.created_at, 'YYYY-MM-DD HH:mm') + '&lt;/td&gt;' +
                 '&lt;td&gt;&lt;button class="btn btn-sm btn-primary" onclick="AdminApp.modules.reports.viewReport(' + r.id + ')"&gt;查看&lt;/button&gt;&lt;/td&gt;' +
                 '&lt;/tr&gt;';
        }).join('') + '&lt;/tbody&gt;&lt;/table&gt;';
    },

    renderCharts: function() {
      var chartContainer = document.getElementById('dashboard-chart');
      if (!chartContainer || typeof Chart === 'undefined') return;

      if (this.charts.main) {
        this.charts.main.destroy();
      }

      var ctx = document.createElement('canvas');
      chartContainer.innerHTML = '';
      chartContainer.appendChild(ctx);

      var monthlyData = AdminApp.state.monthlyData.slice(0, 12);
      var labels = monthlyData.map(function(m) { return m.year + '/' + m.month; });
      var ordersData = monthlyData.map(function(m) { return m.total_orders || 0; });
      var dpd30Data = monthlyData.map(function(m) { return parseFloat(m.dpd30_rate) || 0; });

      if (labels.length === 0) {
        var currentDate = new Date();
        for (var i = 5; i &gt;= 0; i--) {
          var d = new Date(currentDate);
          d.setMonth(d.getMonth() - i);
          labels.push((d.getMonth() + 1) + '月');
          ordersData.push(Math.floor(Math.random() * 1000) + 500);
          dpd30Data.push((Math.random() * 6 + 2).toFixed(2));
        }
      }

      this.charts.main = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: '订单数',
              data: ordersData,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              yAxisID: 'y'
            },
            {
              label: 'DPD30+ (%)',
              data: dpd30Data,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: '订单数' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: 'DPD30+ (%)' },
              grid: { drawOnChartArea: false }
            }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      });
    },

    getEmptyState: function(title, description) {
      return '&lt;div class="empty-state"&gt;' +
             '&lt;div class="empty-icon"&gt;📊&lt;/div&gt;' +
             '&lt;div class="empty-title"&gt;' + title + '&lt;/div&gt;' +
             '&lt;div class="empty-description"&gt;' + description + '&lt;/div&gt;' +
             '&lt;/div&gt;';
    }
  };

})(AdminApp);
