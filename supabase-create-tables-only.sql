-- ============================================
-- Supabase 表结构创建脚本（仅建表，不含数据）
-- 适用于首次初始化数据库
-- ============================================

-- 1. 原始审核记录表 (audit_raw_data)
CREATE TABLE IF NOT EXISTS audit_raw_data (
  id SERIAL PRIMARY KEY,
  audit_date DATE NOT NULL,
  store_name VARCHAR(50) NOT NULL,
  order_id VARCHAR(100),
  is_passed BOOLEAN NOT NULL DEFAULT false,
  device_count INTEGER DEFAULT 1,
  rejection_reason TEXT,
  auditor_name VARCHAR(50),
  month_label VARCHAR(10),
  year_month VARCHAR(7),
  week_number INTEGER,
  year_week VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_raw_date ON audit_raw_data(audit_date);
CREATE INDEX IF NOT EXISTS idx_audit_raw_store ON audit_raw_data(store_name);
CREATE INDEX IF NOT EXISTS idx_audit_raw_auditor ON audit_raw_data(auditor_name);
CREATE INDEX IF NOT EXISTS idx_audit_raw_year_month ON audit_raw_data(year_month);

-- 2. 月度汇总表 (audit_monthly_summary)
CREATE TABLE IF NOT EXISTS audit_monthly_summary (
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  month_label VARCHAR(10),
  total_orders INTEGER DEFAULT 0,
  passed_orders INTEGER DEFAULT 0,
  rejected_orders INTEGER DEFAULT 0,
  pass_rate DECIMAL(5,2),
  reject_rate DECIMAL(5,2),
  avg_devices DECIMAL(5,1),
  jt_orders INTEGER DEFAULT 0,
  jt_pass_rate DECIMAL(5,2),
  ls_orders INTEGER DEFAULT 0,
  ls_pass_rate DECIMAL(5,2),
  lh_orders INTEGER DEFAULT 0,
  lh_pass_rate DECIMAL(5,2),
  djd_orders INTEGER DEFAULT 0,
  djd_pass_rate DECIMAL(5,2),
  mom_order_change DECIMAL(6,2),
  mom_pass_rate_change DECIMAL(5,2),
  mom_pass_rate_trend VARCHAR(4),
  top_rejection_reasons JSONB,
  auditor_stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (year, month)
);

CREATE INDEX IF NOT EXISTS idx_audit_monthly_year_month ON audit_monthly_summary(year, month);

-- 3. 周度汇总表 (audit_weekly_summary)
CREATE TABLE IF NOT EXISTS audit_weekly_summary (
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  week_start_date DATE,
  week_end_date DATE,
  total_orders INTEGER DEFAULT 0,
  passed_orders INTEGER DEFAULT 0,
  rejected_orders INTEGER DEFAULT 0,
  pass_rate DECIMAL(5,1),
  reject_rate DECIMAL(5,1),
  jt_orders INTEGER DEFAULT 0,
  jt_pass_rate DECIMAL(5,1),
  ls_orders INTEGER DEFAULT 0,
  ls_pass_rate DECIMAL(5,1),
  lh_orders INTEGER DEFAULT 0,
  lh_pass_rate DECIMAL(5,1),
  wow_order_change DECIMAL(6,2),
  wow_pass_rate_change DECIMAL(5,1),
  wow_pass_rate_trend VARCHAR(4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (year, week_number)
);

CREATE INDEX IF NOT EXISTS idx_audit_weekly_year_week ON audit_weekly_summary(year, week_number);
CREATE INDEX IF NOT EXISTS idx_audit_weekly_start_date ON audit_weekly_summary(week_start_date);

-- 验证表是否创建成功
SELECT 
  tablename as "表名",
  tableowner as "所有者",
  hasindexes as "有索引",
  rowsecurity as "行安全"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('audit_raw_data', 'audit_monthly_summary', 'audit_weekly_summary')
ORDER BY tablename;

-- 显示结果提示
SELECT 
  '✅ 数据库表结构创建完成！' AS status,
  '共创建 3 张表: audit_raw_data, audit_monthly_summary, audit_weekly_summary' AS message,
  NOW() AS created_at;
