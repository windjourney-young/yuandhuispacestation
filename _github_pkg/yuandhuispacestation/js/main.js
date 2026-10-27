/* ============================================================
   主逻辑：星球点击 → 弹窗控制 / 地球相册 / 音乐开关
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ================================================================
   * 相册图片来源：window.ALBUM_IMAGES
   * 该清单由 tools/gen_album_manifest.py 自动扫描 images/ 文件夹生成，
   * 写入 js/album-manifest.js。把图片放进 images/ 后跑一次脚本即可同步。
   * 若清单为空（images/ 没图），回退到示例占位图，保证页面不空白。
   * ================================================================ */
  const albumImages = (window.ALBUM_IMAGES && window.ALBUM_IMAGES.length)
    ? window.ALBUM_IMAGES.slice()
    : [
        'https://picsum.photos/seed/galaxy1/900/600',
        'https://picsum.photos/seed/galaxy2/900/600',
        'https://picsum.photos/seed/galaxy3/900/600',
        'https://picsum.photos/seed/galaxy4/900/600',
        'https://picsum.photos/seed/galaxy5/900/600',
        'https://picsum.photos/seed/galaxy6/900/600',
      ];
  let albumIdx = 0; // 当前展示的图片下标

  const albumImg = document.getElementById('albumImg');
  const albumCounter = document.getElementById('albumCounter');
  const albumDots = document.getElementById('albumDots');

  /* ---------- 相册：渲染 / 翻页 ---------- */
  function renderAlbum() {
    // 先淡出 → 换图 → 加载完成后淡入
    albumImg.classList.remove('show');
    albumImg.src = albumImages[albumIdx];
    albumImg.onload = () => albumImg.classList.add('show');
    albumCounter.textContent = (albumIdx + 1) + ' / ' + albumImages.length;
    [...albumDots.children].forEach((d, i) => d.classList.toggle('active', i === albumIdx));
  }

  /* 翻页（step = -1 上一张 / +1 下一张，循环切换） */
  function albumStep(step) {
    albumIdx = (albumIdx + step + albumImages.length) % albumImages.length;
    renderAlbum();
  }

  document.getElementById('albumPrev').addEventListener('click', () => albumStep(-1));
  document.getElementById('albumNext').addEventListener('click', () => albumStep(1));

  /* 生成相册圆点指示器（可点击直接跳转） */
  albumImages.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', '第' + (i + 1) + '张');
    dot.addEventListener('click', () => { albumIdx = i; renderAlbum(); });
    albumDots.appendChild(dot);
  });

  /* ---------- 弹窗开关 ---------- */

  /* 打开弹窗（同时锁定页面滚动） */
  function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* 关闭弹窗（全部关闭后恢复页面滚动） */
  function closeModal(modal) {
    modal.classList.remove('open');
    if (!document.querySelector('.modal.open')) {
      document.body.style.overflow = '';
    }
  }

  /* 星球点击 → 打开对应弹窗（data-modal 属性指定目标）；
     同时支持键盘 Enter / Space 触发（无障碍） */
  document.querySelectorAll('.planet-wrap').forEach(wrap => {
    const open = () => openModal(wrap.dataset.modal);
    wrap.addEventListener('click', open);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  /* 关闭途径一：每个弹窗右上角的 ✕ 按钮 */
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
  });

  /* 关闭途径二：点击遮罩空白处 */
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  /* ESC 关闭最上层弹窗；相册打开时 ←/→ 切换图片 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = document.querySelectorAll('.modal.open');
      if (open.length) closeModal(open[open.length - 1]);
    }
    const earthOpen = document.getElementById('earthModal').classList.contains('open');
    if (earthOpen && e.key === 'ArrowLeft')  { e.preventDefault(); albumStep(-1); }
    if (earthOpen && e.key === 'ArrowRight') { e.preventDefault(); albumStep(1); }
  });

  /* ---------- 初始化 2048 游戏 ---------- */
  Game2048.init({
    board:        document.getElementById('g2048Board'),
    score:        document.getElementById('g2048Score'),
    best:         document.getElementById('g2048Best'),
    resetBtn:     document.getElementById('g2048Reset'),
    overlay:      document.getElementById('g2048Over'),
    overlayScore: document.getElementById('g2048OverScore'),
  });

  /* ---------- 初始化留言板 ---------- */
  MessageBoard.init({
    form:  document.getElementById('msgForm'),
    name:  document.getElementById('msgName'),
    text:  document.getElementById('msgText'),
    list:  document.getElementById('msgList'),
    count: document.getElementById('msgCount'),
  });

  /* ---------- 背景音乐开关（默认静音） ---------- */
  const musicBtn = document.getElementById('musicToggle');
  musicBtn.addEventListener('click', () => {
    const on = SpaceMusic.toggle();
    musicBtn.textContent = on ? '🔊' : '🔇';
    musicBtn.classList.toggle('playing', on);
    musicBtn.title = on ? '关闭背景音乐' : '播放背景音乐';
    musicBtn.setAttribute('aria-label', musicBtn.title);
  });

  /* 首屏渲染相册 */
  renderAlbum();
});
