
(function(AdminApp) {
  'use strict';

  AdminApp.modules.monthly = {
    chart: null,

    init: function() {
      console.log('[Monthly] 初始化模块');
      this.render();
    },

    render: function() {
      this.renderMonthlyData();
      this.renderChart();
    },

    renderMonthlyData: function() {
      var container = document.getElementById('monthly-container');
      if (!container) return;

      var data = AdminApp.state.monthlyData;

      if (data.length === 0) {
        container.innerHTML = this.getEmptyState();
        return;
      }

      var sortedData = data.slice().sort(function(a, b) {
        var dateA = (a.year || 0) * 12 + (a.month || 0);
        var dateB = (b.year || 0) * 12 + (b.month || 0);
        return dateB - dateA;
      });

      container.innerHTML = '&lt;div class="card"&gt;' +
        '&lt;div class="card-header"&gt;' +
        '&lt;h3 class="card-title"&gt;月度趋势数据&lt;/h3&gt;' +
        '&lt;/div&gt;' +
        '&lt;div class="card-body"&gt;' +
        '&lt;div id="monthly-chart" class="data-viz" style="margin-bottom: 32px;"&gt;&lt;/div&gt;' +
        '&lt;div style="overflow-x: auto;"&gt;' +
        '&lt;table class="data-table"&gt;' +
        '&lt;thead&gt;&lt;tr&gt;' +
        '&lt;th&gt;周期&lt;/th&gt;' +
        '&lt;th&gt;订单数&lt;/th&gt;' +
        '&lt;th&gt;DPD30+ (%)&lt;/th&gt;' +
        '&lt;th&gt;DPD90+ (%)&lt;/th&gt;' +
        '&lt;/tr&gt;&lt;/thead&gt;' +
        '&lt;tbody&gt;' + sortedData.map(function(m) {
          var risk = AdminApp.utils.getRiskLevel(m.dpd30_rate);
          return '&lt;tr&gt;' +
                 '&lt;td&gt;&lt;strong&gt;' + (m.year || '-') + '年' + (m.month || '-') + '月&lt;/strong&gt;&lt;/td&gt;' +
                 '&lt;td&gt;' + AdminApp.utils.formatNumber(m.total_orders) + '&lt;/td&gt;' +
                 '&lt;td&gt;&lt;span class="badge badge-' + risk.level + '"&gt;' + (parseFloat(m.dpd30_rate) || 0).toFixed(2) + '%&lt;/span&gt;&lt;/td&gt;' +
                 '&lt;td&gt;' + (parseFloat(m.dpd90_rate) || 0).toFixed(2) + '%&lt;/td&gt;' +
                 '&lt;/tr&gt;';
        }).join('') + '&lt;/tbody&gt;' +
        '&lt;/table&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;' +
        '&lt;/div&gt;';
    },

    renderChart: function() {
      var chartContainer = document.getElementById('monthly-chart');
      if (!chartContainer || typeof Chart === 'undefined') return;

      if (this.chart) {
        this.chart.destroy();
      }

      var ctx = document.createElement('canvas');
      chartContainer.innerHTML = '';
      chartContainer.appendChild(ctx);

      var data = AdminApp.state.monthlyData.slice().sort(function(a, b) {
        var dateA = (a.year || 0) * 12 + (a.month || 0);
        var dateB = (b.year || 0) * 12 + (b.month || 0);
        return dateA - dateB;
      });

      var labels = data.map(function(m) { return (m.year || 2026) + '/' + (m.month || 1); });
      var ordersData = data.map(function(m) { return m.total_orders || 0; });
      var dpd30Data = data.map(function(m) { return parseFloat(m.dpd30_rate) || 0; });

      if (labels.length === 0) {
        var currentDate = new Date();
        for (var i = 11; i &gt;= 0; i--) {
          var d = new Date(currentDate);
          d.setMonth(d.getMonth() - i);
          labels.push(d.getFullYear() + '/' + (d.getMonth() + 1));
          ordersData.push(Math.floor(Math.random() * 5000) + 1000);
          dpd30Data.push((Math.random() * 8 + 2).toFixed(2));
        }
      }

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: '订单数',
              data: ordersData,
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: '#3b82f6',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'DPD30+ (%)',
              data: dpd30Data,
              type: 'line',
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
              title: { display: true, text: '订单数' },
              beginAtZero: true
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: 'DPD30+ (%)' },
              min: 0,
              max: 15,
              grid: { drawOnChartArea: false }
            }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      });
    },

    getEmptyState: function() {
      return '&lt;div class="empty-state"&gt;' +
             '&lt;div class="empty-icon"&gt;📅&lt;/div&gt;' +
             '&lt;div class="empty-title"&gt;暂无月度数据&lt;/div&gt;' +
             '&lt;div class="empty-description"&gt;上传数据后将显示月度趋势&lt;/div&gt;' +
             '&lt;button class="btn btn-primary" onclick="AdminApp.switchModule(\'upload\')"&gt;去上传数据&lt;/button&gt;' +
             '&lt;/div&gt;';
    }
  };

})(AdminApp);
