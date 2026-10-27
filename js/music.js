/* ============================================================
   轻柔宇宙背景音乐（BGM）
   使用 Web Audio API 程序化合成，无需任何外部音频文件：
   - 底层：两个低频持续音(drone) + 缓慢音量起伏，营造深空氛围
   - 上层：A 小调五声音阶的柔和铃声，随机 2.5~6.5 秒响起一次
   - 效果：反馈延迟(dealy) 模拟太空回声
   注意：浏览器自动播放策略要求音频必须由用户手势触发，
   因此默认静音，点击右上角按钮后才开始播放。
   ============================================================ */
const SpaceMusic = (() => {
  let ctx = null;        // AudioContext
  let master = null;     // 主输出音量
  let delaySend = null;  // 延迟效果入口
  let melodyTimer = null;
  let playing = false;

  // A 小调五声音阶（跨两个八度），听感舒缓
  const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

  /* 惰性初始化音频上下文与效果链 */
  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    // 主音量（从 0 渐入，避免爆音）
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // 简单反馈延迟：太空回声感
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.5;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    delaySend = delay;
  }

  /* 底层持续音：A2 + E3 两个低频，带 LFO 起伏 */
  function startDrone() {
    [110, 164.81].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = i * 4;

      const gain = ctx.createGain();
      gain.gain.value = 0.05;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 500;

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(master);
      gain.connect(delaySend);

      // 缓慢的音量呼吸(LFO)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.start();
      lfo.start();

      // 记录节点，停止时释放
      droneNodes.push(osc, lfo);
    });
  }
  let droneNodes = [];

  /* 柔和铃声：缓慢起音 + 长尾释放 */
  function playBell() {
    const freq = SCALE[Math.floor(Math.random() * SCALE.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 1.2);       // 1.2 秒缓慢起音
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 6);  // 6 秒长尾

    osc.connect(gain);
    gain.connect(master);
    gain.connect(delaySend);
    osc.start(t);
    osc.stop(t + 6.2);
  }

  /* 随机间隔地调度下一声铃音 */
  function scheduleMelody() {
    playBell();
    melodyTimer = setTimeout(scheduleMelody, 2500 + Math.random() * 4000);
  }

  /* 开始播放 */
  function start() {
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2); // 2 秒渐入

    startDrone();
    scheduleMelody();
    playing = true;
  }

  /* 停止播放 */
  function stop() {
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8); // 0.8 秒渐出

    clearTimeout(melodyTimer);

    // 延迟释放底层节点（等音量淡出后再停，避免爆音）
    const nodes = droneNodes;
    droneNodes = [];
    setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch (e) { /* 已停止则忽略 */ } }), 900);

    playing = false;
  }

  /* 切换播放/暂停，返回切换后的状态(true=播放中) */
  function toggle() {
    if (playing) {
      stop();
      return false;
    }
    start();
    return true;
  }

  return { toggle };
})();
