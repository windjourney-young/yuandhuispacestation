/* ============================================================
   密码保护层：进入站点前必须输入正确密码
   - 密码：20250424
   - 使用 sessionStorage 记住当前标签页验证状态：
       同一标签页刷新无需重输，关闭标签页 / 浏览器后需重输
   - 通过密码后淡出覆盖层，再交还主逻辑控制权
   ============================================================ */
(function () {
  'use strict';

  var LOCK_PASSWORD = '20250424';             // 访问密码
  var STORAGE_KEY   = 'yuandhui_space_locked'; // sessionStorage 标记键

  // 在 DOM 解析前立即锁定 body，防止背景滚动并避免首屏内容闪现
  document.documentElement.classList.add('lock-pending');
  document.addEventListener('DOMContentLoaded', initLock);

  function initLock() {
    var screen = document.getElementById('lockScreen');
    if (!screen) return; // 容错：若模板未注入覆盖层则不拦截

    // 已在本标签页验证过 → 直接放行
    if (sessionStorage.getItem(STORAGE_KEY) === 'yes') {
      unlock(screen, /*animate*/ false);
      return;
    }

    document.body.classList.add('locked');

    var form   = document.getElementById('lockForm');
    var input  = document.getElementById('lockInput');
    var error  = document.getElementById('lockError');

    // 自动聚焦输入框
    setTimeout(function () { input && input.focus(); }, 50);

    // 提交校验
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();
      if (value === LOCK_PASSWORD) {
        sessionStorage.setItem(STORAGE_KEY, 'yes');
        unlock(screen, /*animate*/ true);
      } else {
        // 错误反馈：抖动 + 提示
        error.classList.add('show');
        input.classList.remove('shake');
        // 触发 reflow 以重启动画
        void input.offsetWidth;
        input.classList.add('shake');
        input.select();
      }
    });

    // 输入时清除错误提示
    input.addEventListener('input', function () {
      error.classList.remove('show');
    });
  }

  /* 解锁：移除覆盖层与锁定状态 */
  function unlock(screen, animate) {
    document.body.classList.remove('locked');
    document.documentElement.classList.remove('lock-pending');

    if (!animate) {
      screen.style.display = 'none';
      return;
    }
    screen.classList.add('unlocked');
    // 淡出动画结束后彻底隐藏
    var done = function () {
      screen.style.display = 'none';
      screen.removeEventListener('transitionend', done);
    };
    screen.addEventListener('transitionend', done);
    // 兜底：800ms 后强制隐藏，避免动画事件未触发
    setTimeout(function () { screen.style.display = 'none'; }, 800);
  }
})();
