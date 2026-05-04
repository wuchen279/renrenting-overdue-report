-- 人人租风控数据后台 - Supabase 数据库表结构（完整重建版）
-- 执行方式: 在 Supabase Dashboard → SQL Editor 中运行
-- 注意: 此脚本会先删除已存在的同名表，请确认无重要数据

DROP TABLE IF EXISTS province_data CASCADE;
DROP TABLE IF EXISTS source_data CASCADE;
DROP TABLE IF EXISTS monthly_data CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- 1. 报告主表
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  period TEXT NOT NULL,
  total_orders INTEGER DEFAULT 0,
  dpd30_rate NUMERIC(5,2) DEFAULT 0,
  dpd90_rate NUMERIC(5,2) DEFAULT 0,
  overdue_count INTEGER DEFAULT 0,
  overdue_rate NUMERIC(5,2) DEFAULT 0,
  store_count INTEGER DEFAULT 3,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  report_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 店铺数据表
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  total_orders INTEGER DEFAULT 0,
  normal_orders INTEGER DEFAULT 0,
  normal_return INTEGER DEFAULT 0,
  m1 INTEGER DEFAULT 0,
  m2 INTEGER DEFAULT 0,
  m3 INTEGER DEFAULT 0,
  m3_plus INTEGER DEFAULT 0,
  dpd30_rate NUMERIC(5,2) DEFAULT 0,
  dpd90_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 月度趋势数据表
CREATE TABLE monthly_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_orders INTEGER DEFAULT 0,
  dpd30_rate NUMERIC(5,2) DEFAULT 0,
  dpd90_rate NUMERIC(5,2) DEFAULT 0,
  UNIQUE(report_id, year, month)
);

-- 4. 订单来源数据表
CREATE TABLE source_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  source_name TEXT NOT NULL,
  total_orders INTEGER DEFAULT 0,
  dpd30_rate NUMERIC(5,2) DEFAULT 0,
  dpd90_rate NUMERIC(5,2) DEFAULT 0,
  UNIQUE(report_id, store_name, source_name)
);

-- 5. 省份风险数据表
CREATE TABLE province_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  province_name TEXT NOT NULL,
  total_orders INTEGER DEFAULT 0,
  dpd30_rate NUMERIC(5,2) DEFAULT 0,
  dpd90_rate NUMERIC(5,2) DEFAULT 0,
  UNIQUE(report_id, province_name)
);

-- 启用 RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE province_data ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取（前端展示需要）
CREATE POLICY "Allow anon read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Allow anon read stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow anon read monthly" ON monthly_data FOR SELECT USING (true);
CREATE POLICY "Allow anon read sources" ON source_data FOR SELECT USING (true);
CREATE POLICY "Allow anon read provinces" ON province_data FOR SELECT USING (true);

-- 允许匿名写入（管理后台需要）
CREATE POLICY "Allow anon insert reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update reports" ON reports FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete reports" ON reports FOR DELETE USING (true);
CREATE POLICY "Allow anon insert stores" ON stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert monthly" ON monthly_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert sources" ON source_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert provinces" ON province_data FOR INSERT WITH CHECK (true);

-- 索引优化
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_stores_report_id ON stores(report_id);
CREATE INDEX idx_monthly_report_id ON monthly_data(report_id);
CREATE INDEX idx_source_report_id ON source_data(report_id);
CREATE INDEX idx_province_report_id ON province_data(report_id);

-- 插入初始报告数据
INSERT INTO reports (title, period, total_orders, dpd30_rate, dpd90_rate, overdue_count, overdue_rate, store_count, status)
VALUES ('人人租逾期风控分析报告', '2025年1月 ~ 2026年2月', 7894, 4.42, 1.85, 586, 7.42, 3, 'published');

-- 获取刚插入的报告ID并插入关联数据
DO $$
DECLARE
  report_id_val UUID;
BEGIN
  SELECT id INTO report_id_val FROM reports WHERE title = '人人租逾期风控分析报告' LIMIT 1;

  -- 店铺数据
  INSERT INTO stores (report_id, store_name, total_orders, normal_orders, normal_return, m1, m2, m3, m3_plus, dpd30_rate, dpd90_rate) VALUES
    (report_id_val, '箭头', 3688, 3446, 52, 73, 33, 31, 53, 3.17, 1.44),
    (report_id_val, '驴上', 2787, 2493, 19, 112, 55, 42, 66, 5.85, 2.37),
    (report_id_val, '雷猴', 1419, 1294, 4, 52, 25, 17, 27, 4.86, 1.90);

  -- 月度数据
  INSERT INTO monthly_data (report_id, year, month, total_orders, dpd30_rate, dpd90_rate) VALUES
    (report_id_val, 2025, 1, 114, 0.88, 0.88), (report_id_val, 2025, 2, 117, 0.85, 0.00),
    (report_id_val, 2025, 3, 321, 1.56, 0.31), (report_id_val, 2025, 4, 643, 2.18, 0.47),
    (report_id_val, 2025, 5, 759, 2.77, 0.79), (report_id_val, 2025, 6, 843, 3.80, 1.42),
    (report_id_val, 2025, 7, 937, 4.16, 1.60), (report_id_val, 2025, 8, 916, 5.02, 2.18),
    (report_id_val, 2025, 9, 870, 5.52, 2.30), (report_id_val, 2025, 10, 858, 5.83, 2.56),
    (report_id_val, 2025, 11, 856, 6.84, 3.04), (report_id_val, 2025, 12, 830, 5.42, 2.53),
    (report_id_val, 2026, 1, 448, 1.79, 1.12), (report_id_val, 2026, 2, 482, 0.21, 0.00);

  -- 来源数据 - 全店铺
  INSERT INTO source_data (report_id, store_name, source_name, total_orders, dpd30_rate, dpd90_rate) VALUES
    (report_id_val, '全店铺', '企业小程序(含渠道商)', 5450, 4.49, 1.47),
    (report_id_val, '全店铺', '人人租-生活号', 2444, 4.32, 2.82);

  -- 来源数据 - 箭头
  INSERT INTO source_data (report_id, store_name, source_name, total_orders, dpd30_rate, dpd90_rate) VALUES
    (report_id_val, '箭头', '企业小程序(含渠道商)', 1823, 3.89, 0.99),
    (report_id_val, '箭头', '人人租-生活号', 1862, 2.47, 1.88);

  -- 来源数据 - 驴上
  INSERT INTO source_data (report_id, store_name, source_name, total_orders, dpd30_rate, dpd90_rate) VALUES
    (report_id_val, '驴上', '企业小程序(含渠道商)', 1927, 4.67, 1.30),
    (report_id_val, '驴上', '人人租-生活号', 859, 8.50, 4.77);

  -- 来源数据 - 雷猴
  INSERT INTO source_data (report_id, store_name, source_name, total_orders, dpd30_rate, dpd90_rate) VALUES
    (report_id_val, '雷猴', '企业小程序(含渠道商)', 1700, 5.16, 1.94),
    (report_id_val, '雷猴', '人人租-生活号', 723, 3.92, 1.66);

  -- 省份数据
  INSERT INTO province_data (report_id, province_name, total_orders, dpd30_rate, dpd90_rate) VALUES
    (report_id_val, '天津市', 63, 11.11, 0.00), (report_id_val, '江苏省', 323, 10.22, 0.93),
    (report_id_val, '贵州省', 326, 9.20, 3.68), (report_id_val, '重庆市', 260, 8.08, 2.69),
    (report_id_val, '山东省', 405, 7.90, 2.72), (report_id_val, '青海省', 13, 7.69, 0.00),
    (report_id_val, '浙江省', 387, 6.46, 3.36), (report_id_val, '四川省', 362, 5.80, 3.31),
    (report_id_val, '辽宁省', 138, 5.80, 2.90), (report_id_val, '陕西省', 131, 5.34, 0.76),
    (report_id_val, '江西省', 194, 5.15, 3.09), (report_id_val, '湖南省', 241, 4.98, 4.15),
    (report_id_val, '内蒙古', 90, 4.44, 4.44), (report_id_val, '云南省', 192, 4.17, 1.56),
    (report_id_val, '福建省', 256, 3.91, 1.95);
END $$;

-- 验证插入结果
SELECT 'reports' as table_name, count(*) as row_count FROM reports
UNION ALL SELECT 'stores', count(*) FROM stores
UNION ALL SELECT 'monthly_data', count(*) FROM monthly_data
UNION ALL SELECT 'source_data', count(*) FROM source_data
UNION ALL SELECT 'province_data', count(*) FROM province_data;
