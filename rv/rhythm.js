const Rhythm = {
  canvas: document.getElementById("game-canvas"),
  ctx: null,
  isPlaying: false,
  chart: [],
  audio: new Audio(),

  init() {
    this.ctx = this.canvas.getContext("2d", { alpha: false }); // 성능 최적화: 알파 채널 끔
    this.canvas.width = 540;
    this.canvas.height = window.innerHeight;
  },

  async start(chartName, musicName) {
    this.init();
    const res = await fetch(`./data/${chartName}`);
    this.chart = await res.json();
    this.audio.src = `./assets/sounds/game/${musicName}`;

    document.getElementById("rhythm-ui").style.display = "block";
    this.isPlaying = true;
    this.audio.play();
    this.loop();
  },

  loop() {
    if (!this.isPlaying) return;
    this.update();
    requestAnimationFrame(() => this.loop());
  },

  update() {
    const now = this.audio.currentTime * 1000;
    const ctx = this.ctx;
    const h = this.canvas.height;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 540, h);

    // 893개 노트를 돌릴 때 화면에 보이는 것만 렌더링 (Culling 최적화)
    for (let i = 0; i < this.chart.length; i++) {
      const n = this.chart[i];
      if (n.p) continue;

      const y = h - 120 + (now - n.time) * 5; // 속도 5.0
      if (y < -100) continue; // 화면 위쪽이면 스킵
      if (y > h + 100) {
        n.p = true;
        continue;
      } // 지나가면 처리

      ctx.fillStyle = n.lane === 0 || n.lane === 5 ? "#fff" : "#9b8fff";
      ctx.fillRect(n.lane * 90 + 5, y - 8, 80, 16);
    }
  },
};
