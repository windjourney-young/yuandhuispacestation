/* ============================================================
   2048 小游戏（火星弹窗内使用）
   - 4x4 棋盘，方向键 / WASD / 触屏滑动均可操作
   - 计分 + 最高分（localStorage 持久化）+ 重置按钮
   - 弹窗打开时才响应键盘，避免干扰页面其他操作
   ============================================================ */
const Game2048 = (() => {
  const SIZE = 4;                          // 棋盘边长
  const BEST_KEY = 'spacestation-2048-best'; // 最高分存储键

  let grid = [];       // 4x4 二维数组，元素为 null 或 { v, isNew, isMerged }
  let score = 0;
  let best = 0;
  let over = false;
  let el = {};         // DOM 引用缓存

  /* ---------- 初始化 ---------- */
  function init(refs) {
    el = refs;
    best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;

    // 重置按钮
    el.resetBtn.addEventListener('click', newGame);

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

    newGame();
  }

  /* 当前弹窗是否打开 */
  function isOpen() {
    return el.board && el.board.closest('.modal').classList.contains('open');
  }

  /* ---------- 游戏流程 ---------- */

  /* 开新局 */
  function newGame() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    score = 0;
    over = false;
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
    if (over) return;

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

    if (isDead()) {
      over = true;
      el.overlayScore.textContent = score;
      el.overlay.classList.add('show');
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
