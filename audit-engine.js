/**
 * 审核数据分析引擎 V3.0 - audit-engine.js
 * 功能升级：
 * ✅ Excel解析与智能数据验证
 * ✅ 多维度环比计算（月度/周度/季度）
 * ✅ 趋势预测与异常检测
 * ✅ 智能分析与建议生成
 * ✅ 审核员绩效评估
 * ✅ 增量数据更新支持
 */

var AuditEngine = {
  CONFIG: {
    REQUIRED_COLUMNS: ['时间', '店铺', '订单号', '是否通过', '台数'],
    STORE_NAMES: ['箭头', '驴上', '雷猴', '懂机帝'],
    PASS_THRESHOLD: 85,
    HIGH_RISK_THRESHOLD: 80,
    MIN_ORDERS_FOR_ANALYSIS: 50,
    TREND_WINDOW: 3,
    WARNING_THRESHOLD: 5,
    IMPROVEMENT_TARGET: 2,
    ANOMALY_DETECTION: true,
    MOVING_AVERAGE_WINDOW: 3
  },

  parseExcel: async function(file) {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var data = new Uint8Array(e.target.result);
          var workbook = XLSX.read(data, { type: 'array' });
          var firstSheetName = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[firstSheetName];
          var jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            resolve({ success: false, data: [], errors: ['Excel文件为空'] });
            return;
          }
          
          var validation = AuditEngine.validateData(jsonData);
          resolve({
            success: validation.errors.length === 0,
            data: jsonData,
            errors: validation.errors,
            warnings: validation.warnings,
            stats: validation.stats
          });
        } catch (error) {
          console.error('[AuditEngine] Excel解析错误:', error);
          resolve({ success: false, data: [], errors: ['文件解析失败：' + error.message] });
        }
      };
      reader.onerror = function() {
        resolve({ success: false, data: [], errors: ['文件读取失败'] });
      };
      reader.readAsArrayBuffer(file);
    });
  },

  validateData: function(data) {
    var errors = [];
    var warnings = [];
    
    if (!data || data.length === 0) {
      errors.push('没有可用的数据');
      return { errors, warnings, stats: null };
    }
    
    var columns = Object.keys(data[0]);
    this.CONFIG.REQUIRED_COLUMNS.forEach(function(col) {
      if (!columns.includes(col)) {
        errors.push('缺少必需列：' + col);
      }
    });
    
    if (errors.length > 0) return { errors, warnings, stats: null };
    
    var validRows = 0, invalidRows = 0;
    var stores = new Set(), months = new Set(), orderIds = new Set();
    
    data.forEach(function(row, index) {
      var rowNum = index + 2;
      
      if (!row['时间']) { warnings.push('第' + rowNum + '行：日期为空'); invalidRows++; return; }
      
      var date = new Date(row['时间']);
      if (isNaN(date.getTime())) { errors.push('第' + rowNum + '行：日期格式无效'); invalidRows++; return; }
      
      months.add(date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0'));
      
      if (!row['店铺'] || !this.CONFIG.STORE_NAMES.includes(row['店铺'])) {
        warnings.push('第' + rowNum + '行：未知店铺 "' + (row['店铺'] || '') + '"');
      } else {
        stores.add(row['店铺']);
      }
      
      if (row['是否通过'] !== '是' && row['是否通过'] !== '否') {
        warnings.push('第' + rowNum + '行："是否通过"字段值异常');
        invalidRows++;
        return;
      }
      
      if (row['订单号']) {
        if (orderIds.has(row['订单号'])) {
          warnings.push('第' + rowNum + '行：重复订单号 ' + row['订单号']);
        } else {
          orderIds.add(row['订单号']);
        }
      }
      
      validRows++;
    }.bind(this));
    
    return {
      errors, warnings,
      stats: {
        totalRows: data.length,
        validRows: validRows,
        invalidRows: invalidRows,
        uniqueOrders: orderIds.size,
        uniqueStores: Array.from(stores),
        uniqueMonths: Array.from(months).sort(),
        dataQuality: {
          completeness: ((validRows / data.length) * 100).toFixed(1) + '%',
          uniqueness: ((orderIds.size / data.length) * 100).toFixed(1) + '%'
        }
      }
    };
  },

  processData: function(rawData) {
    console.time('[AuditEngine] processData');
    
    var processedData = rawData.map(function(row) {
      var date = new Date(row['时间']);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var weekNumber = getISOWeek(date);
      var quarter = Math.ceil(month / 3);
      
      return {
        auditDate: date.toISOString().split('T')[0],
        storeName: row['店铺'],
        orderId: row['订单号'],
        isPassed: row['是否通过'] === '是',
        deviceCount: parseInt(row['台数']) || 1,
        rejectionReason: row['拒绝原因'] || null,
        auditorName: row['审核人员'] || null,
        monthLabel: month + '月',
        weekNumber: weekNumber,
        yearMonth: year + '-' + String(month).padStart(2, '0'),
        yearWeek: year + '-W' + String(weekNumber).padStart(2, '0'),
        yearQuarter: year + '-Q' + quarter,
        year: year, month: month, quarter: quarter
      };
    });
    
    var monthlySummary = this.generateMonthlySummary(processedData);
    var weeklySummary = this.generateWeeklySummary(processedData);
    
    this.calculateMoM(monthlySummary);
    this.calculateWoW(weeklySummary);
    
    var trendAnalysis = this.analyzeTrends(monthlySummary);
    var anomalies = this.detectAnomalies(monthlySummary, weeklySummary);
    var predictions = this.generatePredictions(monthlySummary, trendAnalysis);
    var analysisReports = this.generateComprehensiveAnalysis(monthlySummary, weeklySummary, trendAnalysis, anomalies, predictions);
    var auditorPerformance = this.analyzeAuditorPerformance(processedData);
    
    console.timeEnd('[AuditEngine] processData');
    
    return {
      rawData: processedData,
      monthlySummary: monthlySummary,
      weeklySummary: weeklySummary,
      trendAnalysis: trendAnalysis,
      anomalies: anomalies,
      predictions: predictions,
      analysisReports: analysisReports,
      auditorPerformance: auditorPerformance,
      summary: this.generateOverallSummary(monthlySummary, weeklySummary)
    };
  },

  generateMonthlySummary: function(data) {
    var monthlyMap = {};
    
    data.forEach(function(row) {
      var key = row.yearMonth;
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          year: row.year, month: row.month,
          monthLabel: row.year + '年' + String(row.month).padStart(2, '0') + '月',
          totalOrders: 0, passedOrders: 0, rejectedOrders: 0, totalDevices: 0,
          stores: {}, rejectionReasons: {}, auditors: {}
        };
      }
      
      var summary = monthlyMap[key];
      summary.totalOrders++;
      summary.totalDevices += row.deviceCount;
      
      if (row.isPassed) {
        summary.passedOrders++;
      } else {
        summary.rejectedOrders++;
        if (row.rejectionReason) {
          summary.rejectionReasons[row.rejectionReason] = (summary.rejectionReasons[row.rejectionReason] || 0) + 1;
        }
      }
      
      if (!summary.stores[row.storeName]) {
        summary.stores[row.storeName] = { orders: 0, passed: 0 };
      }
      summary.stores[row.storeName].orders++;
      if (row.isPassed) summary.stores[row.storeName].passed++;
      
      if (row.auditorName) {
        if (!summary.auditors[row.auditorName]) {
          summary.auditors[row.auditorName] = { total: 0, passed: 0 };
        }
        summary.auditors[row.auditorName].total++;
        if (row.isPassed) summary.auditors[row.auditorName].passed++;
      }
    });
    
    return Object.values(monthlyMap).map(function(m) {
      m.passRate = m.totalOrders > 0 ? (m.passedOrders / m.totalOrders * 100).toFixed(2) : '0';
      m.rejectRate = m.totalOrders > 0 ? (m.rejectedOrders / m.totalOrders * 100).toFixed(2) : '0';
      m.avgDevices = m.totalOrders > 0 ? (m.totalDevices / m.totalOrders).toFixed(1) : '0';
      
      ['箭头', '驴上', '雷猴', '懂机帝'].forEach((store, i) => {
        var prefixes = ['jt', 'ls', 'lh', 'djd'];
        var prefix = prefixes[i];
        m[prefix + 'Orders'] = m.stores[store] ? m.stores[store].orders : 0;
        m[prefix + 'PassRate'] = m.stores[store] && m.stores[store].orders > 0 
          ? (m.stores[store].passed / m.stores[store].orders * 100).toFixed(2) : '0';
      });
      
      m.topRejectionReasons = Object.entries(m.rejectionReasons)
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([reason, count]) => ({ reason, count, percentage: (count / m.rejectedOrders * 100).toFixed(1) }));
      
      m.auditorStats = Object.entries(m.auditors)
        .map(([name, stats]) => ({
          name, total: stats.total, passed: stats.passed,
          passRate: (stats.passed / stats.total * 100).toFixed(2)
        })).sort((a, b) => parseFloat(b.passRate) - parseFloat(a.passRate));
      
      delete m.stores; delete m.rejectionReasons; delete m.auditors;
      return m;
    }).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  },

  generateWeeklySummary: function(data) {
    var weeklyMap = {};
    
    data.forEach(function(row) {
      var key = row.yearWeek;
      if (!weeklyMap[key]) {
        weeklyMap[key] = {
          year: row.year, weekNumber: row.weekNumber,
          weekStartDate: getWeekStartDate(row.auditDate),
          weekEndDate: getWeekEndDate(row.auditDate),
          totalOrders: 0, passedOrders: 0, rejectedOrders: 0, totalDevices: 0,
          stores: {}
        };
      }
      
      var summary = weeklyMap[key];
      summary.totalOrders++;
      summary.totalDevices += row.deviceCount;
      if (row.isPassed) summary.passedOrders++; else summary.rejectedOrders++;
      
      if (!summary.stores[row.storeName]) {
        summary.stores[row.storeName] = { orders: 0, passed: 0 };
      }
      summary.stores[row.storeName].orders++;
      if (row.isPassed) summary.stores[row.storeName].passed++;
    });
    
    return Object.values(weeklyMap).map(function(w) {
      w.passRate = w.totalOrders > 0 ? (w.passedOrders / w.totalOrders * 100).toFixed(2) : '0';
      w.rejectRate = w.totalOrders > 0 ? (w.rejectedOrders / w.totalOrders * 100).toFixed(2) : '0';
      
      ['箭头', '驴上', '雷猴'].forEach((store, i) => {
        var prefixes = ['jt', 'ls', 'lh'];
        w[prefixes[i] + 'Orders'] = w.stores[store] ? w.stores[store].orders : 0;
        w[prefixes[i] + 'PassRate'] = w.stores[store] && w.stores[store].orders > 0 
          ? (w.stores[store].passed / w.stores[store].orders * 100).toFixed(2) : '0';
      });
      
      delete w.stores;
      return w;
    }).sort((a, b) => a.year !== b.year ? a.year - b.year : a.weekNumber - b.weekNumber);
  },

  calculateMoM: function(monthlyData) {
    for (var i = 1; i < monthlyData.length; i++) {
      var current = monthlyData[i], previous = monthlyData[i-1];
      
      if (previous.totalOrders > 0) {
        current.momOrderChange = (((current.totalOrders - previous.totalOrders) / previous.totalOrders * 100)).toFixed(2);
        current.momOrderTrend = parseFloat(current.momOrderChange) >= 0 ? 'up' : 'down';
      }
      
      if (previous.passRate > 0) {
        current.momPassRateChange = (parseFloat(current.passRate) - parseFloat(previous.passRate)).toFixed(2);
        current.momPassRateTrend = parseFloat(current.momPassRateChange) >= 0 ? 'up' : 'down';
      }
      
      ['jt', 'ls', 'lh', 'djd'].forEach(prefix => {
        var curr = parseFloat(current[prefix+'PassRate']), prev = parseFloat(previous[prefix+'PassRate']);
        if (prev > 0 && curr > 0) {
          current[prefix+'MomChange'] = (curr - prev).toFixed(2);
        }
      });
      
      if (i >= 2) {
        var rates3m = [parseFloat(monthlyData[i-2].passRate), parseFloat(monthlyData[i-1].passRate), parseFloat(current.passRate)];
        current.ma3mPassRate = (rates3m.reduce((a,b) => a+b, 0) / 3).toFixed(2);
      }
    }
    
    if (monthlyData.length > 0) {
      monthlyData[0].momOrderChange = null;
      monthlyData[0].momPassRateChange = null;
      monthlyData[0].ma3mPassRate = monthlyData[0].passRate;
    }
  },

  calculateWoW: function(weeklyData) {
    for (var i = 1; i < weeklyData.length; i++) {
      var current = weeklyData[i], previous = weeklyData[i-1];
      
      if (previous.totalOrders > 0) {
        current.wowOrderChange = (((current.totalOrders - previous.totalOrders) / previous.totalOrders * 100)).toFixed(2);
        current.wowOrderTrend = parseFloat(current.wowOrderChange) >= 0 ? 'up' : 'down';
      }
      
      if (previous.passRate > 0) {
        current.wowPassRateChange = (parseFloat(current.passRate) - parseFloat(previous.passRate)).toFixed(2);
        current.wowPassRateTrend = parseFloat(current.wowPassRateChange) >= 0 ? 'up' : 'down';
      }
      
      if (i >= 3) {
        var rates4w = [parseFloat(weeklyData[i-3].passRate), parseFloat(weeklyData[i-2].passRate), 
                      parseFloat(weeklyData[i-1].passRate), parseFloat(current.passRate)];
        current.ma4wPassRate = (rates4w.reduce((a,b) => a+b, 0) / 4).toFixed(2);
      }
    }
    
    if (weeklyData.length > 0) {
      weeklyData[0].wowOrderChange = null;
      weeklyData[0].wowPassRateChange = null;
      weeklyData[0].ma4wPassRate = weeklyData[0].passRate;
    }
  },

  detectAnomalies: function(monthlyData, weeklyData) {
    var anomalies = [];
    if (monthlyData.length < 3) return anomalies;
    
    var rates = monthlyData.map(m => parseFloat(m.passRate));
    var mean = rates.reduce((a,b) => a+b, 0) / rates.length;
    var stdDev = Math.sqrt(rates.reduce((sum, r) => sum + Math.pow(r-mean, 2), 0) / rates.length);
    
    monthlyData.forEach(function(month) {
      var rate = parseFloat(month.passRate);
      var zScore = stdDev > 0 ? ((rate - mean) / stdDev) : 0;
      
      if (Math.abs(zScore) > 2) {
        anomalies.push({
          type: 'monthly',
          period: month.monthLabel,
          metric: '通过率',
          value: rate,
          expected: mean.toFixed(2),
          zScore: zScore.toFixed(2),
          severity: Math.abs(zScore) > 3 ? 'critical' : 'warning',
          description: zScore > 0 
            ? '通过率异常偏高（' + rate + '%），需检查是否存在标准放松'
            : '通过率异常偏低（' + rate + '%），需排查原因'
        });
      }
    });
    
    return anomalies.sort((a,b) => {
      var order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  },

  generatePredictions: function(monthlyData, trendAnalysis) {
    if (monthData.length < 3) {
      return { available: false, reason: '历史数据不足' };
    }
    
    var lastRate = parseFloat(monthlyData[monthlyData.length-1].passRate);
    var recentRates = monthlyData.slice(-3).map(m => parseFloat(m.passRate));
    var weights = [0.2, 0.3, 0.5];
    var weightedPrediction = 0;
    recentRates.reverse().forEach((rate, i) => { weightedPrediction += rate * weights[i]; });
    
    var variance = recentRates.reduce((sum, r) => sum + Math.pow(r - weightedPrediction, 2), 0) / recentRates.length;
    var confidenceInterval = 1.96 * Math.sqrt(variance);
    
    return {
      available: true,
      nextMonth: {
        predictedRate: Math.max(70, Math.min(99, weightedPrediction)).toFixed(2),
        lowerBound: Math.max(70, weightedPrediction - confidenceInterval).toFixed(2),
        upperBound: Math.min(99, weightedPrediction + confidenceInterval).toFixed(2)
      },
      confidence: monthlyData.length >= 6 ? 'high' : 'medium'
    };
  },

  analyzeAuditorPerformance: function(processedData) {
    var auditorMap = {};
    
    processedData.forEach(function(row) {
      if (!row.auditorName) return;
      
      if (!auditorMap[row.auditorName]) {
        auditorMap[row.auditorName] = {
          name: row.auditorName,
          totalOrders: 0, passedOrders: 0, rejectedOrders: 0, totalDevices: 0
        };
      }
      
      var auditor = auditorMap[row.auditorName];
      auditor.totalOrders++;
      auditor.totalDevices += row.deviceCount;
      if (row.isPassed) auditor.passedOrders++; else auditor.rejectedOrders++;
    });
    
    return Object.values(auditorMap).map(function(a) {
      a.passRate = a.totalOrders > 0 ? (a.passedOrders / a.totalOrders * 100).toFixed(2) : '0';
      a.avgDevices = a.totalOrders > 0 ? (a.totalDevices / a.totalOrders).toFixed(1) : '0';
      return a;
    }).sort((a, b) => parseFloat(b.passRate) - parseFloat(a.passRate));
  },

  analyzeTrends: function(monthlyData) {
    if (monthlyData.length < 2) return { shortTerm: null, mediumTerm: null, forecast: null };
    
    var latest3 = monthlyData.slice(-3);
    var shortTermRates = latest3.map(m => parseFloat(m.passRate));
    var shortTermSlope = this.calculateSlope(shortTermRates);
    var shortTermAvg = shortTermRates.reduce((a,b) => a+b, 0) / shortTermRates.length;
    
    var allRates = monthlyData.map(m => parseFloat(m.passRate));
    var mediumTermSlope = this.calculateSlope(allRates);
    var mediumTermAvg = allRates.reduce((a,b) => a+b, 0) / allRates.length;
    
    var shortTermTrend = shortTermSlope > this.CONFIG.IMPROVEMENT_TARGET ? 'strong_up' :
                         shortTermSlope > 0 ? 'up' :
                         shortTermSlope < -this.CONFIG.WARNING_THRESHOLD ? 'strong_down' :
                         shortTermSlope < 0 ? 'down' : 'stable';
    
    return {
      shortTerm: {
        slope: shortTermSlope.toFixed(2),
        average: shortTermAvg.toFixed(2),
        trend: shortTermTrend,
        description: this.getTrendDescription(shortTermTrend, '短期')
      },
      mediumTerm: {
        slope: mediumTermSlope.toFixed(2),
        average: mediumTermAvg.toFixed(2),
        trend: mediumTermSlope > this.CONFIG.IMPROVEMENT_TARGET ? 'strong_up' :
               mediumTermSlope > 0 ? 'up' :
               mediumTermSlope < -this.CONFIG.WARNING_THRESHOLD ? 'strong_down' :
               mediumTermSlope < 0 ? 'down' : 'stable',
        description: this.getTrendDescription(
          mediumTermSlope > this.CONFIG.IMPROVEMENT_TARGET ? 'strong_up' :
          mediumTermSlope > 0 ? 'up' :
          mediumTermSlope < -this.CONFIG.WARNING_THRESHOLD ? 'strong_down' :
          mediumTermSlope < 0 ? 'down' : 'stable', '中期')
      },
      forecast: {
        nextMonthRate: monthlyData.length >= 2 
          ? Math.max(70, Math.min(99, parseFloat(monthlyData[monthlyData.length-1].passRate) + mediumTermSlope)).toFixed(2)
          : null,
        confidence: monthlyData.length >= 4 ? 'high' : monthlyData.length >= 2 ? 'medium' : 'low'
      }
    };
  },

  calculateSlope: function(values) {
    if (values.length < 2) return 0;
    var n = values.length, sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (var i = 0; i < n; i++) {
      sumX += i; sumY += values[i]; sumXY += i * values[i]; sumX2 += i * i;
    }
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  },

  getTrendDescription: function(trend, period) {
    var descriptions = {
      strong_up: period + '呈现强劲上升趋势，表现优异',
      up: period + '稳步上升，持续改善',
      stable: period + '保持稳定，波动较小',
      down: period + '略有下降，需关注',
      strong_down: period + '明显下滑，需立即干预'
    };
    return descriptions[trend] || '数据不足，无法判断';
  },

  generateComprehensiveAnalysis: function(monthlyData, weeklyData, trendAnalysis, anomalies, predictions) {
    var reports = [];
    
    if (monthlyData.length > 0) {
      var latestMonth = monthlyData[monthlyData.length-1];
      var prevMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length-2] : null;
      
      reports.push({
        type: 'monthly_comprehensive',
        period: latestMonth.monthLabel,
        timestamp: new Date().toISOString(),
        
        executiveSummary: this.generateExecutiveSummary(latestMonth, prevMonth, trendAnalysis, predictions),
        kpiMetrics: this.extractKPIMetrics(latestMonth, prevMonth),
        storeAnalysis: this.analyzeStorePerformance(latestMonth, monthlyData),
        riskAssessment: this.assessRisks(latestMonth, trendAnalysis, anomalies),
        recommendations: this.generateRecommendations(latestMonth, trendAnalysis, monthlyData, anomalies),
        actionItems: this.generateActionItems(latestMonth, trendAnalysis),
        anomalyAlerts: anomalies.filter(a => a.type === 'monthly'),
        prediction: predictions.available ? predictions.nextMonth : null
      });
    }
    
    if (weeklyData.length > 0) {
      var recentWeeks = weeklyData.slice(-4);
      var latestWeek = weeklyData[weeklyData.length-1];
      
      reports.push({
        type: 'weekly_snapshot',
        period: latestWeek.year + '年第' + latestWeek.weekNumber + '周',
        timestamp: new Date().toISOString(),
        recentPerformance: recentWeeks.map(w => ({
          week: w.year + 'W' + String(w.weekNumber).padStart(2, '0'),
          orders: w.totalOrders, passRate: w.passRate,
          change: w.wowPassRateChange, trend: w.wowPassRateTrend
        })),
        weekOverWeek: this.analyzeWeeklyTrend(recentWeeks),
        quickInsights: this.generateWeeklyInsights(recentWeeks)
      });
    }
    
    return reports;
  },

  generateExecutiveSummary: function(current, previous, trends, predictions) {
    var parts = [];
    parts.push(current.monthLabel + '共处理 ' + current.totalOrders + ' 单，整体通过率 ' + current.passRate + '%');
    
    if (previous && current.momPassRateChange) {
      var change = parseFloat(current.momPassRateChange);
      parts.push('较上月' + (change >= 0 ? '提升' : '下降') + Math.abs(change).toFixed(2) + ' 个百分点');
    }
    
    if (trends?.shortTerm) parts.push(trends.shortTerm.description);
    
    var targetStatus = parseFloat(current.passRate) >= this.CONFIG.PASS_THRESHOLD ? '✅ 已达标' : '⚠️ 未达标';
    parts.push('目标达成状态：' + targetStatus + '（目标 ' + this.CONFIG.PASS_THRESHOLD + '%）');
    
    if (predictions?.available) {
      parts.push('📊 下月预测通过率：' + predictions.nextMonth.predictedRate + '%');
    }
    
    return parts.join('。');
  },

  extractKPIMetrics: function(current, previous) {
    return {
      totalOrders: current.totalOrders,
      passRate: parseFloat(current.passRate),
      rejectRate: parseFloat(current.rejectRate),
      momOrderChange: current.momOrderChange ? parseFloat(current.momOrderChange) : null,
      momPassRateChange: current.momPassRateChange ? parseFloat(current.momPassRateChange) : null,
      targetAchieved: parseFloat(current.passRate) >= this.CONFIG.PASS_THRESHOLD,
      gapToTarget: (this.CONFIG.PASS_THRESHOLD - parseFloat(current.passRate)).toFixed(2),
      ma3mRate: current.ma3mPassRate ? parseFloat(current.ma3mPassRate) : null
    };
  },

  analyzeStorePerformance: function(current, history) {
    var stores = [
      { code: 'jt', name: '箭头', orders: current.jtOrders, rate: current.jtPassRate, mom: current.jtMomChange },
      { code: 'ls', name: '驴上', orders: current.lsOrders, rate: current.lsPassRate, mom: current.lsMomChange },
      { code: 'lh', name: '雷猴', orders: current.lhOrders, rate: current.lhPassRate, mom: current.lhMomChange },
      { code: 'djd', name: '懂机帝', orders: current.djdOrders, rate: current.djdPassRate, mom: current.djdMomChange }
    ].filter(s => s.orders > 0).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
    
    var best = stores[0], worst = stores[stores.length-1];
    var avgRate = stores.reduce((sum, s) => sum + parseFloat(s.rate), 0) / stores.length;
    
    return {
      ranking: stores.map((s, i) => ({
        rank: i+1, name: s.name, orders: s.orders,
        passRate: parseFloat(s.rate), momChange: s.mom ? parseFloat(s.mom) : null,
        performance: this.getPerformanceRating(parseFloat(s.rate))
      })),
      best: best ? { name: best.name, rate: parseFloat(best.rate) } : null,
      worst: worst ? { name: worst.name, rate: parseFloat(worst.rate) } : null,
      gap: best && worst ? (parseFloat(best.rate) - parseFloat(worst.rate)).toFixed(2) : null
    };
  },

  getPerformanceRating: function(rate) {
    if (rate >= 90) return { level: 'excellent', label: '优秀', color: '#16a34a', icon: '🌟' };
    if (rate >= 85) return { level: 'good', label: '良好', color: '#22c55e', icon: '✅' };
    if (rate >= 80) return { level: 'acceptable', label: '合格', color: '#eab308', icon: '⚠️' };
    if (rate >= 75) return { level: 'warning', label: '警告', color: '#f97316', icon: '🔶' };
    return { level: 'critical', label: '危险', color: '#dc2626', icon: '❌' };
  },

  assessRisks: function(current, trends, anomalies) {
    var risks = [];
    var overallRiskLevel = 'low';
    
    if (parseFloat(current.passRate) < this.CONFIG.HIGH_RISK_THRESHOLD) {
      risks.push({ type: 'critical', category: '整体通过率', impact: 'high', probability: 'high',
        description: '整体通过率仅 ' + current.passRate + '%，低于高风险阈值', suggestion: '立即启动全面审查流程优化' });
      overallRiskLevel = 'critical';
    } else if (parseFloat(current.passRate) < this.CONFIG.PASS_THRESHOLD) {
      risks.push({ type: 'warning', category: '整体通过率', impact: 'medium', probability: 'medium',
        description: '整体通过率未达目标线', suggestion: '加强重点环节监控' });
      overallRiskLevel = 'warning';
    }
    
    if (trends?.shortTerm?.trend === 'strong_down') {
      risks.push({ type: 'warning', category: '趋势恶化', impact: 'high', probability: 'high',
        description: '短期呈现明显下滑趋势', suggestion: '及时调整策略' });
      if (overallRiskLevel !== 'critical') overallRiskLevel = 'warning';
    }
    
    var storeGap = this.getStoreGap(current);
    if (storeGap > 15) {
      risks.push({ type: 'info', category: '店铺差异', impact: 'medium', probability: 'high',
        description: '最佳与最差店铺差距达 ' + storeGap + 'pp', suggestion: '开展跨店经验分享' });
    }
    
    anomalies.filter(a => a.severity === 'critical').forEach(anomaly => {
      risks.push({ type: 'critical', category: '数据异常', impact: 'high', probability: 'high',
        description: anomaly.description, suggestion: '立即核实数据准确性' });
      overallRiskLevel = 'critical';
    });
    
    return {
      level: overallRiskLevel,
      score: this.calculateRiskScore(risks),
      items: risks,
      summary: this.generateRiskSummary(risks, overallRiskLevel)
    };
  },

  getStoreGap: function(current) {
    var rates = [current.jtPassRate, current.lsPassRate, current.lhPassRate, current.djdPassRate]
      .filter(r => r && r !== '0').map(parseFloat);
    return rates.length < 2 ? 0 : Math.max(...rates) - Math.min(...rates);
  },

  calculateRiskScore: function(risks) {
    if (risks.length === 0) return 0;
    var score = 0;
    risks.forEach(risk => {
      var weight = risk.type === 'critical' ? 30 : risk.type === 'warning' ? 20 : 10;
      score += weight * (risk.impact === 'high' ? 1.5 : 1);
    });
    return Math.min(100, Math.round(score));
  },

  generateRiskSummary: function(risks, level) {
    var labels = { low: '低风险', medium: '中风险', warning: '需关注', critical: '高风险' };
    return { level: labels[level], actionRequired: level === 'critical' || level === 'warning' };
  },

  generateRecommendations: function(current, trends, history, anomalies) {
    var recommendations = [];
    
    if (parseFloat(current.passRate) < this.CONFIG.PASS_THRESHOLD) {
      recommendations.push({
        id: 'imm_001', priority: 'critical', category: '紧急改进',
        title: '提升整体通过率至目标线',
        description: '当前通过率 ' + current.passRate + '%，距离目标相差 ' + 
                   (this.CONFIG.PASS_THRESHOLD - parseFloat(current.passRate)).toFixed(2) + 'pp',
        actions: ['审查审核标准一致性', '加强培训考核', '分析高频拒绝原因'],
        expectedImpact: '预计提升 2-5pp', timeline: '1-2周', effort: 'high'
      });
    }
    
    if (trends?.shortTerm?.trend === 'down' || trends?.shortTerm?.trend === 'strong_down') {
      recommendations.push({
        id: 'trend_001', priority: 'high', category: '趋势扭转',
        title: '遏制下滑趋势', description: '近期通过率呈下滑态势',
        actions: ['召开专项会议', '检查政策变更', '加强实时监控'],
        expectedImpact: '稳住水平逐步回升', timeline: '2-4周', effort: 'medium'
      });
    }
    
    var storeGap = this.getStoreGap(current);
    if (storeGap > 10) {
      recommendations.push({
        id: 'balance_001', priority: 'medium', category: '均衡发展',
        title: '缩小店铺间差异', description: '最大差距 ' + storeGap + 'pp',
        actions: ['组织经验分享会', '建立标准化流程', '实施交叉培训'],
        expectedImpact: '缩小差距 3-5pp', timeline: '1-2个月', effort: 'medium'
      });
    }
    
    if (current.topRejectionReasons.length > 0) {
      var topReason = current.topRejectionReasons[0];
      recommendations.push({
        id: 'reject_001', priority: 'medium', category: '精准优化',
        title: '优化"' + topReason.reason + '"类审核',
        description: '该原因导致 ' + topReason.count + ' 单被拒',
        actions: ['分析用户特征画像', '优化前置筛选规则', '考虑调整标准'],
        expectedImpact: '减少误拒率', timeline: '2-4周', effort: 'low'
      });
    }
    
    return recommendations.sort((a, b) => {
      var order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });
  },

  generateActionItems: function(current, trends) {
    return [
      {
        timeframe: '本周', urgency: 'high',
        tasks: [
          { task: '完成本月数据复盘会议', owner: '风控负责人', status: 'pending', dueDate: this.getDueDate(3) },
          { task: '更新下月审核重点清单', owner: '审核团队', status: 'pending', dueDate: this.getDueDate(5) }
        ]
      },
      ...(parseFloat(current.passRate) < this.CONFIG.PASS_THRESHOLD ? [{
        timeframe: '2周内', urgency: 'high',
        tasks: [
          { task: '实施针对性培训方案', owner: '培训部门', status: 'planned', dueDate: this.getDueDate(14) },
          { task: '完成审核流程优化文档', owner: '流程优化组', status: 'planned', dueDate: this.getDueDate(10) }
        ]
      }] : []),
      {
        timeframe: '1个月内', urgency: 'medium',
        tasks: [
          { task: '建立自动化监控仪表盘', owner: '技术团队', status: 'planned', dueDate: this.getDueDate(30) },
          { task: '完成季度效果评估报告', owner: '数据分析组', status: 'planned', dueDate: this.getDueDate(30) }
        ]
      }
    ];
  },

  getDueDate: function(daysFromNow) {
    var date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  },

  analyzeWeeklyTrend: function(recentWeeks) {
    if (recentWeeks.length < 2) return { trend: 'insufficient_data', description: '数据不足' };
    
    var changes = recentWeeks.slice(1).map((w, i) => parseFloat(w.wowPassRateChange || 0));
    var avgChange = changes.reduce((a,b) => a+b, 0) / changes.length;
    var volatility = Math.sqrt(changes.reduce((sum, c) => sum + Math.pow(c-avgChange, 2), 0) / changes.length);
    
    var trend = avgChange > 1 ? 'improving' : avgChange < -1 ? 'declining' : 'stable';
    var stability = volatility < 2 ? 'very_stable' : volatility < 5 ? 'stable' : 'volatile';
    
    return { trend, stability, averageChange: avgChange.toFixed(2), volatility: volatility.toFixed(2),
             description: this.getWeeklyTrendDescription(trend, stability) };
  },

  getWeeklyTrendDescription: function(trend, stability) {
    var descriptions = {
      improving_very_stable: '稳步上升，表现稳定',
      improving_stable: '总体向好，小幅波动',
      stable_very_stable: '保持平稳',
      declining_very_stable: '持续下滑，需警惕',
      declining_stable: '略有下降'
    };
    return descriptions[trend + '_' + stability] || '数据不足';
  },

  generateWeeklyInsights: function(recentWeeks) {
    var insights = [];
    
    if (recentWeeks.length >= 2) {
      var latest = recentWeeks[recentWeeks.length-1];
      if (latest.wowPassRateChange) {
        var change = parseFloat(latest.wowPassRateChange);
        insights.push({ type: change >= 0 ? 'positive' : 'negative',
          text: '本周较上周' + (change >= 0 ? '提升' : '下降') + Math.abs(change).toFixed(2) + 'pp' });
      }
    }
    
    var avgRate = recentWeeks.reduce((sum, w) => sum + parseFloat(w.passRate), 0) / recentWeeks.length;
    insights.push({ type: avgRate >= this.CONFIG.PASS_THRESHOLD ? 'positive' : 'warning',
      text: '近4周平均通过率 ' + avgRate.toFixed(2) + '%' });
    
    return insights;
  },

  generateOverallSummary: function(monthlyData, weeklyData) {
    var totalOrders = monthlyData.reduce((sum, m) => sum + m.totalOrders, 0);
    var totalPassed = monthlyData.reduce((sum, m) => sum + m.passedOrders, 0);
    var lastMonth = monthlyData[monthlyData.length-1];
    
    return {
      period: { start: monthlyData[0].monthLabel, end: lastMonth.monthLabel, months: monthlyData.length },
      totals: { orders: totalOrders, passed: totalPassed, passRate: (totalPassed/totalOrders*100).toFixed(2) },
      latest: { month: lastMonth.monthLabel, orders: lastMonth.totalOrders, passRate: lastMonth.passRate, momChange: lastMonth.momPassRateChange }
    };
  },

  uploadToDatabase: async function(processedData) {
    try {
      for (var month of processedData.monthlySummary) {
        await SupabaseClient.upsert('audit_monthly_summary', {
          year: month.year, month: month.month, month_label: month.monthLabel,
          total_orders: month.totalOrders, passed_orders: month.passedOrders,
          rejected_orders: month.rejectedOrders, pass_rate: parseFloat(month.passRate),
          reject_rate: parseFloat(month.rejectRate), avg_devices: parseFloat(month.avgDevices),
          jt_orders: month.jtOrders, jt_pass_rate: parseFloat(month.jtPassRate),
          ls_orders: month.lsOrders, ls_pass_rate: parseFloat(month.lsPassRate),
          lh_orders: month.lhOrders, lh_pass_rate: parseFloat(month.lhPassRate),
          djd_orders: month.djdOrders, djd_pass_rate: parseFloat(month.djdPassRate),
          mom_order_change: month.momOrderChange ? parseFloat(month.momOrderChange) : null,
          mom_pass_rate_change: month.momPassRateChange ? parseFloat(month.momPassRateChange) : null,
          ma_3m_pass_rate: month.ma3mPassRate ? parseFloat(month.ma3mPassRate) : null,
          top_rejection_reasons: JSON.stringify(month.topRejectionReasons),
          auditor_stats: JSON.stringify(month.auditorStats),
          updated_at: new Date().toISOString()
        }, ['year', 'month']);
      }
      
      for (var week of processedData.weeklySummary) {
        await SupabaseClient.upsert('audit_weekly_summary', {
          year: week.year, week_number: week.weekNumber,
          week_start_date: week.weekStartDate, week_end_date: week.weekEndDate,
          total_orders: week.totalOrders, passed_orders: week.passedOrders,
          rejected_orders: week.rejectedOrders, pass_rate: parseFloat(week.passRate),
          wow_order_change: week.wowOrderChange ? parseFloat(week.wowOrderChange) : null,
          wow_pass_rate_change: week.wowPassRateChange ? parseFloat(week.wowPassRateChange) : null
        }, ['year', 'week_number']);
      }
      
      for (var report of processedData.analysisReports) {
        await SupabaseClient.upsert('audit_analysis_reports', {
          report_type: report.type, period: report.period,
          report_date: new Date().toISOString().split('T')[0],
          executive_summary: report.executiveSummary,
          kpi_metrics: JSON.stringify(report.kpiMetrics),
          store_analysis: JSON.stringify(report.storeAnalysis),
          risk_assessment: JSON.stringify(report.riskAssessment),
          actionable_recommendations: JSON.stringify(report.recommendations),
          action_items: JSON.stringify(report.actionItems),
          priority_level: report.riskAssessment?.level || 'medium',
          status: 'published', generated_by: 'system-auto-v3'
        }, ['report_type', 'period']);
      }
      
      console.log('[AuditEngine] 数据上传成功');
      return { success: true, message: '数据上传完成' };
    } catch (error) {
      console.error('[AuditEngine] 数据上传失败:', error);
      return { success: false, message: '上传失败：' + error.message };
    }
  },

  loadDataFromDB: async function() {
    try {
      var [monthlyResult, weeklyResult, reportsResult] = await Promise.all([
        SupabaseClient.select('audit_monthly_summary', '*', 'year ASC, month ASC', 12),
        SupabaseClient.select('audit_weekly_summary', '*', 'year ASC, week_number ASC', 12),
        SupabaseClient.select('audit_analysis_reports', '*', 'created_at DESC', 6)
      ]);
      
      return {
        success: true,
        monthlyData: monthlyResult.data || [],
        weeklyData: weeklyResult.data || [],
        reports: (reportsResult.data || []).map(r => ({
          ...r,
          kpi_metrics: typeof r.kpi_metrics === 'string' ? JSON.parse(r.kpi_metrics) : r.kpi_metrics,
          store_analysis: typeof r.store_analysis === 'string' ? JSON.parse(r.store_analysis) : r.store_analysis,
          risk_assessment: typeof r.risk_assessment === 'string' ? JSON.parse(r.risk_assessment) : r.risk_assessment,
          actionable_recommendations: typeof r.actionable_recommendations === 'string' ? JSON.parse(r.actionable_recommendations) : r.actionable_recommendations,
          action_items: typeof r.action_items === 'string' ? JSON.parse(r.action_items) : r.action_items
        }))
      };
    } catch (error) {
      console.error('[AuditEngine] 加载数据失败:', error);
      return { success: false, message: error.message };
    }
  },

  exportReport: function(processedData) {
    var exportData = {
      exportTime: new Date().toISOString(),
      version: '3.0',
      summary: processedData.summary,
      monthlyData: processedData.monthlySummary,
      weeklyData: processedData.weeklySummary.slice(-8),
      trendAnalysis: processedData.trendAnalysis,
      reports: processedData.analysisReports
    };
    
    var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '审核数据分析报告_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

function getISOWeek(date) {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekStartDate(dateStr) {
  var date = new Date(dateStr);
  var day = date.getDay();
  var diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

function getWeekEndDate(dateStr) {
  var startDate = new Date(getWeekStartDate(dateStr));
  startDate.setDate(startDate.getDate() + 6);
  return startDate.toISOString().split('T')[0];
}
