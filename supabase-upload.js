var fs = require('fs');

console.log('=== Supabase 数据库批量上传工具 ===\n');

try {
  var dataPath = 'd:/数据后台搭建/supabase-upload-data.json';
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ 错误: 数据文件不存在');
    process.exit(1);
  }

  var uploadData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  console.log('📊 加载数据文件成功\n');
  console.log('📋 元数据:');
  console.log('   源文件:', uploadData.metadata.source_file);
  console.log('   总记录数:', uploadData.metadata.total_records);
  console.log('   时间范围:', uploadData.metadata.date_range.start, '~', uploadData.metadata.date_range.end);

  function escapeSQL(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/'/g, "''");
  }

  function buildRawInsert() {
    var lines = [];
    lines.push('\n-- 插入原始审核记录 (' + uploadData.tables.audit_raw_data.length + ' 条)');
    lines.push('INSERT INTO audit_raw_data (id, audit_date, store_name, order_id, is_passed, device_count, rejection_reason, auditor_name, month_label, year_month, week_number, year_week, created_at) VALUES');
    
    var values = [];
    for (var i = 0; i < uploadData.tables.audit_raw_data.length; i++) {
      var r = uploadData.tables.audit_raw_data[i];
      var v = '(' + r.id;
      v += ",'" + escapeSQL(r.audit_date) + "'";
      v += ",'" + escapeSQL(r.store_name) + "'";
      v += ",'" + escapeSQL(r.order_id) + "'";
      v += ',' + (r.is_passed ? 'true' : 'false');
      v += ',' + r.device_count;
      v += ",'" + escapeSQL(r.rejection_reason) + "'";
      v += ",'" + escapeSQL(r.auditor_name) + "'";
      v += ",'" + escapeSQL(r.month_label) + "'";
      v += ",'" + escapeSQL(r.year_month) + "'";
      v += ',' + r.week_number;
      v += ",'" + escapeSQL(r.year_week) + "', NOW())";
      
      values.push(v);
    }
    
    lines.push(values.join(',\n') + ';');
    lines.push('\nON CONFLICT (id) DO UPDATE SET');
    lines.push('  audit_date = EXCLUDED.audit_date,');
    lines.push('  store_name = EXCLUDED.store_name,');
    lines.push('  order_id = EXCLUDED.order_id,');
    lines.push('  is_passed = EXCLUDED.is_passed,');
    lines.push('  device_count = EXCLUDED.device_count,');
    lines.push('  rejection_reason = EXCLUDED.rejection_reason,');
    lines.push('  auditor_name = EXCLUDED.auditor_name,');
    lines.push('  month_label = EXCLUDED.month_label,');
    lines.push('  year_month = EXCLUDED.year_month,');
    lines.push('  week_number = EXCLUDED.week_number,');
    lines.push('  year_week = EXCLUDED.year_week,');
    lines.push('  updated_at = NOW();');
    
    return lines.join('\n');
  }

  function buildMonthlyInsert() {
    var lines = [];
    lines.push('\n-- 插入月度汇总数据 (' + uploadData.tables.audit_monthly_summary.length + ' 条)');
    lines.push('INSERT INTO audit_monthly_summary (year, month, month_label, total_orders, passed_orders, rejected_orders, pass_rate, reject_rate, avg_devices, jt_orders, jt_pass_rate, ls_orders, ls_pass_rate, lh_orders, lh_pass_rate, djd_orders, djd_pass_rate, mom_order_change, mom_pass_rate_change, mom_pass_rate_trend, top_rejection_reasons, auditor_stats, created_at, updated_at) VALUES');
    
    var values = [];
    for (var j = 0; j < uploadData.tables.audit_monthly_summary.length; j++) {
      var m = uploadData.tables.audit_monthly_summary[j];
      var v = '(' + m.year + ',' + m.month;
      v += ",'" + escapeSQL(m.month_label) + "'";
      v += ',' + m.total_orders;
      v += ',' + m.passed_orders;
      v += ',' + m.rejected_orders;
      v += ',' + m.pass_rate;
      v += ',' + m.reject_rate;
      v += ',' + m.avg_devices;
      v += ',' + m.jt_orders;
      v += ',' + m.jt_pass_rate;
      v += ',' + m.ls_orders;
      v += ',' + m.ls_pass_rate;
      v += ',' + m.lh_orders;
      v += ',' + m.lh_pass_rate;
      v += ',' + m.djd_orders;
      v += ',' + m.djd_pass_rate;
      v += ',' + (m.mom_order_change || 'NULL');
      v += ',' + (m.mom_pass_rate_change || 'NULL');
      v += ",'" + escapeSQL(m.mom_pass_rate_trend || '') + "'";
      v += ",'" + escapeSQL(JSON.stringify(m.top_rejection_reasons)) + "'";
      v += ",'" + escapeSQL(JSON.stringify(m.auditor_stats)) + "'";
      v += ', NOW(), NOW())';
      
      values.push(v);
    }
    
    lines.push(values.join(',\n') + ';');
    lines.push('\nON CONFLICT (year, month) DO UPDATE SET');
    lines.push('  total_orders = EXCLUDED.total_orders,');
    lines.push('  passed_orders = EXCLUDED.passed_orders,');
    lines.push('  rejected_orders = EXCLUDED.rejected_orders,');
    lines.push('  pass_rate = EXCLUDED.pass_rate,');
    lines.push('  reject_rate = EXCLUDED.reject_rate,');
    lines.push('  avg_devices = EXCLUDED.avg_devices,');
    lines.push('  jt_orders = EXCLUDED.jt_orders,');
    lines.push('  ls_orders = EXCLUDED.ls_orders,');
    lines.push('  lh_orders = EXCLUDED.lh_orders,');
    lines.push('  djd_orders = EXCLUDED.djd_orders,');
    lines.push('  mom_order_change = EXCLUDED.mom_order_change,');
    lines.push('  mom_pass_rate_change = EXCLUDED.mom_pass_rate_change,');
    lines.push('  top_rejection_reasons = EXCLUDED.top_rejection_reasons,');
    lines.push('  auditor_stats = EXCLUDED.auditor_stats,');
    lines.push('  updated_at = NOW();');
    
    return lines.join('\n');
  }

  function buildWeeklyInsert() {
    var lines = [];
    lines.push('\n-- 插入周度汇总数据 (' + uploadData.tables.audit_weekly_summary.length + ' 条)');
    lines.push('INSERT INTO audit_weekly_summary (year, week_number, week_start_date, week_end_date, total_orders, passed_orders, rejected_orders, pass_rate, reject_rate, jt_orders, jt_pass_rate, ls_orders, ls_pass_rate, lh_orders, lh_pass_rate, wow_order_change, wow_pass_rate_change, wow_pass_rate_trend, created_at, updated_at) VALUES');
    
    var values = [];
    for (var k = 0; k < uploadData.tables.audit_weekly_summary.length; k++) {
      var w = uploadData.tables.audit_weekly_summary[k];
      var v = '(' + w.year + ',' + w.week_number;
      v += ",'" + escapeSQL(w.week_start_date) + "'";
      v += ",'" + escapeSQL(w.week_end_date) + "'";
      v += ',' + w.total_orders;
      v += ',' + w.passed_orders;
      v += ',' + w.rejected_orders;
      v += ',' + w.pass_rate;
      v += ',' + w.reject_rate;
      v += ',' + w.jt_orders;
      v += ',' + w.jt_pass_rate;
      v += ',' + w.ls_orders;
      v += ',' + w.ls_pass_rate;
      v += ',' + w.lh_orders;
      v += ',' + w.lh_pass_rate;
      v += ',' + (w.wow_order_change || 'NULL');
      v += ',' + (w.wow_pass_rate_change || 'NULL');
      v += ",'" + escapeSQL(w.wow_pass_rate_trend || '') + "'";
      v += ', NOW(), NOW())';
      
      values.push(v);
    }
    
    lines.push(values.join(',\n') + ';');
    lines.push('\nON CONFLICT (year, week_number) DO UPDATE SET');
    lines.push('  week_start_date = EXCLUDED.week_start_date,');
    lines.push('  week_end_date = EXCLUDED.week_end_date,');
    lines.push('  total_orders = EXCLUDED.total_orders,');
    lines.push('  passed_orders = EXCLUDED.passed_orders,');
    lines.push('  rejected_orders = EXCLUDED.rejected_orders,');
    lines.push('  pass_rate = EXCLUDED.pass_rate,');
    lines.push('  reject_rate = EXCLUDED.reject_rate,');
    lines.push('  jt_orders = EXCLUDED.jt_orders,');
    lines.push('  ls_orders = EXCLUDED.ls_orders,');
    lines.push('  lh_orders = EXCLUDED.lh_orders,');
    lines.push('  wow_order_change = EXCLUDED.wow_order_change,');
    lines.push('  wow_pass_rate_change = EXCLUDED.wow_pass_rate_change,');
    lines.push('  updated_at = NOW();');
    
    return lines.join('\n');
  }

  var createTables = [
    '-- ============================================',
    '-- Supabase 表结构创建脚本',
    '-- 生成时间: ' + new Date().toISOString(),
    '-- ============================================',
    '',
    '-- 1. 原始审核记录表 (audit_raw_data)',
    'CREATE TABLE IF NOT EXISTS audit_raw_data (',
    '  id SERIAL PRIMARY KEY,',
    '  audit_date DATE NOT NULL,',
    '  store_name VARCHAR(50) NOT NULL,',
    '  order_id VARCHAR(100),',
    '  is_passed BOOLEAN NOT NULL DEFAULT false,',
    '  device_count INTEGER DEFAULT 1,',
    '  rejection_reason TEXT,',
    '  auditor_name VARCHAR(50),',
    '  month_label VARCHAR(10),',
    '  year_month VARCHAR(7),',
    '  week_number INTEGER,',
    '  year_week VARCHAR(10),',
    '  created_at TIMESTAMPTZ DEFAULT NOW(),',
    '  updated_at TIMESTAMPTZ DEFAULT NOW()',
    ');',
    '',
    'CREATE INDEX IF NOT EXISTS idx_audit_raw_date ON audit_raw_data(audit_date);',
    'CREATE INDEX IF NOT EXISTS idx_audit_raw_store ON audit_raw_data(store_name);',
    'CREATE INDEX IF NOT EXISTS idx_audit_raw_auditor ON audit_raw_data(auditor_name);',
    'CREATE INDEX IF NOT EXISTS idx_audit_raw_year_month ON audit_raw_data(year_month);',
    '',
    '-- 2. 月度汇总表 (audit_monthly_summary)',
    'CREATE TABLE IF NOT EXISTS audit_monthly_summary (',
    '  year INTEGER NOT NULL,',
    '  month INTEGER NOT NULL,',
    '  month_label VARCHAR(10),',
    '  total_orders INTEGER DEFAULT 0,',
    '  passed_orders INTEGER DEFAULT 0,',
    '  rejected_orders INTEGER DEFAULT 0,',
    '  pass_rate DECIMAL(5,2),',
    '  reject_rate DECIMAL(5,2),',
    '  avg_devices DECIMAL(5,1),',
    '  jt_orders INTEGER DEFAULT 0,',
    '  jt_pass_rate DECIMAL(5,2),',
    '  ls_orders INTEGER DEFAULT 0,',
    '  ls_pass_rate DECIMAL(5,2),',
    '  lh_orders INTEGER DEFAULT 0,',
    '  lh_pass_rate DECIMAL(5,2),',
    '  djd_orders INTEGER DEFAULT 0,',
    '  djd_pass_rate DECIMAL(5,2),',
    '  mom_order_change DECIMAL(6,2),',
    '  mom_pass_rate_change DECIMAL(5,2),',
    '  mom_pass_rate_trend VARCHAR(4),',
    '  top_rejection_reasons JSONB,',
    '  auditor_stats JSONB,',
    '  created_at TIMESTAMPTZ DEFAULT NOW(),',
    '  updated_at TIMESTAMPTZ DEFAULT NOW(),',
    '  PRIMARY KEY (year, month)',
    ');',
    '',
    'CREATE INDEX IF NOT EXISTS idx_audit_monthly_year_month ON audit_monthly_summary(year, month);',
    '',
    '-- 3. 周度汇总表 (audit_weekly_summary)',
    'CREATE TABLE IF NOT EXISTS audit_weekly_summary (',
    '  year INTEGER NOT NULL,',
    '  week_number INTEGER NOT NULL,',
    '  week_start_date DATE,',
    '  week_end_date DATE,',
    '  total_orders INTEGER DEFAULT 0,',
    '  passed_orders INTEGER DEFAULT 0,',
    '  rejected_orders INTEGER DEFAULT 0,',
    '  pass_rate DECIMAL(5,1),',
    '  reject_rate DECIMAL(5,1),',
    '  jt_orders INTEGER DEFAULT 0,',
    '  jt_pass_rate DECIMAL(5,1),',
    '  ls_orders INTEGER DEFAULT 0,',
    '  ls_pass_rate DECIMAL(5,1),',
    '  lh_orders INTEGER DEFAULT 0,',
    '  lh_pass_rate DECIMAL(5,1),',
    '  wow_order_change DECIMAL(6,2),',
    '  wow_pass_rate_change DECIMAL(5,1),',
    '  wow_pass_rate_trend VARCHAR(4),',
    '  created_at TIMESTAMPTZ DEFAULT NOW(),',
    '  updated_at TIMESTAMPTZ DEFAULT NOW(),',
    '  PRIMARY KEY (year, week_number)',
    ');',
    '',
    'CREATE INDEX IF NOT EXISTS idx_audit_weekly_year_week ON audit_weekly_summary(year, week_number);',
    'CREATE INDEX IF NOT EXISTS idx_audit_weekly_start_date ON audit_weekly_summary(week_start_date);'
  ].join('\n');

  var fullSQL = createTables + '\n' + buildRawInsert() + '\n' + buildMonthlyInsert() + '\n' + buildWeeklyInsert();
  
  var sqlFilePath = 'd:/数据后台搭建/supabase-init.sql';
  fs.writeFileSync(sqlFilePath, fullSQL, 'utf8');

  console.log('\n✅ SQL脚本生成完成！');
  console.log('\n📄 文件路径:', sqlFilePath);
  console.log('\n📋 脚本内容包含:');
  console.log('   ✅ 创建3个数据库表（含索引）');
  console.log('   ✅ 插入原始审核记录（', uploadData.tables.audit_raw_data.length, '条）');
  console.log('   ✅ 插入月度汇总数据（', uploadData.tables.audit_monthly_summary.length, '条）');
  console.log('   ✅ 插入周度汇总数据（', uploadData.tables.audit_weekly_summary.length, '条）');
  console.log('   ✅ 支持UPSERT操作（冲突时自动更新）');

} catch (error) {
  console.error('❌ 处理失败:', error.message);
  console.error(error.stack);
}