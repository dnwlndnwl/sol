const Game = {
  state: { affection: { a: 0, b: 0 }, inventory: [] },
  story: [],
  currentIdx: 0,
  isRhythmActive: false,

  async init() {
    try {
      const res = await fetch("./data/story.json");
      this.story = await res.json();
      this.renderScene();
    } catch (e) {
      console.error("데이터 로딩 실패!", e);
    }
  },

  renderScene() {
    const s = this.story[this.currentIdx];
    if (s.type === "rhythm_start") {
      Rhythm.start(s);
      return;
    }

    // UI 텍스트 & 색상
    document.getElementById("speaker").innerText = s.speaker || "";
    document.getElementById("speaker").style.color =
      s.active === "nina" ? "var(--accent-a)" : "var(--accent-b)";
    document.getElementById("text").innerText = s.text;

    // 캐릭터 렌더링
    const nina = document.getElementById("img-nina");
    const seeu = document.getElementById("img-seeu");
    if (s.nina) {
      nina.src = `./assets/images/nina/${s.nina}`;
      nina.classList.add("show");
    }
    if (s.seeu) {
      seeu.src = `./assets/images/seeu/${s.seeu}`;
      seeu.classList.add("show");
    }

    nina.classList.toggle("active", s.active === "nina");
    seeu.classList.toggle("active", s.active === "seeu");

    // 호감도 반영 (데이터에 있으면)
    if (s.affect) {
      this.state.affection.a += s.affect.a || 0;
      this.state.affection.b += s.affect.b || 0;
      this.updateHUD();
    }
  },

  updateHUD() {
    document.getElementById("bar-a").style.width = this.state.affection.a + "%";
    document.getElementById("bar-b").style.width = this.state.affection.b + "%";
  },

  next() {
    if (this.isRhythmActive) return;
    this.currentIdx++;
    if (this.currentIdx < this.story.length) this.renderScene();
  },
};

const Rhythm = {
  canvas: document.getElementById("rhythm-canvas"),
  ctx: document
    .getElementById("rhythm-canvas")
    .getContext("2d", { alpha: false }),
  chart: [],
  isPlaying: false,
  keys: ["s", "d", "f", "j", "k", "l"],
  colors: ["#fff", "#9b8fff", "#60a5fa", "#60a5fa", "#9b8fff", "#fff"],

  async start(scene) {
    Game.isRhythmActive = true;
    document.getElementById("rhythm-layer").style.display = "flex";
    document.getElementById("dialogue").style.opacity = "0";
    document.getElementById("characters").style.filter =
      "blur(10px) brightness(0.5)";

    const res = await fetch(`./data/${scene.chart}`);
    this.chart = await res.json();
    this.chart.forEach((n) => (n.p = false));

    this.canvas.width = 540;
    this.canvas.height = window.innerHeight;

    this.audio = new Audio(`./assets/sounds/game/${scene.music}`);
    this.audio.play();
    this.loop();
  },

  loop() {
    if (!this.isPlaying && this.audio.paused) this.isPlaying = true;
    const now = this.audio.currentTime * 1000;
    const ctx = this.ctx;
    const h = this.canvas.height;
    const hitY = h - 120;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 540, h);
    ctx.fillStyle = "#ff4757";
    ctx.fillRect(0, hitY, 540, 4);

    for (let n of this.chart) {
      if (n.p && n.type !== "long") continue;
      const y = hitY + (now - n.time) * 4.5;
      if (y < -100) continue;
      if (y > h + 100) {
        n.p = true;
        continue;
      }
      ctx.fillStyle = this.colors[n.lane];
      ctx.fillRect(n.lane * 90 + 5, y - 8, 80, 16);
    }

    if (this.audio.ended) this.end();
    else requestAnimationFrame(() => this.loop());
  },

  end() {
    Game.isRhythmActive = false;
    document.getElementById("rhythm-layer").style.display = "none";
    document.getElementById("dialogue").style.opacity = "1";
    document.getElementById("characters").style.filter = "none";
    Game.next();
  },
};

document.getElementById("dialogue").onclick = () => Game.next();
window.onkeydown = (e) => {
  if (!Game.isRhythmActive) return;
  const lane = Rhythm.keys.indexOf(e.key.toLowerCase());
  if (lane !== -1) {
    const now = Rhythm.audio.currentTime * 1000;
    const n = Rhythm.chart.find(
      (note) =>
        note.lane === lane && !note.p && Math.abs(note.time - now) < 150,
    );
    if (n) {
      n.p = true;
    }
  }
};

Game.init();
