/* ============================================================
   星空背景：闪烁星星 + 流星划过（Canvas 绘制）
   - 星星：约 400 颗，各自以正弦相位闪烁，少量暖色星
   - 流星：每 2.5~7 秒随机生成一颗，带渐隐拖尾
   ============================================================ */
(() => {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let stars = [];    // 星星集合
  let meteors = [];  // 流星集合
  let lastMeteor = 0;      // 上次流星生成时间
  let nextMeteorIn = 2000; // 距下一次生成的间隔(ms)

  /* 画布尺寸随窗口自适应，并重新铺设星星 */
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
  }

  /* 铺设星星：密度与屏幕面积相关，上限 420 颗 */
  function initStars() {
    const count = Math.min(420, Math.floor((W * H) / 3000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.3,          // 半径
      base: Math.random() * 0.5 + 0.35,      // 基础亮度
      amp: Math.random() * 0.35,             // 闪烁幅度
      speed: Math.random() * 1.5 + 0.3,      // 闪烁速度
      phase: Math.random() * Math.PI * 2,    // 闪烁相位
      warm: Math.random() < 0.12,            // 约 12% 为暖色星
    }));
  }

  /* 生成一颗流星：从画面顶部随机位置斜向划过 */
  function spawnMeteor() {
    const speed = 6 + Math.random() * 6;                    // 速度(px/帧)
    const angle = (25 + Math.random() * 20) * Math.PI / 180; // 俯角 25°~45°
    meteors.push({
      x: Math.random() * W * 0.8 + W * 0.1,
      y: -20,
      vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1), // 随机向左/右
      vy: Math.sin(angle) * speed,
      len: 100 + Math.random() * 120,  // 拖尾长度
      life: 1,                         // 生命值(1 → 0 渐隐)
    });
  }

  /* 主循环：t 为时间戳(ms) */
  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    /* --- 星星（正弦闪烁） --- */
    for (const s of stars) {
      const alpha = Math.max(0.05, s.base + Math.sin(t / 1000 * s.speed + s.phase) * s.amp);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.warm ? '#ffe9c4' : '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* --- 流星生成节奏 --- */
    if (t - lastMeteor > nextMeteorIn) {
      spawnMeteor();
      lastMeteor = t;
      nextMeteorIn = 2500 + Math.random() * 4500;
    }

    /* --- 流星运动 + 渐隐拖尾 --- */
    ctx.globalAlpha = 1;
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 0.006;

      // 沿速度反方向画渐变拖尾
      const mag = Math.hypot(m.vx, m.vy);
      const ux = m.vx / mag, uy = m.vy / mag;
      const tailX = m.x - ux * m.len;
      const tailY = m.y - uy * m.len;
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // 流星头部亮点
      ctx.fillStyle = `rgba(255,255,255,${m.life})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // 出界或耗尽生命值后移除
      if (m.life <= 0 || m.y > H + 40 || m.x < -200 || m.x > W + 200) {
        meteors.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();
