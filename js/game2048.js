/* ============================================================
   2048 小游戏（火星弹窗内使用）
   - 4x4 棋盘，方向键 / WASD / 触屏滑动均可操作
   - 计分 + 最高分（localStorage 持久化）+ 重置按钮
   - 排行榜 Top 10（localStorage 持久化）
   - 得分超过排行榜最高分时弹恭喜对话框，留名并记录时间
   - 弹窗打开时才响应键盘，避免干扰页面其他操作
   ============================================================ */
const Game2048 = (() => {
  const SIZE = 4;                                   // 棋盘边长
  const BEST_KEY = 'spacestation-2048-best';        // 最高分存储键
  const BOARD_KEY = 'spacestation-2048-leaderboard';// 排行榜存储键
  const MIN_NEW_BOARD_SCORE = 100;                  // 排行榜为空时，至少该分数才弹破纪录

  let grid = [];       // 4x4 二维数组，元素为 null 或 { v, isNew, isMerged }
  let score = 0;
  let best = 0;
  let over = false;
  let paused = false;                  // 破纪录弹框期间暂停游戏
  let recordPromptedThisRound = false; // 本局是否已弹过破纪录（避免重复打扰）
  let el = {};                         // DOM 引用缓存

  /* ---------- 初始化 ---------- */
  function init(refs) {
    el = refs;
    best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;

    // 重置按钮
    el.resetBtn.addEventListener('click', newGame);

    // 清空排行榜
    el.clearBoardBtn.addEventListener('click', () => {
      if (!confirm('确定要清空排行榜吗？此操作不可撤销。')) return;
      saveBoard([]);
      renderLeaderboard();
    });

    // 破纪录弹框：提交上榜 / 跳过
    el.recordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = el.recordName.value.trim().slice(0, 20) || '匿名宇航员';
      submitRecord(name);
    });
    el.recordSkip.addEventListener('click', () => closeRecordModal());

    // 弹框内 ESC = 跳过（只在弹框打开时拦截，不冒泡到 main.js）
    el.recordModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRecordModal(); }
    });

    // 键盘映射（仅在 2048 弹窗打开时生效）
    const keyMap = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
      W: 'up', S: 'down', A: 'left', D: 'right',
    };
    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault(); // 阻止方向键滚动页面
        move(dir);
      }
    });

    // 触屏滑动（在棋盘区域内）
    let sx = 0, sy = 0;
    el.board.addEventListener('touchstart', (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }, { passive: true });
    el.board.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; // 位移过小视为点击
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    });

    renderLeaderboard();
    newGame();
  }

  /* 当前弹窗是否打开 */
  function isOpen() {
    return el.board && el.board.closest('.modal').classList.contains('open') && !paused;
  }

  /* ---------- 排行榜数据 ---------- */

  function loadBoard() {
    try { return JSON.parse(localStorage.getItem(BOARD_KEY)) || []; }
    catch (e) { return []; } // 数据损坏时视为空
  }
  function saveBoard(items) {
    localStorage.setItem(BOARD_KEY, JSON.stringify(items));
  }

  /* ---------- 工具 ---------- */

  /* HTML 转义，防止姓名注入脚本 */
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

  /* ---------- 排行榜渲染 ---------- */
  function renderLeaderboard() {
    const items = loadBoard();
    if (!items.length) {
      el.boardList.innerHTML = '<p class="lb-empty">还没有人上榜，快来争夺第一名 ✨</p>';
      return;
    }
    el.boardList.innerHTML = items.map((it, i) => `
      <div class="lb-item${i === 0 ? ' first' : ''}">
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-name">${esc(it.name)}</span>
        <span class="lb-score">${it.score}</span>
        <span class="lb-time">${fmt(it.ts)}</span>
      </div>`).join('');
  }

  /* ---------- 破纪录检测 ---------- */
  function checkRecord() {
    if (recordPromptedThisRound) return;
    const items = loadBoard();
    const top = items.length ? items[0].score : 0;
    const qualifies = items.length
      ? score > top                          // 排行榜非空：超过最高分即弹
      : score >= MIN_NEW_BOARD_SCORE;        // 排行榜为空：达到门槛才弹（避免开局误触）
    if (!qualifies) return;

    recordPromptedThisRound = true;
    paused = true;

    const desc = items.length
      ? `你的得分 ${score} 分，超越了排行榜最高分 ${top} 分！`
      : `你的得分 ${score} 分，将作为排行榜的第一条记录！`;
    el.recordDesc.textContent = desc;
    el.recordTimeTip.textContent = '上榜时间：' + fmt(Date.now());
    el.recordModal.classList.add('open');
    setTimeout(() => el.recordName.focus(), 120);
  }

  /* 提交上榜：写入排行榜并保持 Top 10 */
  function submitRecord(name) {
    const items = loadBoard();
    items.push({ name, score, ts: Date.now() });
    items.sort((a, b) => b.score - a.score);
    saveBoard(items.slice(0, 10));
    renderLeaderboard();
    closeRecordModal();
  }

  /* 关闭破纪录弹框（跳过或提交后调用），恢复游戏 */
  function closeRecordModal() {
    el.recordModal.classList.remove('open');
    el.recordForm.reset();
    paused = false;
  }

  /* ---------- 游戏流程 ---------- */

  /* 开新局 */
  function newGame() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    score = 0;
    over = false;
    paused = false;
    recordPromptedThisRound = false;
    el.overlay.classList.remove('show');
    addTile();
    addTile();
    render();
  }

  /* 在随机空格生成新块（90% 为 2，10% 为 4） */
  function addTile() {
    const empty = [];
    grid.forEach((row, r) => row.forEach((cell, c) => { if (!cell) empty.push([r, c]); }));
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = { v: Math.random() < 0.9 ? 2 : 4, isNew: true };
  }

  /* 一条线的滑动 + 合并（统一按“朝起点方向”处理）
     返回 { out: 新的四个格子, gained: 本行得分, moved: 是否发生变化 } */
  function slide(line) {
    const before = line.map(c => (c ? c.v : 0)).join(',');
    const nums = line.filter(Boolean);
    const out = [];
    let gained = 0;

    for (let i = 0; i < nums.length; i++) {
      // 相邻相等则合并一次（每回合每块最多合并一次）
      if (i + 1 < nums.length && nums[i].v === nums[i + 1].v) {
        const v = nums[i].v * 2;
        out.push({ v, isMerged: true });
        gained += v;
        i++; // 跳过被合并的下一块
      } else {
        out.push({ v: nums[i].v });
      }
    }
    while (out.length < SIZE) out.push(null);

    return {
      out,
      gained,
      moved: before !== out.map(c => (c ? c.v : 0)).join(','),
    };
  }

  /* 执行一次移动：dir = up / down / left / right */
  function move(dir) {
    if (over || paused) return;

    let moved = false;
    let gainedTotal = 0;
    const newGrid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

    for (let i = 0; i < SIZE; i++) {
      // 按方向取出第 i 行/列，统一转为“朝左滑”的线
      const line = [];
      for (let j = 0; j < SIZE; j++) {
        if (dir === 'left')       line.push(grid[i][j]);
        else if (dir === 'right')  line.push(grid[i][SIZE - 1 - j]);
        else if (dir === 'up')     line.push(grid[j][i]);
        else                       line.push(grid[SIZE - 1 - j][i]);
      }

      const res = slide(line);
      moved = moved || res.moved;
      gainedTotal += res.gained;

      // 结果写回原方向
      for (let j = 0; j < SIZE; j++) {
        const cell = res.out[j];
        if (dir === 'left')       newGrid[i][j] = cell;
        else if (dir === 'right')  newGrid[i][SIZE - 1 - j] = cell;
        else if (dir === 'up')     newGrid[j][i] = cell;
        else                       newGrid[SIZE - 1 - j][i] = cell;
      }
    }

    if (!moved) return; // 无效移动：不生成新块

    grid = newGrid;
    score += gainedTotal;
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, best);
    }

    addTile();
    render();

    // 实时检测破纪录（每局只弹一次）
    checkRecord();

    if (isDead()) {
      over = true;
      el.overlayScore.textContent = score;
      el.overlay.classList.add('show');
      // 游戏结束兜底：若仍未弹过破纪录，再检查一次
      checkRecord();
    }
  }

  /* 判断是否无路可走（无空格且无相邻等值块） */
  function isDead() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cur = grid[r][c];
        if (!cur) return false; // 有空格
        if (c + 1 < SIZE && grid[r][c + 1] && grid[r][c + 1].v === cur.v) return false;
        if (r + 1 < SIZE && grid[r + 1][c] && grid[r + 1][c].v === cur.v) return false;
      }
    }
    return true;
  }

  /* ---------- 渲染 ---------- */
  function render() {
    el.board.innerHTML = '';
    grid.forEach(row => row.forEach(cell => {
      const d = document.createElement('div');
      d.className = 'tile';
      if (cell) {
        d.classList.add('v' + cell.v);
        if (cell.v > 2048) d.classList.add('vbig'); // 4096 及以上
        if (cell.isNew)    d.classList.add('new');    // 新块弹出动画
        if (cell.isMerged) d.classList.add('merged'); // 合并块动画
        d.textContent = cell.v;
        cell.isNew = cell.isMerged = false; // 动画标记只生效一次
      }
      el.board.appendChild(d);
    }));
    el.score.textContent = score;
    el.best.textContent = best;
  }

  return { init };
})();
