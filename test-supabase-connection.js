var http = require('http');
var https = require('https');

var SUPABASE_URL = 'https://mufudfalsojocgibetpm.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_cnxW0pvZomoCtrxKRF49Uw_yuQT8B_A';

console.log('========================================');
console.log('  Supabase 连接性测试工具');
console.log('  测试时间:', new Date().toLocaleString('zh-CN'));
console.log('========================================\n');

function testConnection() {
  return new Promise(function(resolve, reject) {
    console.log('📡 测试1: 基础网络连接...');
    
    var url = new URL(SUPABASE_URL);
    var options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    var req = https.request(options, function(res) {
      console.log('   ✅ HTTP状态码:', res.statusCode);
      console.log('   ✅ 状态消息:', res.statusMessage);
      
      if (res.statusCode === 200 || res.statusCode === 404) {
        resolve({ success: true, status: res.statusCode });
      } else {
        resolve({ success: false, status: res.statusCode, message: res.statusMessage });
      }
    });
    
    req.on('error', function(err) {
      console.error('   ❌ 连接失败:', err.message);
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', function() {
      req.destroy();
      resolve({ success: false, error: '请求超时（10秒）' });
    });
    
    req.end();
  });
}

function testTableExistence(tableName) {
  return new Promise(function(resolve, reject) {
    console.log('\n📋 测试2: 检查表是否存在 -', tableName);
    
    var options = {
      hostname: 'mufudfalsojocgibetpm.supabase.co',
      port: 443,
      path: '/rest/v1/' + tableName + '?select=*&limit=1',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    var req = https.request(options, function(res) {
      var data = '';
      
      res.on('data', function(chunk) { data += chunk; });
      
      res.on('end', function() {
        if (res.statusCode === 200) {
          try {
            var jsonData = JSON.parse(data);
            console.log('   ✅ 表存在！数据条数:', Array.isArray(jsonData) ? jsonData.length : 'N/A');
            resolve({ exists: true, count: Array.isArray(jsonData) ? jsonData.length : 0 });
          } catch (e) {
            console.log('   ✅ 表存在，但解析响应失败');
            resolve({ exists: true, parseError: true });
          }
        } else if (res.statusCode === 404) {
          console.log('   ⚠️ 表不存在（HTTP 404）');
          console.log('   💡 需要执行 supabase-init.sql 创建表结构');
          resolve({ exists: false, status: 404 });
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          console.log('   ❌ 认证失败（HTTP', res.statusCode, '）');
          resolve({ exists: false, status: res.statusCode, authError: true });
        } else {
          console.log('   ⚠️ 意外的HTTP状态:', res.statusCode);
          resolve({ exists: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', function(err) {
      console.error('   ❌ 请求失败:', err.message);
      resolve({ exists: false, error: err.message });
    });
    
    req.on('timeout', function() {
      req.destroy();
      resolve({ exists: false, error: '超时' });
    });
    
    req.end();
  });
}

async function runTests() {
  try {
    var connectionResult = await testConnection();
    
    if (!connectionResult.success && connectionResult.error) {
      console.log('\n❌ 网络连接测试失败！');
      console.log('错误信息:', connectionResult.error);
      console.log('\n可能的原因：');
      console.log('1. 网络连接问题');
      console.log('2. DNS解析失败');
      console.log('3. 防火墙阻止了HTTPS请求');
      console.log('4. Supabase服务暂时不可用');
      process.exit(1);
    }
    
    console.log('\n✅ 网络连接正常！');
    
    var tablesToTest = [
      'audit_raw_data',
      'audit_monthly_summary',
      'audit_weekly_summary'
    ];
    
    var results = {};
    
    for (var i = 0; i < tablesToTest.length; i++) {
      results[tablesToTest[i]] = await testTableExistence(tablesToTest[i]);
    }
    
    console.log('\n========================================');
    console.log('  📊 测试结果汇总');
    console.log('========================================\n');
    
    var allTablesExist = true;
    
    Object.keys(results).forEach(function(tableName) {
      var result = results[tableName];
      var icon = result.exists ? '✅' : '❌';
      var statusText = result.exists ? '存在' : '不存在';
      
      console.log(icon, tableName + ':', statusText);
      
      if (!result.exists) allTablesExist = false;
    });
    
    console.log('\n----------------------------------------');
    
    if (allTablesExist) {
      console.log('🎉 所有表都存在！系统可以正常使用。\n');
      console.log('下一步操作：');
      console.log('1. 打开 http://localhost:8090/audit.html 查看前台数据');
      console.log('2. 打开 http://localhost:8090/admin-new.html 上传新数据');
    } else {
      console.log('⚠️ 部分表不存在，需要初始化数据库！\n');
      console.log('解决方案：');
      console.log('');
      console.log('方法A：使用SQL Editor（推荐）');
      console.log('1. 登录 https://supabase.com');
      console.log('2. 进入项目 → SQL Editor');
      console.log('3. 打开 supabase-init.sql 文件');
      console.log('4. 复制全部内容并粘贴到SQL Editor');
      console.log('5. 点击 Run 执行');
      console.log('');
      console.log('方法B：使用命令行工具');
      console.log('node auto-update.js --init-only');
      console.log('');
      console.log('初始化完成后重新运行此脚本验证。');
    }
    
    console.log('\n========================================');
    
  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
    process.exit(1);
  }
}

runTests();