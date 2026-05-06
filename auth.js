var SupabaseAuth = (function() {
  var SUPABASE_URL = 'https://mufudfalsojocgibetpm.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_cnxW0pvZomoCtrxKRF49Uw_yuQT8B_A';

  var SESSION_DURATION = 4 * 60 * 60 * 1000;
  var WARNING_TIME = 15 * 60 * 1000;
  var CHECK_INTERVAL = 60 * 1000;

  var client = null;
  var currentUser = null;
  var session = null;
  var listeners = [];
  var sessionCheckTimer = null;

  function init() {
    try {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[Auth] Supabase客户端初始化成功');
        return true;
      } else {
        console.warn('[Auth] Supabase SDK未加载，使用本地模拟模式');
        return false;
      }
    } catch (e) {
      console.error('[Auth] 初始化失败:', e.message);
      return false;
    }
  }

  async function getSession() {
    if (!client) {
      var savedUser = localStorage.getItem('auth_user');
      var savedSession = localStorage.getItem('auth_session');
      var savedSessionData = localStorage.getItem('auth_session_data');

      if (savedUser && savedSession) {
        try {
          currentUser = JSON.parse(savedUser);
          session = JSON.parse(savedSession);

          if (savedSessionData) {
            var sessionData = JSON.parse(savedSessionData);
            if (isSessionExpired(sessionData)) {
              console.warn('[Auth] 会话已过期，自动登出');
              forceLogout('SESSION_EXPIRED');
              return null;
            }
          }

          return { user: currentUser, session: session };
        } catch (e) {
          clearLocalSession();
        }
      }
      return null;
    }

    try {
      var result = await client.auth.getSession();
      if (result.data && result.data.session) {
        session = result.data.session;
        currentUser = result.data.session.user;
        saveLocalSession(currentUser, session);
        notifyListeners('session', { user: currentUser, session: session });
        return { user: currentUser, session: session };
      }
      return null;
    } catch (e) {
      console.error('[Auth] 获取会话失败:', e);
      return null;
    }
  }

  async function signInWithEmail(email, password) {
    if (!client) {
      return await mockSignIn(email, password);
    }

    try {
      var result = await client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (result.error) {
        throw new Error(result.error.message || '登录失败');
      }

      if (result.data && result.data.user) {
        currentUser = result.data.user;
        session = result.data.session;
        saveLocalSession(currentUser, session);
        notifyListeners('login', { user: currentUser });
        return { success: true, user: currentUser };
      }

      throw new Error('登录响应异常');
    } catch (error) {
      console.error('[Auth] 登录错误:', error.message);
      var errorMsg = mapErrorMessage(error.message);
      return { success: false, error: errorMsg };
    }
  }

  async function signUp(email, password, metadata) {
    console.error('[Security] 检测到非法注册尝试:', {
      email: email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    var logEntry = {
      type: 'SECURITY_VIOLATION',
      action: 'FRONTEND_REGISTRATION_ATTEMPT',
      timestamp: new Date().toISOString(),
      data: {
        email: email,
        metadata: metadata,
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      severity: 'CRITICAL'
    };

    saveSecurityLog(logEntry);

    return {
      success: false,
      error: '用户注册功能已禁用。新账户创建必须通过后台管理系统完成。',
      code: 'REGISTRATION_DISABLED'
    };
  }

  async function signOut() {
    if (!client) {
      clearLocalSession();
      notifyListeners('logout', {});
      return { success: true };
    }

    try {
      var result = await client.auth.signOut();
      clearLocalSession();
      notifyListeners('logout', {});
      
      if (result.error) {
        console.warn('[Auth] 登出警告:', result.error.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error('[Auth] 登出错误:', error.message);
      clearLocalSession();
      return { success: true };
    }
  }

  async function resetPassword(email) {
    if (!client) {
      console.log('[Auth] 模拟模式：密码重置邮件已发送至', email);
      return { success: true, message: '密码重置邮件已发送，请查收。' };
    }

    try {
      var result = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
      });

      if (result.error) {
        throw new Error(result.error.message || '发送失败');
      }

      return { success: true, message: '密码重置邮件已发送，请查收。' };
    } catch (error) {
      console.error('[Auth] 密码重置错误:', error.message);
      return { success: false, error: error.message };
    }
  }

  function isAuthenticated() {
    return currentUser !== null || localStorage.getItem('auth_user') !== null;
  }

  function getUser() {
    return currentUser || JSON.parse(localStorage.getItem('auth_user') || 'null');
  }

  function onAuthChange(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
    }
  }

  function offAuthChange(callback) {
    listeners = listeners.filter(function(cb) { return cb !== callback; });
  }

  function notifyListeners(event, data) {
    listeners.forEach(function(cb) {
      try { cb(event, data); } catch(e) { console.warn('[Auth] 监听器错误:', e); }
    });
  }

  function saveLocalSession(user, sess) {
    try {
      var sessionData = {
        user: user,
        session: sess,
        loginTime: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION
      };
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_session', JSON.stringify(sess));
      localStorage.setItem('auth_session_data', JSON.stringify(sessionData));
      startSessionChecker();
    } catch(e) {
      console.error('[Auth] 保存会话失败:', e);
    }
  }

  function clearLocalSession() {
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_timestamp');
      localStorage.removeItem('auth_session_data');
      currentUser = null;
      session = null;
      stopSessionChecker();
    } catch(e) {
      console.warn('[Auth] 清除会话失败:', e);
    }
  }

  function isSessionExpired(sessionData) {
    if (!sessionData || !sessionData.expiresAt) return true;

    var now = Date.now();
    var expiresAt = sessionData.expiresAt;

    return now >= expiresAt;
  }

  function getSessionRemainingTime() {
    try {
      var sessionData = JSON.parse(localStorage.getItem('auth_session_data') || '{}');
      if (!sessionData || !sessionData.expiresAt) return 0;

      var remaining = sessionData.expiresAt - Date.now();
      return Math.max(0, remaining);
    } catch (e) {
      return 0;
    }
  }

  function formatSessionTime(ms) {
    if (ms <= 0) return '已过期';

    var totalSeconds = Math.floor(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (hours > 0) {
      return hours + '小时' + minutes + '分' + seconds + '秒';
    } else if (minutes > 0) {
      return minutes + '分' + seconds + '秒';
    } else {
      return seconds + '秒';
    }
  }

  function startSessionChecker() {
    stopSessionChecker();

    sessionCheckTimer = setInterval(function() {
      var remaining = getSessionRemainingTime();

      if (remaining <= 0) {
        console.warn('[Session] 会话已过期');
        forceLogout('SESSION_EXPIRED');
        return;
      }

      if (remaining <= WARNING_TIME && remaining > WARNING_TIME - CHECK_INTERVAL) {
        notifyListeners('session_warning', {
          remaining: remaining,
          formatted: formatSessionTime(remaining),
          message: '您的登录即将在15分钟后过期，请保存工作并重新登录'
        });
      }

      if (remaining <= CHECK_INTERVAL && remaining > 0) {
        var checkInterval = Math.min(10000, Math.max(1000, Math.floor(remaining / 10)));
        if (checkInterval < CHECK_INTERVAL) {
          stopSessionChecker();
          sessionCheckTimer = setInterval(function() {
            var newRemaining = getSessionRemainingTime();
            if (newRemaining <= 0) {
              forceLogout('SESSION_EXPIRED');
            } else {
              notifyListeners('session_tick', {
                remaining: newRemaining,
                formatted: formatSessionTime(newRemaining)
              });
            }
          }, checkInterval);
        }
      }

      notifyListeners('session_tick', {
        remaining: remaining,
        formatted: formatSessionTime(remaining)
      });
    }, CHECK_INTERVAL);

    console.log('[Session] 会话监控已启动（每' + (CHECK_INTERVAL/1000) + '秒检查一次）');
  }

  function stopSessionChecker() {
    if (sessionCheckTimer) {
      clearInterval(sessionCheckTimer);
      sessionCheckTimer = null;
    }
  }

  function forceLogout(reason) {
    reason = reason || 'MANUAL';

    var logEntry = {
      type: 'SESSION_MANAGEMENT',
      action: 'FORCE_LOGOUT',
      timestamp: new Date().toISOString(),
      operator: currentUser ? { id: currentUser.id, email: currentUser.email, name: currentUser.name } : null,
      details: {
        reason: reason,
        sessionDuration: getSessionDuration(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity: 'WARNING'
    };
    saveSecurityLog(logEntry);

    clearLocalSession();
    notifyListeners('logout', { reason: reason });

    var redirectPath = '/login.html?reason=' + reason + '&t=' + Date.now();
    if (window.location.pathname !== '/login.html' && window.location.pathname !== '/login.html'.replace('/', '')) {
      sessionStorage.setItem('logout_reason', reason);
      sessionStorage.setItem('logout_time', new Date().toISOString());
      window.location.href = redirectPath;
    }
  }

  function getSessionDuration() {
    try {
      var sessionData = JSON.parse(localStorage.getItem('auth_session_data') || '{}');
      if (!sessionData || !sessionData.loginTime) return 0;
      return Date.now() - sessionData.loginTime;
    } catch (e) {
      return 0;
    }
  }

  function extendSession() {
    try {
      var savedUser = localStorage.getItem('auth_user');
      var savedSession = localStorage.getItem('auth_session');

      if (savedUser && savedSession) {
        var user = JSON.parse(savedUser);
        var sess = JSON.parse(savedSession);
        saveLocalSession(user, sess);

        var logEntry = {
          type: 'SESSION_MANAGEMENT',
          action: 'EXTEND_SESSION',
          timestamp: new Date().toISOString(),
          operator: { id: user.id, email: user.email, name: user.name },
          details: {
            previousDuration: getSessionDuration(),
            newExpiry: new Date(Date.now() + SESSION_DURATION).toISOString()
          },
          severity: 'INFO'
        };
        saveSecurityLog(logEntry);

        return { success: true, message: '会话已延长4小时', newExpiry: Date.now() + SESSION_DURATION };
      }

      return { success: false, error: '无活跃会话' };
    } catch (e) {
      return { success: false, error: '延长失败: ' + e.message };
    }
  }

  function mapErrorMessage(msg) {
    var errorMap = {
      'Invalid login credentials': '邮箱或密码错误',
      'Email not confirmed': '邮箱未验证，请先查收验证邮件',
      'Invalid password': '密码格式不正确',
      'Password should be at least 6 characters': '密码至少需要6个字符',
      'Unable to validate email address': '邮箱格式无效',
      'User already registered': '该邮箱已注册',
      'Network request failed': '网络连接失败，请检查网络',
      'timeout': '请求超时，请重试',
      'Too many requests': '请求过于频繁，请稍后再试'
    };

    for (var key in errorMap) {
      if (msg.indexOf(key) !== -1) {
        return errorMap[key];
      }
    }

    return msg || '操作失败，请重试';
  }

  async function mockSignIn(email, password) {
    await new Promise(function(resolve) { setTimeout(resolve, 800); });

    var users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    var found = users.find(function(u) { return u.email === email && u.password === password; });

    if (found) {
      currentUser = {
        id: found.id,
        email: found.email,
        name: found.name || email.split('@')[0],
        role: found.role || 'user',
        created_at: found.created_at
      };
      session = { access_token: 'mock_token_' + Date.now() };
      saveLocalSession(currentUser, session);
      notifyListeners('login', { user: currentUser });
      return { success: true, user: currentUser };
    }

    return { success: false, error: '邮箱或密码错误' };
  }

  async function mockSignUp(email, password, metadata) {
    await new Promise(function(resolve) { setTimeout(resolve, 1000); });

    var users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    var exists = users.find(function(u) { return u.email === email; });

    if (exists) {
      return { success: false, error: '该邮箱已注册' };
    }

    var newUser = {
      id: 'mock_' + Date.now(),
      email: email,
      password: password,
      name: (metadata && metadata.name) || email.split('@')[0],
      role: 'user',
      created_at: new Date().toISOString(),
      verified: false
    };

    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));

    return { 
      success: true, 
      needsConfirmation: true,
      message: '注册成功！（模拟模式）'
    };
  }

  function requireAuth(redirectUrl) {
    redirectUrl = redirectUrl || '/login.html';

    if (!isAuthenticated()) {
      var currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('auth_redirect', currentPath);
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  function saveSecurityLog(logEntry) {
    try {
      var logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logEntry.id = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      logs.unshift(logEntry);

      if (logs.length > 1000) {
        logs = logs.slice(0, 1000);
      }

      localStorage.setItem('security_logs', JSON.stringify(logs));
      console.warn('[Security Log]', JSON.stringify(logEntry, null, 2));
    } catch(e) {
      console.error('[Security] 保存日志失败:', e);
    }
  }

  function getSecurityLogs(limit) {
    limit = limit || 100;
    try {
      var logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      return logs.slice(0, limit);
    } catch(e) {
      console.error('[Security] 读取日志失败:', e);
      return [];
    }
  }

  function clearSecurityLogs() {
    localStorage.removeItem('security_logs');
  }

  async function adminCreateUser(email, password, name, role, operatorInfo) {
    if (!SupabaseAuth.isAuthenticated()) {
      return { success: false, error: '未授权操作：需要管理员权限' };
    }

    var currentUser = SupabaseAuth.getUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return { success: false, error: '未授权操作：仅限管理员创建用户' };
    }

    var users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    var exists = users.find(function(u) { return u.email === email; });

    if (exists) {
      return { success: false, error: '该邮箱已被注册' };
    }

    var newUser = {
      id: 'user_' + Date.now(),
      email: email,
      password: password,
      name: name || email.split('@')[0],
      role: role || 'user',
      created_at: new Date().toISOString(),
      created_by: currentUser.email,
      operator_name: operatorInfo ? operatorInfo.name : (currentUser.name || currentUser.email),
      status: 'active',
      last_login: null
    };

    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));

    var auditLog = {
      type: 'USER_MANAGEMENT',
      action: 'CREATE_USER',
      timestamp: new Date().toISOString(),
      operator: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name || currentUser.email.split('@')[0]
      },
      target: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      changes: {
        field: 'new_user',
        old_value: null,
        new_value: { email: newUser.email, name: newUser.name, role: newUser.role }
      },
      severity: 'INFO'
    };
    saveSecurityLog(auditLog);

    return { success: true, user: newUser, message: '用户创建成功' };
  }

  async function adminUpdateUser(userId, updates, operatorInfo) {
    if (!SupabaseAuth.isAuthenticated()) {
      return { success: false, error: '未授权操作：需要管理员权限' };
    }

    var currentUser = SupabaseAuth.getUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return { success: false, error: '未授权操作：仅限管理员修改用户' };
    }

    var users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    var userIndex = users.findIndex(function(u) { return u.id === userId; });

    if (userIndex === -1) {
      return { success: false, error: '用户不存在' };
    }

    var originalUser = JSON.parse(JSON.stringify(users[userIndex]));
    Object.keys(updates).forEach(function(key) {
      if (key !== 'id' && key !== 'password' && updates[key] !== undefined) {
        users[userIndex][key] = updates[key];
      }
    });

    if (updates.password) {
      users[userIndex].password = updates.password;
    }

    users[userIndex].updated_at = new Date().toISOString();
    users[userIndex].updated_by = currentUser.email;
    localStorage.setItem('mock_users', JSON.stringify(users));

    var changedFields = [];
    Object.keys(updates).forEach(function(key) {
      if (originalUser[key] !== updates[key]) {
        changedFields.push({
          field: key,
          old_value: originalUser[key],
          new_value: updates[key]
        });
      }
    });

    var auditLog = {
      type: 'USER_MANAGEMENT',
      action: 'UPDATE_USER',
      timestamp: new Date().toISOString(),
      operator: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name || currentUser.email.split('@')[0]
      },
      target: {
        id: userId,
        email: users[userIndex].email,
        name: users[userIndex].name
      },
      changes: changedFields,
      severity: 'INFO'
    };
    saveSecurityLog(auditLog);

    return { success: true, user: users[userIndex], message: '用户更新成功' };
  }

  async function adminDeleteUser(userId, reason, operatorInfo) {
    if (!SupabaseAuth.isAuthenticated()) {
      return { success: false, error: '未授权操作：需要管理员权限' };
    }

    var currentUser = SupabaseAuth.getUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return { success: false, error: '未授权操作：仅限管理员删除用户' };
    }

    var users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    var userIndex = users.findIndex(function(u) { return u.id === userId; });

    if (userIndex === -1) {
      return { success: false, error: '用户不存在' };
    }

    var deletedUser = users.splice(userIndex, 1)[0];
    localStorage.setItem('mock_users', JSON.stringify(users));

    var auditLog = {
      type: 'USER_MANAGEMENT',
      action: 'DELETE_USER',
      timestamp: new Date().toISOString(),
      operator: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name || currentUser.email.split('@')[0]
      },
      target: {
        id: deletedUser.id,
        email: deletedUser.email,
        name: deletedUser.name
      },
      changes: [{
        field: 'status',
        old_value: 'active',
        new_value: 'deleted'
      }],
      metadata: {
        reason: reason || '管理员删除'
      },
      severity: 'WARNING'
    };
    saveSecurityLog(auditLog);

    return { success: true, message: '用户已删除' };
  }

  function getUsersList() {
    try {
      var users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      return users.map(function(u) {
        var safeUser = {};
        Object.keys(u).forEach(function(key) {
          if (key !== 'password') {
            safeUser[key] = u[key];
          }
        });
        return safeUser;
      });
    } catch(e) {
      console.error('[Admin] 获取用户列表失败:', e);
      return [];
    }
  }

  init();

  return {
    init: init,
    getSession: getSession,
    signInWithEmail: signInWithEmail,
    signUp: signUp,
    signOut: signOut,
    resetPassword: resetPassword,
    isAuthenticated: isAuthenticated,
    getUser: getUser,
    onAuthChange: onAuthChange,
    offAuthChange: offAuthChange,
    requireAuth: requireAuth,
    saveSecurityLog: saveSecurityLog,
    getSecurityLogs: getSecurityLogs,
    clearSecurityLogs: clearSecurityLogs,
    adminCreateUser: adminCreateUser,
    adminUpdateUser: adminUpdateUser,
    adminDeleteUser: adminDeleteUser,
    getUsersList: getUsersList,

    getSessionRemainingTime: getSessionRemainingTime,
    formatSessionTime: formatSessionTime,
    getSessionDuration: getSessionDuration,
    extendSession: extendSession,
    forceLogout: forceLogout
  };
})();

function ensureDefaultAdmin() {
  try {
    var users = JSON.parse(localStorage.getItem('mock_users') || '[]');

    if (users.length === 0) {
      var defaultAdmin = {
        id: 'admin_001',
        email: 'admin@renting.com',
        password: 'Admin123456',
        name: '超级管理员',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        created_by: 'system',
        operator_name: '系统初始化',
        status: 'active',
        last_login: null
      };

      users.push(defaultAdmin);
      localStorage.setItem('mock_users', JSON.stringify(users));

      var initLog = {
        type: 'USER_MANAGEMENT',
        action: 'SYSTEM_INIT',
        timestamp: new Date().toISOString(),
        operator: { id: 'system', email: 'system', name: '系统' },
        target: { id: defaultAdmin.id, email: defaultAdmin.email, name: defaultAdmin.name },
        changes: [{
          field: 'initial_setup',
          old_value: null,
          new_value: 'Default admin account created'
        }],
        severity: 'INFO'
      };

      var logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.unshift(initLog);
      localStorage.setItem('security_logs', JSON.stringify(logs));

      console.log('%c✅ 系统初始化完成！已创建默认管理员账号', 'color:#16a34a;font-size:14px;font-weight:bold;');
      console.log('%c📧 邮箱: admin@renting.com', 'color:#1565c0;font-size:13px;');
      console.log('%c🔑 密码: Admin123456', 'color:#dc2626;font-size:13px;');
      console.log('%c⚠️  请登录后立即修改密码！', 'color:#f59e0b;font-size:12px;');

      return true;
    }

    return false;
  } catch(e) {
    console.error('[Init] 初始化失败:', e);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  ensureDefaultAdmin();

  SupabaseAuth.getSession().then(function(sess) {
    if (sess) {
      console.log('[Auth] 用户已登录:', sess.user.email);
    } else {
      console.log('[Auth] 未登录状态');
    }
  });
});