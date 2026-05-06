-- 审核数据分析模块 - Supabase 数据库表结构
-- 执行方式: 在 Supabase Dashboard → SQL Editor 中运行
-- 注意: 此脚本会先删除已存在的审核相关表

DROP TABLE IF EXISTS audit_analysis_reports CASCADE;
DROP TABLE IF EXISTS audit_monthly_summary CASCADE;
DROP TABLE IF EXISTS audit_weekly_summary CASCADE;
DROP TABLE IF EXISTS audit_raw_data CASCADE;

-- 1. 原始审核数据表（每条订单记录）
CREATE TABLE audit_raw_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_batch_id UUID,  -- 关联上传批次
  audit_date DATE NOT NULL,           -- 审核日期
  store_name TEXT NOT NULL,           -- 店铺名称
  order_id TEXT NOT NULL,             -- 订单号
  is_passed BOOLEAN NOT NULL DEFAULT false,  -- 是否通过
  device_count INTEGER DEFAULT 1,     -- 台数
  rejection_reason TEXT,              -- 拒绝原因
  auditor_name TEXT,                  -- 审核人员
  month_label TEXT,                   -- 月份标签（如"1月"、"2月"）
  week_number INTEGER,               -- 周数（ISO周数）
  year_month TEXT,                    -- 年月（如"2026-01"）
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 周度汇总统计表
CREATE TABLE audit_weekly_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  -- 总体统计
  total_orders INTEGER DEFAULT 0,
  passed_orders INTEGER DEFAULT 0,
  rejected_orders INTEGER DEFAULT 0,
  pass_rate NUMERIC(5,2) DEFAULT 0,
  total_devices INTEGER DEFAULT 0,
  
  -- 箭头店铺统计
  jt_orders INTEGER DEFAULT 0,
  jt_passed INTEGER DEFAULT 0,
  jt_pass_rate NUMERIC(5,2) DEFAULT 0,
  
  -- 驴上店铺统计
  ls_orders INTEGER DEFAULT 0,
  ls_passed INTEGER DEFAULT 0,
  ls_pass_rate NUMERIC(5,2) DEFAULT 0,
  
  -- 雷猴店铺统计
  lh_orders INTEGER DEFAULT 0,
  lh_passed INTEGER DEFAULT 0,
  lh_pass_rate NUMERIC(5,2) DEFAULT 0,
  
  -- 环比数据（与上周对比）
  wow_order_change NUMERIC(5,2),     -- 订单量周环比(%)
  wow_pass_rate_change NUMERIC(5,2), -- 通过率周环比(%)
  
  UNIQUE(year, week_number)
);

-- 3. 月度汇总统计表
CREATE TABLE audit_monthly_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  month_label TEXT,                  -- 如"2026年01月"
  
  -- 总体统计
  total_orders INTEGER DEFAULT 0,
  passed_orders INTEGER DEFAULT 0,
  rejected_orders INTEGER DEFAULT 0,
  pass_rate NUMERIC(5,2) DEFAULT 0,
  total_devices INTEGER DEFAULT 0,
  
  -- 各店铺统计
  jt_orders INTEGER DEFAULT 0,
  jt_pass_rate NUMERIC(5,2) DEFAULT 0,
  ls_orders INTEGER DEFAULT 0,
  ls_pass_rate NUMERIC(5,2) DEFAULT 0,
  lh_orders INTEGER DEFAULT 0,
  lh_pass_rate NUMERIC(5,2) DEFAULT 0,
  
  -- 环比数据（与上月对比）
  mom_order_change NUMERIC(5,2),     -- 订单量月环比(%)
  mom_pass_rate_change NUMERIC(5,2), -- 通过率月环比(%)
  
  -- 拒绝原因分布（JSON格式）
  top_rejection_reasons JSONB,       -- TOP10拒绝原因及数量
  
  -- 分析建议
  analysis_summary TEXT,             -- AI生成的分析摘要
  recommendations JSONB,            -- 改进建议列表
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(year, month)
);

-- 4. 分析报告表
CREATE TABLE audit_analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'quarterly')),
  period TEXT NOT NULL,              -- 报告周期（如"2026年第15周"、"2026年04月"）
  report_date DATE NOT NULL,         -- 报告日期
  
  -- 核心指标
  total_orders INTEGER DEFAULT 0,
  overall_pass_rate NUMERIC(5,2) DEFAULT 0,
  previous_period_rate NUMERIC(5,2),
  rate_change NUMERIC(5,2),
  
  -- 关键发现
  key_findings JSONB,                -- 关键发现列表
  risk_alerts JSONB,                 -- 风险预警
  improvement_areas JSONB,          -- 改进领域
  
  -- 详细分析
  trend_analysis TEXT,               -- 趋势分析文本
  store_comparison TEXT,             -- 店铺对比分析
  auditor_performance TEXT,          -- 审核员绩效分析
  
  -- 建议
  actionable_recommendations JSONB,  -- 可执行的建议
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  
  -- 元数据
  data_source TEXT,                  -- 数据来源文件名
  generated_by TEXT DEFAULT 'system', -- 生成方式
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用 RLS (Row Level Security)
ALTER TABLE audit_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_weekly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_analysis_reports ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取和写入
CREATE POLICY "Allow anon read audit_raw" ON audit_raw_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert audit_raw" ON audit_raw_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read weekly" ON audit_weekly_summary FOR SELECT USING (true);
CREATE POLICY "Allow anon insert weekly" ON audit_weekly_summary FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update weekly" ON audit_weekly_summary FOR UPDATE USING (true);
CREATE POLICY "Allow anon read monthly" ON audit_monthly_summary FOR SELECT USING (true);
CREATE POLICY "Allow anon insert monthly" ON audit_monthly_summary FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update monthly" ON audit_monthly_summary FOR UPDATE USING (true);
CREATE POLICY "Allow anon read reports" ON audit_analysis_reports FOR SELECT USING (true);
CREATE POLICY "Allow anon insert reports" ON audit_analysis_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update reports" ON audit_analysis_reports FOR UPDATE USING (true);

-- 创建索引优化查询性能
CREATE INDEX idx_audit_raw_date ON audit_raw_data(audit_date DESC);
CREATE INDEX idx_audit_raw_store ON audit_raw_data(store_name);
CREATE INDEX idx_audit_raw_ym ON audit_raw_data(year_month);
CREATE INDEX idx_audit_weekly_period ON audit_weekly_summary(year, week_number);
CREATE INDEX idx_audit_monthly_period ON audit_monthly_summary(year, month);
CREATE INDEX idx_audit_reports_type ON audit_analysis_reports(report_type, period);
CREATE INDEX idx_audit_reports_status ON audit_analysis_reports(status);

-- 插入初始月度数据（基于Excel分析结果）
INSERT INTO audit_monthly_summary (year, month, month_label, total_orders, passed_orders, rejected_orders, pass_rate, total_devices, 
                                   jt_orders, jt_pass_rate, ls_orders, ls_pass_rate, lh_orders, lh_pass_rate,
                                   mom_order_change, mom_pass_rate_change, analysis_summary)
VALUES 
  (2026, 1, '2026年01月', 680, 605, 75, 88.97, 1893, 354, 89.83, 196, 86.22, 130, 87.69, NULL, NULL, 
   '1月份整体通过率较高，达到88.97%。箭头店铺表现最佳（89.83%），驴上店铺相对较低（86.22%）。本月订单量受春节假期影响较小，整体运营平稳。'),
   
  (2026, 2, '2026年02月', 443, 380, 63, 85.78, 959, 239, 88.70, 134, 82.09, 70, 84.29, -34.85, -3.19,
   '2月份订单量下降34.85%（春节影响），通过率下降3.19个百分点至85.78%。各店铺通过率均有不同程度下降，需关注节后复工后的审核质量稳定性。建议加强节后培训。'),
   
  (2026, 3, '2026年03月', 1925, 1605, 320, 83.38, 4976, 1197, 86.05, 569, 81.20, 159, 80.50, 334.20, -2.40,
   '3月份订单量激增334.20%，但通过率持续下滑至83.38%。驴上店铺通过率降至81.20%为最低。主要拒绝原因为"评分3"（64次）和"信贷黑名单"（27次）。建议：1）优化评分模型阈值；2）加强对信贷黑名单用户的前置筛选；3）增加审核人员配置以应对业务增长。'),
   
  (2026, 4, '2026年04月', 1746, 1461, 285, 83.68, 3992, 1076, 85.87, 513, 81.87, 157, 82.80, -9.30, 0.36,
   '4月份订单量回落9.30%（正常季节性波动），通过率微升0.36个百分点至83.68%，显示企稳迹象。第16周通过率达87.19%为月内最高。箭头店铺持续保持领先（85.87%），雷猴店铺改善明显（+2.3pp）。建议维持当前审核标准，重点关注驴上店铺的审核一致性。');

-- 插入初始周度数据（4月份数据）
INSERT INTO audit_weekly_summary (year, week_number, week_start_date, week_end_date, 
                                  total_orders, passed_orders, rejected_orders, pass_rate, total_devices,
                                  jt_orders, jt_pass_rate, ls_orders, ls_pass_rate, lh_orders, lh_pass_rate,
                                  wow_order_change, wow_pass_rate_change)
VALUES
  (2026, 15, '2026-04-13', '2026-04-19', 443, 357, 86, 80.59, 992, 273, 82.42, 130, 76.15, 40, 77.50, NULL, NULL),
  (2026, 16, '2026-04-20', '2026-04-26', 406, 354, 52, 87.19, 833, 250, 89.60, 120, 83.33, 36, 86.11, -8.35, 8.18),
  (2026, 17, '2026-04-27', '2026-05-03', 384, 326, 58, 84.90, 897, 237, 85.23, 114, 82.46, 33, 81.82, -5.42, -2.63),
  (2026, 18, '2026-05-04', '2026-05-10', 282, 239, 43, 84.75, 720, 176, 86.36, 79, 81.01, 27, 74.07, -26.56, -0.18);

-- 插入初始分析报告
INSERT INTO audit_analysis_reports (report_type, period, report_date, total_orders, overall_pass_rate, 
                                    key_findings, risk_alerts, actionable_recommendations, 
                                    priority_level, status, generated_by)
VALUES 
  ('monthly', '2026年04月', '2026-05-04', 1746, 83.68,
   '[{"finding": "通过率企稳回升", "detail": "4月通过率83.68%，较3月提升0.36pp"}, {"finding": "店铺差异显著", "detail": "箭头(85.87%) vs 驴上(81.87%)，差距4pp"}, {"finding": "第16周表现最佳", "detail": "周通过率87.19%，为近两月最高"}]'::JSONB,
   '[{"alert": "驴上店铺通过率偏低", "level": "warning", "value": "81.87%", "threshold": "83%"}, {"alert": "评分类拒绝占比高", "level": "info", "value": "23.5%", "detail": "评分1/2/3合计"}]'::JSONB,
   '[{"rec": "统一三店审核标准", "priority": "high", "impact": "预计可提升整体通过率1-2pp"}, {"rec": "优化评分模型", "priority": "medium", "impact": "减少误拒率"}, {"rec": "加强审核员培训", "priority": "medium", "impact": "提升审核一致性"}]'::JSONB,
   'medium', 'published', 'system'),

  ('weekly', '2026年第16周', '2026-04-26', 406, 87.19,
   '[{"finding": "本周通过率创近期新高", "detail": "87.19%，较上周提升8.18pp"}, {"finding": "所有店铺均超目标", "detail": "箭头89.6%、驴上83.3%、雷猴86.1%"}]'::JSONB,
   '[]'::JSONB,
   '[{"rec": "总结本周成功经验", "priority": "low", "impact": "复制最佳实践"}]'::JSONB,
   'low', 'published', 'system');

-- 输出验证信息
SELECT '✅ 审核数据模块初始化完成' as status;
SELECT 'audit_raw_data' as table_name, count(*) as row_count FROM audit_raw_data
UNION ALL SELECT 'audit_weekly_summary', count(*) FROM audit_weekly_summary
UNION ALL SELECT 'audit_monthly_summary', count(*) FROM audit_monthly_summary
UNION ALL SELECT 'audit_analysis_reports', count(*) FROM audit_analysis_reports;

-- 显示月度趋势
SELECT month_label, total_orders, pass_rate, mom_order_change, mom_pass_rate_change 
FROM audit_monthly_summary ORDER BY year, month;

-- 显示最近周度数据
SELECT week_number, total_orders, pass_rate, wow_order_change, wow_pass_rate_change 
FROM audit_weekly_summary WHERE year = 2026 ORDER BY week_number DESC LIMIT 4;
