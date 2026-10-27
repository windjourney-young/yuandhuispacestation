/* ============================================================
   土星留言板
   - 数据保存在 localStorage（每位访客保存在自己的浏览器中）
   - 最新留言排在最前，支持删除
   - 所有用户输入经过 HTML 转义，防止 XSS 注入
   ============================================================ */
const MessageBoard = (() => {
  const KEY = 'spacestation-messages'; // localStorage 存储键
  let el = {};

  /* ---------- 初始化 ---------- */
  function init(refs) {
    el = refs;

    // 提交留言
    el.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = el.name.value.trim().slice(0, 20);  // 昵称最多 20 字
      const text = el.text.value.trim().slice(0, 200); // 内容最多 200 字
      if (!text) { el.text.focus(); return; }

      const items = load();
      items.push({ name: name || '匿名宇航员', text, ts: Date.now() });
      save(items);
      el.form.reset();
      render();
    });

    // 删除留言（事件委托，列表内容动态生成）
    el.list.addEventListener('click', (e) => {
      const btn = e.target.closest('.msg-del');
      if (!btn) return;
      const items = load();
      items.splice(parseInt(btn.dataset.i, 10), 1);
      save(items);
      render();
    });

    render();
  }

  /* ---------- 数据读写 ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; } // 数据损坏时视为空
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  /* ---------- 工具 ---------- */

  /* HTML 转义，防止留言内容注入脚本 */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* 时间戳 → "2026-10-27 20:30" 格式 */
  function fmt(ts) {
    const d = new Date(ts);
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
         + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const items = load();
    el.count.textContent = items.length;

    if (!items.length) {
      el.list.innerHTML = '<p class="msg-empty">星环上还没有留言，写下第一条吧 ✨</p>';
      return;
    }

    // 最新在前；data-i 为存储下标，删除时按此定位
    el.list.innerHTML = items
      .map((it, i) => ({ it, i }))
      .reverse()
      .map(({ it, i }) => `
        <div class="msg-item">
          <div class="msg-meta">
            <span class="msg-name">${esc(it.name)}</span>
            <span>${fmt(it.ts)} <button class="msg-del" data-i="${i}" title="删除这条留言">删除</button></span>
          </div>
          <div class="msg-content">${esc(it.text)}</div>
        </div>`)
      .join('');
  }

  return { init };
})();
