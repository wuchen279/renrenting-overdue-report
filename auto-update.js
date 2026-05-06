var fs = require('fs');
var XLSX = require('xlsx');
var path = require('path');

console.log('=== 审核数据自动更新工具 ===\n');
console.log('📅 当前时间:', new Date().toLocaleString('zh-CN'));
console.log('');

var config = {
  dataDir: 'd:/数据后台搭建',
  inputPattern: '审核数据汇总*.xlsx',
  outputDir: 'd:/数据后台搭建',
  supabaseConfig: {
    url: process.env.SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'
  }
};

function findLatestExcelFile() {
  var files = fs.readdirSync(config.dataDir);
  var excelFiles = files.filter(function(f) {
    return f.match(/审核数据汇总.*\.xlsx$/i);
  }).map(function(f) {
    return {
      name: f,
      path: path.join(config.dataDir, f),
      mtime: fs.statSync(path.join(config.dataDir, f)).mtime
    };
  }).sort(function(a, b) { return b.mtime - a.mtime; });
  
  return excelFiles.length > 0 ? excelFiles[0] : null;
}

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

function processData(rawData) {
  console.log('📊 开始处理', rawData.length, '条记录...\n');

  var processedRecords = [];
  var monthlyMap = {};
  var weeklyMap = {};

  rawData.forEach(function(row, index) {
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

    processedRecords.push({
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
    });

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

  for (var i = 1; i < monthlyData.length; i++) {
    var prev = parseFloat(monthlyData[i-1].pass_rate);
    var curr = parseFloat(monthlyData[i].pass_rate);
    monthlyData[i].mom_order_change = monthlyData[i-1].total_orders > 0 
      ? (((monthlyData[i].total_orders - monthlyData[i-1].total_orders) / monthlyData[i-1].total_orders) * 100).toFixed(2) 
      : null;
    monthlyData[i].mom_pass_rate_change = (curr - prev).toFixed(2);
    monthlyData[i].mom_pass_rate_trend = curr >= prev ? 'up' : 'down';
  }
  if (monthlyData.length > 0) {
    monthlyData[0].mom_order_change = null;
    monthlyData[0].mom_pass_rate_change = null;
    monthlyData[0].mom_pass_rate_trend = null;
  }

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

  for (var j = 1; j < weeklyData.length; j++) {
    var wPrev = parseFloat(weeklyData[j-1].pass_rate);
    var wCurr = parseFloat(weeklyData[j].pass_rate);
    weeklyData[j].wow_order_change = weeklyData[j-1].total_orders > 0
      ? (((weeklyData[j].total_orders - weeklyData[j-1].total_orders) / weeklyData[j-1].total_orders) * 100).toFixed(2)
      : null;
    weeklyData[j].wow_pass_rate_change = (wCurr - wPrev).toFixed(1);
    weeklyData[j].wow_pass_rate_trend = wCurr >= wPrev ? 'up' : 'down';
  }
  if (weeklyData.length > 0) {
    weeklyData[0].wow_order_change = null;
    weeklyData[0].wow_pass_rate_change = null;
    weeklyData[0].wow_pass_rate_trend = null;
  }

  return {
    raw_records: processedRecords,
    monthly_summary: monthlyData,
    weekly_summary: weeklyData
  };
}

async function uploadToSupabase(data) {
  console.log('📤 开始上传到Supabase...\n');

  try {
    var headers = {
      'Content-Type': 'application/json',
      'apikey': config.supabaseConfig.anonKey,
      'Authorization': 'Bearer ' + config.supabaseConfig.anonKey,
      'Prefer': 'resolution=merge-duplicates'
    };

    console.log('  [1/3] 上传原始记录...');
    var rawChunks = [];
    for (var i = 0; i < data.raw_records.length; i += 500) {
      rawChunks.push(data.raw_records.slice(i, i + 500));
    }

    for (var k = 0; k < rawChunks.length; k++) {
      var rawResponse = await fetch(
        config.supabaseConfig.url + '/rest/v1/audit_raw_data',
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(rawChunks[k])
        }
      );

      if (!rawResponse.ok) {
        var errorText = await rawResponse.text();
        throw new Error('上传原始记录失败 (' + (k+1) + '/' + rawChunks.length + '): ' + errorText);
      }
      
      process.stdout.write('\r    进度: ' + Math.min((k+1) * 500, data.raw_records.length) + '/' + data.raw_records.length);
    }
    console.log('\n  ✅ 原始记录上传完成:', data.raw_records.length, '条');

    console.log('  [2/3] 上传月度汇总...');
    for (var m = 0; m < data.monthly_summary.length; m++) {
      var monthlyResponse = await fetch(
        config.supabaseConfig.url + '/rest/v1/audit_monthly_summary',
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data.monthly_summary[m])
        }
      );

      if (!monthlyResponse.ok) {
        var mError = await monthlyResponse.text();
        throw new Error('上传月度汇总失败 (' + data.monthly_summary[m].year + '-' + data.monthly_summary[m].month + '): ' + mError);
      }
    }
    console.log('  ✅ 月度汇总上传完成:', data.monthly_summary.length, '个月份');

    console.log('  [3/3] 上传周度汇总...');
    for (var w = 0; w < data.weekly_summary.length; w++) {
      var weeklyResponse = await fetch(
        config.supabaseConfig.url + '/rest/v1/audit_weekly_summary',
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data.weekly_summary[w])
        }
      );

      if (!weeklyResponse.ok) {
        var wError = await weeklyResponse.text();
        throw new Error('上传周度汇总失败 (' + data.weekly_summary[w].year + '-W' + data.weekly_summary[w].week_number + '): ' + wError);
      }
    }
    console.log('  ✅ 周度汇总上传完成:', data.weekly_summary.length, '周');

    console.log('\n✅ 所有数据上传成功！\n');

    return { success: true };
  } catch (error) {
    console.error('❌ 上传失败:', error.message);
    return { success: false, error: error.message };
  }
}

function generateUpdateReport(processedData, sourceFile) {
  var now = new Date();
  var report = {
    update_time: now.toISOString(),
    source_file: sourceFile,
    summary: {
      total_raw_records: processedData.raw_records.length,
      total_months: processedData.monthly_summary.length,
      total_weeks: processedData.weekly_summary.length,
      overall_pass_rate: processedData.raw_records.length > 0 
        ? ((processedData.raw_records.filter(function(r) { return r.is_passed; }).length / processedData.raw_records.length) * 100).toFixed(2)
        : 0
    },
    latest_month: processedData.monthly_summary.length > 0 
      ? processedData.monthly_summary[processedData.monthly_summary.length - 1]
      : null,
    latest_week: processedData.weekly_summary.length > 0 
      ? processedData.weekly_summary[processedData.weekly_summary.length - 1]
      : null,
    monthly_breakdown: processedData.monthly_summary.map(function(m) {
      return {
        period: m.year + '-' + String(m.month).padStart(2, '0'),
        label: m.month_label,
        total_orders: m.total_orders,
        pass_rate: m.pass_rate,
        mom_change: m.mom_pass_rate_change
      };
    })
  };

  var reportPath = path.join(config.outputDir, 'last-update-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  return report;
}

async function main() {
  console.log('🔍 查找最新的Excel文件...\n');

  var latestFile = findLatestExcelFile();

  if (!latestFile) {
    console.error('❌ 未找到审核数据文件！');
    console.error('   请将文件命名为 "审核数据汇总*.xlsx" 并放置在', config.dataDir);
    process.exit(1);
  }

  console.log('📄 找到文件:', latestFile.name);
  console.log('   路径:', latestFile.path);
  console.log('   最后修改:', latestFile.mtime.toLocaleString('zh-CN'));
  console.log('');

  try {
    console.log('📖 正在读取Excel文件...\n');
    var workbook = XLSX.readFile(latestFile.path);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log('✅ 读取完成！共', rawData.length, '条记录\n');

    if (rawData.length === 0) {
      console.error('❌ Excel文件为空！');
      process.exit(1);
    }

    var processedData = processData(rawData);

    console.log('\n📋 处理结果统计:');
    console.log('   • 原始记录:', processedData.raw_records.length, '条');
    console.log('   • 月度汇总:', processedData.monthly_summary.length, '个月份');
    console.log('   • 周度汇总:', processedData.weekly_summary.length, '周');
    console.log('');

    if (process.argv.includes('--upload') || process.argv.includes('-u')) {
      var uploadResult = await uploadToSupabase(processedData);

      if (!uploadResult.success) {
        console.error('\n⚠️ 上传失败，但本地处理已完成');
        console.error('   错误信息:', uploadResult.error);
      } else {
        console.log('🎉 数据已同步到Supabase数据库！');
      }
    } else {
      console.log('💡 提示: 使用 --upload 或 -u 参数可自动上传到Supabase');
    }

    var report = generateUpdateReport(processedData, latestFile.name);

    console.log('\n📊 更新报告:');
    console.log('   时间范围:', processedData.raw_records[0]?.audit_date, '~', processedData.raw_records[processedData.raw_records.length-1]?.audit_date);
    console.log('   综合通过率:', report.summary.overall_pass_rate + '%');
    
    if (report.latest_month) {
      console.log('   最新月份:', report.latest_month.year + '-' + String(report.latest_month.month).padStart(2, '0'), '|', report.latest_month.total_orders, '单 |', report.latest_month.pass_rate + '%通过率');
    }
    
    if (report.latest_week) {
      console.log('   最新周次:', report.latest_week.year + '-W' + String(report.latest_week.week_number).padStart(2, '0'), '|', report.latest_week.total_orders, '单 |', report.latest_week.pass_rate + '%通过率');
    }

    console.log('\n💾 报告已保存: last-update-report.json');
    console.log('\n✅ 数据更新完成！\n');

  } catch (error) {
    console.error('❌ 处理失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  processData,
  uploadToSupabase,
  generateUpdateReport,
  findLatestExcelFile
};