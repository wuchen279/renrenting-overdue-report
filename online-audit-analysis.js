/**
 * 在线审核数据分析模块
 * 功能：将审核数据上传到 Supabase，支持多设备同步和在线分析
 */

var OnlineAuditAnalysis = (function() {
  var SUPABASE_URL = 'https://mufudfalsojocgibetpm.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_cnxW0pvZomoCtrxKRF49Uw_yuQT8B_A';
  
  var client = null;
  var isInitialized = false;

  function init() {
    if (isInitialized) return true;
    
    try {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isInitialized = true;
        console.log('[OnlineAudit] ✅ Supabase 客户端初始化成功');
        return true;
      } else {
        console.warn('[OnlineAudit] ⚠️ Supabase SDK 未加载');
        return false;
      }
    } catch (e) {
      console.error('[OnlineAudit] ❌ 初始化失败:', e);
      return false;
    }
  }

  async function uploadAuditData(processedData) {
    if (!init()) {
      throw new Error('Supabase 客户端未初始化');
    }

    try {
      console.log('[OnlineAudit] 开始上传审核数据到云端...');
      
      // 1. 上传月度数据
      if (processedData.monthlyData && processedData.monthlyData.length > 0) {
        const monthlyRecords = processedData.monthlyData.map(m => ({
          year: m.year,
          month: m.month,
          month_label: m.month_label,
          total_orders: m.total_orders,
          passed_orders: m.passed_orders,
          pass_rate: parseFloat(m.pass_rate) || 0,
          jt_orders: m.jt_orders || 0,
          jt_passed: m.jt_passed || 0,
          ls_orders: m.ls_orders || 0,
          ls_passed: m.ls_passed || 0,
          lh_orders: m.lh_orders || 0,
          lh_passed: m.lh_passed || 0,
          created_at: new Date().toISOString()
        }));

        const { data: monthlyResult, error: monthlyError } = await client
          .from('audit_monthly')
          .upsert(monthlyRecords, { onConflict: 'year,month' });

        if (monthlyError) {
          console.warn('[OnlineAudit] 月度数据上传失败:', monthlyError);
        } else {
          console.log('[OnlineAudit] ✅ 月度数据已上传:', monthlyRecords.length, '条');
        }
      }

      // 2. 上传周度数据
      if (processedData.weeklyData && processedData.weeklyData.length > 0) {
        const weeklyRecords = processedData.weeklyData.map(w => ({
          year: w.year,
          week_number: w.week_number,
          total_orders: w.total_orders,
          passed_orders: w.passed_orders,
          pass_rate: parseFloat(w.pass_rate) || 0,
          created_at: new Date().toISOString()
        }));

        const { data: weeklyResult, error: weeklyError } = await client
          .from('audit_weekly')
          .upsert(weeklyRecords, { onConflict: 'year,week_number' });

        if (weeklyError) {
          console.warn('[OnlineAudit] 周度数据上传失败:', weeklyError);
        } else {
          console.log('[OnlineAudit] ✅ 周度数据已上传:', weeklyRecords.length, '条');
        }
      }

      // 3. 上传店铺数据
      if (processedData.stores && processedData.stores.length > 0) {
        const storeRecords = processedData.stores.map(s => ({
          store_name: s.name,
          total_orders: s.total,
          passed_orders: s.passed,
          pass_rate: parseFloat(s.pass_rate) || 0,
          updated_at: new Date().toISOString()
        }));

        const { data: storeResult, error: storeError } = await client
          .from('audit_stores')
          .upsert(storeRecords, { onConflict: 'store_name' });

        if (storeError) {
          console.warn('[OnlineAudit] 店铺数据上传失败:', storeError);
        } else {
          console.log('[OnlineAudit] ✅ 店铺数据已上传:', storeRecords.length, '条');
        }
      }

      // 4. 上传审核人员数据
      if (processedData.auditors && processedData.auditors.length > 0) {
        const auditorRecords = processedData.auditors.map(a => ({
          auditor_name: a.name,
          total_orders: a.total,
          passed_orders: a.passed,
          pass_rate: parseFloat(a.pass_rate) || 0,
          updated_at: new Date().toISOString()
        }));

        const { data: auditorResult, error: auditorError } = await client
          .from('audit_auditors')
          .upsert(auditorRecords, { onConflict: 'auditor_name' });

        if (auditorError) {
          console.warn('[OnlineAudit] 审核人员数据上传失败:', auditorError);
        } else {
          console.log('[OnlineAudit] ✅ 审核人员数据已上传:', auditorRecords.length, '条');
        }
      }

      console.log('[OnlineAudit] 🎉 所有数据上传完成！');
      return { success: true, message: '数据已成功上传到云端' };

    } catch (error) {
      console.error('[OnlineAudit] ❌ 上传失败:', error);
      throw error;
    }
  }

  async function fetchOnlineData() {
    if (!init()) {
      throw new Error('Supabase 客户端未初始化');
    }

    try {
      console.log('[OnlineAudit] 从云端加载审核数据...');

      // 并行获取所有数据
      const [monthlyRes, weeklyRes, storesRes, auditorsRes] = await Promise.all([
        client.from('audit_monthly').select('*').order('year', { ascending: true }).order('month', { ascending: true }),
        client.from('audit_weekly').select('*').order('year', { ascending: true }).order('week_number', { ascending: true }),
        client.from('audit_stores').select('*').order('total_orders', { ascending: false }),
        client.from('audit_auditors').select('*').order('total_orders', { ascending: false })
      ]);

      const result = {
        success: true,
        dataSource: 'online',
        timestamp: new Date().toISOString(),
        monthlyData: monthlyRes.data || [],
        weeklyData: weeklyRes.data || [],
        stores: (storesRes.data || []).map(s => ({
          name: s.store_name,
          total: s.total_orders,
          passed: s.passed_orders,
          pass_rate: s.pass_rate.toFixed(2)
        })),
        auditors: (auditorsRes.data || []).map(a => ({
          name: a.auditor_name,
          total: a.total_orders,
          passed: a.passed_orders,
          pass_rate: a.pass_rate.toFixed(2)
        })),
        summary: {
          totalOrders: (monthlyRes.data || []).reduce((sum, m) => sum + (m.total_orders || 0), 0),
          avgPassRate: monthlyRes.data && monthlyRes.data.length > 0 ?
            (monthlyRes.data.reduce((sum, m) => sum + (m.pass_rate || 0), 0) / monthlyRes.data.length).toFixed(2) : 0,
          months: (monthlyRes.data || []).length,
          weeks: (weeklyRes.data || []).length
        }
      };

      console.log('[OnlineAudit] ✅ 数据加载完成:', result.summary);
      return result;

    } catch (error) {
      console.error('[OnlineAudit] ❌ 加载失败:', error);
      throw error;
    }
  }

  async function checkOnlineStatus() {
    if (!init()) {
      return { online: false, message: 'Supabase 未初始化' };
    }

    try {
      const { data, error } = await client
        .from('audit_monthly')
        .select('count')
        .limit(1);

      if (error) {
        return { online: false, message: '数据库连接失败: ' + error.message };
      }

      return { online: true, message: '已连接到云端数据库' };
    } catch (e) {
      return { online: false, message: '连接异常: ' + e.message };
    }
  }

  return {
    init: init,
    uploadAuditData: uploadAuditData,
    fetchOnlineData: fetchOnlineData,
    checkOnlineStatus: checkOnlineStatus
  };
})();

if (typeof window !== 'undefined') {
  window.OnlineAuditAnalysis = OnlineAuditAnalysis;
}
