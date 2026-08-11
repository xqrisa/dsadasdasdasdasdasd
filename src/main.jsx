import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Fish, Bird, Rocket } from "lucide-react";
import "./styles.css";


const W = 390;
const H = 844;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function Sin(a) { return Math.sin(a); }

/* ==========================================================================
   GRA 1: SKYFISH
   ========================================================================== */

function drawStar(ctx, x, y, r, alpha = 1, gold = false, rot = 0) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.translate(x, y);
  ctx.rotate(rot);

  const spikes = 5;
  const inner = r * 0.42;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / spikes;
    const rr = i % 2 ? inner : r;
    const px = Math.cos(a) * rr;
    const py = Sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.7);
  if (gold) {
    g.addColorStop(0, "#fffbd0");
    g.addColorStop(0.35, "#ffe47a");
    g.addColorStop(1, "rgba(255,104,216,0)");
  } else {
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.3, "#b7e8ff");
    g.addColorStop(1, "rgba(91,92,255,0)");
  }
  ctx.fillStyle = g;
  ctx.shadowBlur = r * 2.2;
  ctx.shadowColor = gold ? "#ff66d9" : "#63d8ff";
  ctx.fill();

  ctx.strokeStyle = gold ? "rgba(255,220,125,.75)" : "rgba(120,225,255,.7)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawBomb(ctx, x, y, r, t) {
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ff2255";

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "#1e1e28";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff4466";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(6, -r - 8, 8, -r - 10);
  ctx.strokeStyle = "#d4a359";
  ctx.lineWidth = 2;
  ctx.stroke();

  const sparkX = 8 + Math.sin(t / 50) * 1.5;
  const sparkY = -r - 10 + Math.cos(t / 50) * 1.5;
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcc00";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 10;
  ctx.fill();

  ctx.restore();
}

function drawFishTrail(ctx, trail, t) {
  if (trail.length < 2) return;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath();
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      const wave = Math.sin(t / 120 + i * 0.4 + layer) * (8 + i * 0.5);
      const tx = p.x + wave;
      const ty = p.y + i * 3.5;

      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }

    const alpha = layer === 0 ? 0.6 : 0.35;
    const width = layer === 0 ? 14 : 22 - layer * 4;
    
    ctx.strokeStyle = layer === 0 ? "rgba(60, 230, 255, " + alpha + ")" : "rgba(140, 60, 255, " + alpha + ")";
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00d5ff";
    ctx.stroke();
  }

  ctx.restore();
}

function drawFish(ctx, p, t) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.vx * 0.04);

  ctx.shadowBlur = 30;
  ctx.shadowColor = "#00e1ff";

  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "rgba(0, 213, 255, 0.6)";
  ctx.beginPath();
  ctx.moveTo(-10, 20);
  ctx.bezierCurveTo(-35, 60 + Math.sin(t / 150) * 12, 35, 60 - Math.sin(t / 150) * 12, 10, 20);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#67e2ff";
  ctx.beginPath();
  ctx.ellipse(-20, 5, 14, 25, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(20, 5, 14, 25, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.7; 
  const body = ctx.createLinearGradient(0, -35, 0, 35);
  body.addColorStop(0, "rgba(220, 250, 255, 0.95)");
  body.addColorStop(0.4, "rgba(50, 200, 255, 0.6)");
  body.addColorStop(1, "rgba(20, 90, 220, 0.4)");
  
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#b5f3ff";
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(-6, -26);
  ctx.lineTo(6, -26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  for (const ex of [-9, 9]) {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.ellipse(ex, -15, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#005980";
    ctx.beginPath();
    ctx.arc(ex + Math.sin(t / 260) * 1.2, -15, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ex - 1.5, -18, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + 2, -13, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function SkyFishGame({ onBackToMenu }) {
  const canvasRef = useRef(null);

  const game = useRef({
    playing: false,
    dead: false,
    score: 0,
    best: Number(localStorage.getItem("skyfish-best") || 0),
    px: W / 2,
    py: H * 0.7,
    vx: 0,
    targetX: W / 2,
    distance: 0,
    lastY: 0,
    items: [],
    particles: [],
    trail: [] 
  });

  const [uiState, setUiState] = useState({
    playing: false,
    dead: false,
    score: 0,
    best: Number(localStorage.getItem("skyfish-best") || 0)
  });

  const startNewGame = () => {
    const g = game.current;
    g.playing = true;
    g.dead = false;
    g.score = 0;
    g.px = W / 2;
    g.targetX = W / 2;
    g.distance = 0;
    g.lastY = 0;
    g.items = [];
    g.particles = [];
    g.trail = [];

    for (let i = 0; i < 15; i++) {
      spawnItem(g);
    }

    setUiState({
      playing: true,
      dead: false,
      score: 0,
      best: g.best
    });
  };

  function spawnItem(g) {
    g.lastY -= 150;
    let x = 45 + Math.random() * (W - 90);

    if (g.items.length > 0) {
      const prevX = g.items[g.items.length - 1].x;
      if (Math.abs(prevX - x) < 90) {
        x = (prevX + 130) % (W - 90) + 45;
      }
    }

    const rand = Math.random();
    let type = "blue";
    if (rand < 0.22) type = "bomb";
    else if (rand > 0.78) type = "gold";

    g.items.push({
      x,
      worldY: g.lastY,
      type,
      r: type === "bomb" ? 14 : 12,
      spin: Math.random() * Math.PI * 2
    });
  }

  function addParticles(x, y, kind) {
    const count = kind === "bomb" ? 35 : 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      game.current.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        gravity: 0.12,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        r: Math.random() * 4 + 2,
        gold: kind === "gold",
        bomb: kind === "bomb"
      });
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let lastTime = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const bgStars = Array.from({ length: 85 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 0.55 + 0.15,
      phase: Math.random() * Math.PI * 2,
      bright: Math.random() > 0.86,
    }));

    const clouds = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * W,
      y: i * 145 + Math.random() * 90,
      scale: 0.7 + Math.random() * 1.2,
      speed: 0.08 + Math.random() * 0.12,
    }));

    function loop(now) {
      const dtMs = now - lastTime;
      lastTime = now;
      const dt = Math.min(dtMs / 16.666, 2.5);

      const g = game.current;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#230632");
      bg.addColorStop(0.38, "#520936");
      bg.addColorStop(0.72, "#9b0a66");
      bg.addColorStop(1, "#16052d");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 4; i++) {
        const x = W * (0.1 + i * 0.28) + Math.sin(now / 2200 + i) * 55;
        const y = 170 + i * 190 - Math.sin(now / 1800 + i) * 35;
        const rg = ctx.createRadialGradient(x, y, 0, x, y, 170);
        rg.addColorStop(0, i % 2 ? "rgba(255,33,180,.20)" : "rgba(65,38,255,.18)");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      }

      for (const a of bgStars) {
        const yy = (a.y + now * a.speed * 0.05) % H;
        const tw = 0.5 + 0.5 * Math.sin(now / 500 + a.phase);
        drawStar(ctx, a.x, yy, a.r * (a.bright ? 1.7 : 1), 0.35 + 0.65 * tw, false);
      }

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (const c of clouds) {
        const y = (c.y + now * c.speed * 0.1) % (H + 180) - 90;
        const x = c.x + Math.sin(now / 1500 + c.y) * 35;
        const rg = ctx.createRadialGradient(x, y, 0, x, y, 100 * c.scale);
        rg.addColorStop(0, "rgba(255,22,179,.18)");
        rg.addColorStop(0.5, "rgba(173,27,189,.08)");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(x - 120 * c.scale, y - 80 * c.scale, 240 * c.scale, 160 * c.scale);
      }
      ctx.restore();

      if (g.playing && !g.dead) {
        const dx = g.targetX - g.px;
        g.vx = dx * Math.min(1, 0.25 * dt);
        g.px += g.vx;
        g.px = clamp(g.px, 30, W - 30);

        g.distance += 4.5 * dt;

        g.trail.unshift({ x: g.px, y: g.py + 10 });
        if (g.trail.length > 22) g.trail.pop();

        while (g.lastY + g.distance > -1000) {
          spawnItem(g);
        }

        for (let i = g.items.length - 1; i >= 0; i--) {
          const item = g.items[i];
          const screenY = item.worldY + g.distance;
          item.spin += 0.05 * dt;

          const dist = Math.hypot(item.x - g.px, screenY - g.py);

          if (dist < (item.type === "bomb" ? 20 : 24)) {
            if (item.type === "bomb") {
              g.dead = true;
              addParticles(item.x, screenY, "bomb");
              setUiState({
                playing: true,
                dead: true,
                score: g.score,
                best: g.best
              });
            } else {
              const pts = item.type === "gold" ? 3 : 1;
              g.score += pts;
              if (g.score > g.best) {
                g.best = g.score;
                localStorage.setItem("skyfish-best", String(g.best));
              }
              addParticles(item.x, screenY, item.type);
              g.items.splice(i, 1);
              continue;
            }
          }

          if (screenY > H + 80) {
            g.items.splice(i, 1);
          }
        }
      }

      for (const item of g.items) {
        const screenY = item.worldY + g.distance;
        if (screenY < -60 || screenY > H + 60) continue;

        if (item.type === "bomb") {
          drawBomb(ctx, item.x, screenY, item.r, now);
        } else {
          drawStar(ctx, item.x, screenY, item.r, 1, item.type === "gold", item.spin);
        }
      }

      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.gravity * dt;
        p.life -= p.decay * dt;

        if (p.life <= 0) {
          g.particles.splice(i, 1);
          continue;
        }

        if (p.bomb) {
          ctx.fillStyle = `rgba(255, 51, 85, ${Math.max(0, p.life)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, p.x, p.y, p.r * p.life, p.life, p.gold, 0);
        }
      }

      if (g.playing && !g.dead) {
        drawFishTrail(ctx, g.trail, now); 
        drawFish(ctx, { x: g.px, y: g.py, vx: g.vx }, now);

        ctx.fillStyle = "rgba(8,2,25,.35)";
        ctx.beginPath();
        ctx.roundRect(16, 16, 80, 44, 22);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "700 20px system-ui";
        ctx.fillText(`✦ ${g.score}`, 28, 45);
      }

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (clientX !== undefined) {
        const x = (clientX - rect.left) * (W / rect.width);
        game.current.targetX = clamp(x, 30, W - 30);
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <main className="game">
      <canvas ref={canvasRef} />
      <div className="vignette" />

      {!uiState.playing && (
        <section className="overlay">
          <div className="eyebrow">✦ biocides.dev ✦</div>
          <h1>Gwiazdki</h1>
          <p>Omijaj bomby i zbieraj gwiazdki!</p>
          <div className="button-group">
            <button onClick={startNewGame}>ZACZNIJ LOT</button>
            <button className="secondary" onClick={onBackToMenu}>MENU GŁÓWNE</button>
          </div>
          <div className="best">top score: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && uiState.dead && (
        <section className="overlay">
          <div className="eyebrow">KONIEC LOTU</div>
          <h1>{uiState.score} ✦</h1>
          <p>Rybka trafiła na bombę!</p>
          <div className="button-group">
            <button onClick={startNewGame}>GRAJ DALEJ</button>
            <button className="secondary" onClick={onBackToMenu}>MENU GŁÓWNE</button>
          </div>
          <div className="best">Rekord: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && !uiState.dead && <div className="hint">PRZESUWAJ W LEWO / PRAWO</div>}
    </main>
  );
}


/* ==========================================================================
   FUNKCJA RYSOWANIA PTASZKA
   ========================================================================== */
function drawBird(ctx, x, y, vy, t) {
  ctx.save();
  ctx.translate(x, y);

  // Obrót ptaszka zależny od prędkości opadania/skoku
  const rotation = Math.max(-0.4, Math.min(0.7, vy * 0.08));
  ctx.rotate(rotation);

  ctx.shadowBlur = 12;
  ctx.shadowColor = "rgba(255, 204, 0, 0.5)";

  // Ciałko (Żółty owal)
  ctx.fillStyle = "#ffcc00";
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#e6b800";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Brzuszek
  ctx.fillStyle = "#fff5cc";
  ctx.beginPath();
  ctx.ellipse(-2, 4, 9, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Dzióbek
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(21, 2);
  ctx.lineTo(12, 6);
  ctx.closePath();
  ctx.fill();

  // Oko
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(6, -4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Blik w oku
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(6, -5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Skrzydełko (macha przy skoku/czasie)
  const wingFlap = Math.sin(t / 40) * 4;
  ctx.fillStyle = "#ffaa00";
  ctx.beginPath();
  ctx.ellipse(-6, 2 + wingFlap * 0.3, 8, 5, -0.3 + wingFlap * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ==========================================================================
   GRA 2: FLAPPY BIRD (WIĘKSZY ODSTĘP I DUŻO ŁATWIEJSZA ROZGRYWKA)
   ========================================================================== */

function FlappyGame({ onBackToMenu }) {
  const canvasRef = useRef(null);

  const game = useRef({
    playing: false,
    dead: false,
    score: 0,
    best: Number(localStorage.getItem("flappy-best") || 0),
    py: H / 2,
    vy: 0,
    pipes: [],
    spawnTimer: 0,
    safeTimer: 0,
    holding: false
  });

  const [uiState, setUiState] = useState({
    playing: false,
    dead: false,
    score: 0,
    best: Number(localStorage.getItem("flappy-best") || 0),
    safeSecondsLeft: 4
  });

  const startNewGame = (e) => {
    if (e) e.stopPropagation();
    const g = game.current;
    g.playing = true;
    g.dead = false;
    g.score = 0;
    g.py = H / 2;
    g.vy = -1.5;
    g.pipes = [];
    g.spawnTimer = 0;
    g.safeTimer = 240; // 4 sekundy swobody na start

    setUiState({
      playing: true,
      dead: false,
      score: 0,
      best: g.best,
      safeSecondsLeft: 4
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const handleDown = (e) => {
      if (e.target.closest(".overlay")) return;
      game.current.holding = true;
      game.current.vy = -3.8;
    };

    const handleUp = () => {
      game.current.holding = false;
    };

    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);

    function loop(now) {
      const g = game.current;

      // Tło
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0d1b2a");
      bg.addColorStop(0.5, "#1b263b");
      bg.addColorStop(1, "#415a77");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (g.playing && !g.dead) {
        // Bardzo płynne i powolne wznoszenie
        if (g.holding) {
          g.vy -= 0.18;
          if (g.vy < -4.5) g.vy = -4.5;
        }

        // Wolne opadanie
        g.vy += 0.18;
        if (g.vy > 4.5) g.vy = 4.5;

        g.py += g.vy;

        // Ograniczenia krawędzi ekranu
        if (g.py > H - 35) {
          g.py = H - 35;
          g.vy = 0;
        }
        if (g.py < 25) {
          g.py = 25;
          g.vy = 0;
        }

        // Odliczanie bezpiecznego startu
        if (g.safeTimer > 0) {
          g.safeTimer--;
          const sec = Math.ceil(g.safeTimer / 60);
          setUiState((prev) => (prev.safeSecondsLeft !== sec ? { ...prev, safeSecondsLeft: sec } : prev));
        } else {
          // Generowanie przeszkód – DUŻO WIĘKSZA ODLEGŁOŚĆ MIĘDZY RURAMI
          g.spawnTimer++;
          if (g.spawnTimer > 210) { // Zwiększone z 140 na 210 (rzadsze rury)
            g.spawnTimer = 0;
            const gapHeight = 260; // Zwiększone z 230 na 260 (bardzo duża luka)
            const minPipe = 120;
            const maxPipe = H - gapHeight - minPipe;
            const topH = minPipe + Math.random() * (maxPipe - minPipe);

            g.pipes.push({
              x: W,
              top: topH,
              bottom: H - topH - gapHeight,
              passed: false
            });
          }
        }

        // Ruch rur i wyliczanie kolizji
        for (let i = g.pipes.length - 1; i >= 0; i--) {
          const p = g.pipes[i];
          p.x -= 1.8;

          // Punkty
          if (!p.passed && p.x < W / 3) {
            p.passed = true;
            g.score++;
            if (g.score > g.best) {
              g.best = g.score;
              localStorage.setItem("flappy-best", String(g.best));
            }
          }

          // Wybaczający Hitbox (małe pole kolizji)
          const birdX = W / 3;
          if (birdX + 5 > p.x && birdX - 5 < p.x + 50) {
            if (g.py - 5 < p.top || g.py + 5 > H - p.bottom) {
              g.dead = true;
              setUiState({ playing: true, dead: true, score: g.score, best: g.best, safeSecondsLeft: 0 });
            }
          }

          if (p.x < -60) g.pipes.splice(i, 1);
        }
      }

      // Rysowanie rur
      ctx.fillStyle = "#2ec4b6";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#2ec4b6";
      for (const p of g.pipes) {
        ctx.fillRect(p.x, 0, 50, p.top);
        ctx.fillRect(p.x, H - p.bottom, 50, p.bottom);
      }
      ctx.shadowBlur = 0;

      // Rysowanie ptaszka
      if (g.playing) {
        drawBird(ctx, W / 3, g.py, g.vy, now);

        if (!g.dead) {
          ctx.fillStyle = "#fff";
          ctx.font = "700 24px system-ui";
          ctx.fillText(`✦ ${g.score}`, 24, 48);

          if (g.safeTimer > 0) {
            ctx.fillStyle = "#ffe47a";
            ctx.font = "600 16px system-ui";
            ctx.textAlign = "center";
            ctx.fillText(`START ZA: ${uiState.safeSecondsLeft}s`, W / 2, 80);
            ctx.textAlign = "left";
          }
        }
      }

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [uiState.safeSecondsLeft]);

  return (
    <main className="game">
      <canvas ref={canvasRef} />
      <div className="vignette" />

      {!uiState.playing && (
        <section className="overlay">
          <div className="eyebrow">✦ biocides.dev ✦</div>
          <h1>Kurczak</h1>
          <div className="button-group">
            <button onClick={startNewGame}>START</button>
            <button className="secondary" onClick={(e) => { e.stopPropagation(); onBackToMenu(); }}>MENU GŁÓWNE</button>
          </div>
          <div className="best">top score: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && uiState.dead && (
        <section className="overlay">
          <div className="eyebrow">KONIEC GRY</div>
          <h1>{uiState.score} ✦</h1>
          <p>Uderzyłeś w rurę!</p>
          <div className="button-group">
            <button onClick={startNewGame}>ZAGRAJ ZNOWU</button>
            <button className="secondary" onClick={(e) => { e.stopPropagation(); onBackToMenu(); }}>MENU GŁÓWNE</button>
          </div>
          <div className="best">Rekord: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && !uiState.dead && <div className="hint">PRZYTRZYMAJ ABY LECIEĆ W GÓRĘ</div>}
    </main>
  );
}


/* ==========================================================================
   FUNKCJA RYSOWANIA MARIO (PIXEL ART STYLE)
   ========================================================================== */
function drawMario(ctx, x, y, vy, facingRight) {
  ctx.save();
  ctx.translate(x, y);

  // Lekkie obrócenie lub odbicie w zależności od kierunku ruchu
  if (!facingRight) {
    ctx.scale(-1, 1);
  }

  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(230, 57, 70, 0.4)";

  // Czerwona czapka
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.roundRect(-10, -18, 20, 7, 3);
  ctx.fill();

  // Twarz / Głowa
  ctx.fillStyle = "#ffcdb2";
  ctx.beginPath();
  ctx.roundRect(-8, -12, 16, 10, 2);
  ctx.fill();

  // Wąsy
  ctx.fillStyle = "#4a2810";
  ctx.fillRect(0, -6, 9, 3);

  // Oko
  ctx.fillStyle = "#000000";
  ctx.fillRect(3, -10, 2, 3);

  // Niebieski ogrodniczek (Ciało)
  ctx.fillStyle = "#1d3557";
  ctx.beginPath();
  ctx.roundRect(-7, -2, 14, 12, 3);
  ctx.fill();

  // Czerwona koszulka pod spodem
  ctx.fillStyle = "#e63946";
  ctx.fillRect(-6, -2, 12, 4);

  // Złote guziki
  ctx.fillStyle = "#ffb703";
  ctx.fillRect(-4, 3, 2, 2);
  ctx.fillRect(2, 3, 2, 2);

  // Buty / Nóżki
  ctx.fillStyle = "#6c584c";
  ctx.fillRect(-7, 10, 5, 4);
  ctx.fillRect(2, 10, 5, 4);

  ctx.restore();
}

/* ==========================================================================
   GRA 3: STAR JUMPER (SKOK NA KLIKNIĘCIE / TAPNIĘCIE)
   ========================================================================== */

function StarJumperGame({ onBackToMenu }) {
  const canvasRef = useRef(null);

  const game = useRef({
    playing: false,
    dead: false,
    score: 0,
    best: Number(localStorage.getItem("jumper-best") || 0),
    px: W / 2,
    py: H - 150,
    vx: 0,
    vy: 0,
    isGrounded: false, // Czy stoi na platformie
    facingRight: true,
    cameraY: 0,
    platforms: []
  });

  const [uiState, setUiState] = useState({
    playing: false,
    dead: false,
    score: 0,
    best: Number(localStorage.getItem("jumper-best") || 0)
  });

  const spawnPlatform = (platforms, y) => {
    const hasSafePlatform = platforms.some(
      (p) => Math.abs(p.y - y) < 35 && p.type !== "broken"
    );

    let type;
    if (!hasSafePlatform) {
      const safeTypes = ["normal", "normal", "moving", "spring"];
      type = safeTypes[Math.floor(Math.random() * safeTypes.length)];
    } else {
      const allTypes = ["normal", "moving", "broken", "spring"];
      type = allTypes[Math.floor(Math.random() * allTypes.length)];
    }

    const w = type === "broken" ? 75 : 85;
    const x = Math.random() * (W - w);

    platforms.push({
      x,
      y,
      w,
      h: 12,
      type,
      vx: type === "moving" ? (Math.random() > 0.5 ? 0.8 : -0.8) : 0,
      broken: false
    });
  };

  const startNewGame = (e) => {
    if (e) e.stopPropagation();
    const g = game.current;
    g.playing = true;
    g.dead = false;
    g.score = 0;
    g.px = W / 2;
    g.py = H - 100;
    g.vx = 0;
    g.vy = 0;
    g.isGrounded = true;
    g.cameraY = 0;

    // Platformy startowe
    g.platforms = [
      { x: W / 2 - 42, y: H - 50, w: 85, h: 12, type: "normal" },
      { x: W / 2 - 42, y: H - 110, w: 85, h: 12, type: "normal" }
    ];

    for (let i = 2; i < 16; i++) {
      spawnPlatform(g.platforms, H - 110 - i * 48);
    }

    setUiState({
      playing: true,
      dead: false,
      score: 0,
      best: g.best
    });
  };

  // Skok na kliknięcie
  const handleJump = () => {
    const g = game.current;
    if (g.playing && !g.dead && g.isGrounded) {
      g.vy = -7.5; // Wybicie w górę
      g.isGrounded = false;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Ruch w lewo/prawo podążający za kurkiem/palcem
    const handleMove = (e) => {
      if (!game.current.playing || game.current.dead) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const canvasX = ((clientX - rect.left) / rect.width) * W;

      if (canvasX > game.current.px) game.current.facingRight = true;
      if (canvasX < game.current.px) game.current.facingRight = false;

      game.current.px = canvasX;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("touchmove", handleMove);

    function loop() {
      const g = game.current;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0d1b2a");
      bg.addColorStop(0.5, "#1b263b");
      bg.addColorStop(1, "#415a77");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (g.playing && !g.dead) {
        // Grawitacja działa zawsze
        g.vy += 0.25;
        if (g.vy > 6) g.vy = 6;

        g.py += g.vy;

        // Zapętlanie przy krawędziach
        if (g.px < -15) g.px = W + 15;
        if (g.px > W + 15) g.px = -15;

        // Przesuwanie kamery w górę
        if (g.py < H / 2) {
          const diff = H / 2 - g.py;
          g.py = H / 2;
          g.cameraY += diff;
          g.score = Math.floor(g.cameraY / 10);

          if (g.score > g.best) {
            g.best = g.score;
            localStorage.setItem("jumper-best", String(g.best));
          }

          for (let i = g.platforms.length - 1; i >= 0; i--) {
            const p = g.platforms[i];
            p.y += diff;

            if (p.y > H + 20) {
              g.platforms.splice(i, 1);
              const highestY = Math.min(...g.platforms.map((pl) => pl.y));
              spawnPlatform(g.platforms, highestY - 48);
            }
          }
        }

        // Sprawdzanie lądowania na platformach
        let landed = false;
        if (g.vy >= 0) {
          for (const p of g.platforms) {
            if (p.broken) continue;

            if (
              g.px + 10 > p.x &&
              g.px - 10 < p.x + p.w &&
              g.py + 12 >= p.y &&
              g.py + 12 <= p.y + p.h + 6
            ) {
              if (p.type === "broken") {
                p.broken = true;
              } else if (p.type === "spring") {
                g.vy = -11; // Trampolina wyrzuca sama automatycznie
                g.isGrounded = false;
                landed = true;
              } else {
                // Lądowanie na zwykłej/ruchomej platformie
                g.py = p.y - 12;
                g.vy = 0;
                g.isGrounded = true;
                landed = true;

                // Jeśli stoi na ruchomej, podąża razem z nią
                if (p.type === "moving") {
                  g.px += p.vx;
                }
              }
            }
          }
        }

        if (!landed && g.vy > 0) {
          g.isGrounded = false;
        }

        // Ruch ruchomych platform
        for (const p of g.platforms) {
          if (p.type === "moving") {
            p.x += p.vx;
            if (p.x < 0 || p.x + p.w > W) p.vx *= -1;
          }
        }

        // Przegrana przy spadnięciu
        if (g.py > H + 40) {
          g.dead = true;
          setUiState({ playing: true, dead: true, score: g.score, best: g.best });
        }
      }

      // Rysowanie platform
      for (const p of g.platforms) {
        if (p.broken) continue;

        ctx.save();
        if (p.type === "normal") ctx.fillStyle = "#2ec4b6";
        if (p.type === "moving") ctx.fillStyle = "#3a86ff";
        if (p.type === "broken") ctx.fillStyle = "#ff0055";
        if (p.type === "spring") ctx.fillStyle = "#ffbe0b";

        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.fillStyle;

        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
        ctx.fill();

        if (p.type === "spring") {
          ctx.fillStyle = "#fff";
          ctx.fillRect(p.x + p.w / 2 - 8, p.y - 4, 16, 4);
        }

        ctx.restore();
      }

      // Rysowanie Mario
      if (g.playing) {
        drawMario(ctx, g.px, g.py, g.vy, g.facingRight);

        if (!g.dead) {
          ctx.fillStyle = "#fff";
          ctx.font = "700 24px system-ui";
          ctx.fillText(`✦ ${g.score}`, 24, 48);
        }
      }

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <main className="game" onClick={handleJump}>
      <canvas ref={canvasRef} />
      <div className="vignette" />

      {!uiState.playing && (
        <section className="overlay">
          <div className="eyebrow">✦ biocides.dev ✦</div>
          <h1>Mario</h1>
          <div className="button-group">
            <button onClick={startNewGame}>START</button>
            <button className="secondary" onClick={(e) => { e.stopPropagation(); onBackToMenu(); }}>MENU GŁÓWNE</button>
          </div>
          <div className="best">top score: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && uiState.dead && (
        <section className="overlay">
          <div className="eyebrow">SPADŁEŚ!</div>
          <h1>{uiState.score} ✦</h1>
          <p>Uważaj na krawędzie platform!</p>
          <div className="button-group">
            <button onClick={startNewGame}>ZAGRAJ ZNOWU</button>
            <button className="secondary" onClick={(e) => { e.stopPropagation(); onBackToMenu(); }}>MENU GŁÓWNE</button>
          </div>
          <div className="best">Rekord: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && !uiState.dead && <div className="hint">KLIKNIJ EKRAN = SKOK</div>}
    </main>
  );
}

/* ==========================================================================
   MENU GŁÓWNE (HUB GIER) I APKA GŁÓWNA
   ========================================================================== */

const GAMES = [
  { 
    id: "skyfish", 
    name: "Gwiazdki", 
    desc: "Zbieraj gwiazdki i omijaj bomby", 
    icon: "" 
  },
  { 
    id: "flappy", 
    name: "Kurczak", 
    desc: "przelot miedzy rurami", 
    icon: "" 
  },
  { 
    id: "jumper", 
    name: "Mario", 
    desc: "Skacz po platformach w gore", 
    icon: "" 
  }
];

function App() {
  const [activeGame, setActiveGame] = useState(null);

  // Renderowanie wybranej gry
  if (activeGame === "skyfish") {
    return <SkyFishGame onBackToMenu={() => setActiveGame(null)} />;
  }

  if (activeGame === "flappy") {
    return <FlappyGame onBackToMenu={() => setActiveGame(null)} />;
  }

  if (activeGame === "jumper") {
    return <StarJumperGame onBackToMenu={() => setActiveGame(null)} />;
  }

  // Wyświetlanie Menu Głównym (Gdy activeGame === null)
  return (
    <div className="hub-container">
      <header className="hub-header">
        <div className="eyebrow">✦ biocides.dev ✦</div>
        <h1>Wybierz gre</h1>
        <p></p>
      </header>

      <main className="games-grid">
        {GAMES.map((game) => (
          <article 
            key={game.id} 
            className="game-card"
            onClick={() => setActiveGame(game.id)}
          >
            <div className="game-icon">{game.icon}</div>
            <div className="game-info">
              <h2>{game.name}</h2>
              <p>{game.desc}</p>
            </div>
            <button className="play-btn">ZAGRAJ</button>
          </article>
        ))}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);