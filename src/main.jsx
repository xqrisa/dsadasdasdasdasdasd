import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const W = 390;
const H = 844;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

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

function Sin(a) { return Math.sin(a); }

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

function App() {
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
        g.vx = dx * 0.18;
        g.px += g.vx;
        g.px = clamp(g.px, 30, W - 30);

        g.distance += 3.3;
        g.trail.unshift({ x: g.px, y: g.py + 10 });
        if (g.trail.length > 22) g.trail.pop();

        while (g.lastY + g.distance > -1000) {
          spawnItem(g);
        }

        for (let i = g.items.length - 1; i >= 0; i--) {
          const item = g.items[i];
          const screenY = item.worldY + g.distance;
          item.spin += 0.05;

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
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= p.decay;

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

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("touchmove", handleMove);

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
          <div className="eyebrow">✦ rybka ✦</div>
          <h1>biocides.dev</h1>
          <p></p>
          <button onClick={startNewGame}>ZACZNIJ LOT</button>
          <div className="best">top score jurusia: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && uiState.dead && (
        <section className="overlay">
          <div className="eyebrow">KONIEC LOTU</div>
          <h1>{uiState.score} ✦</h1>
          <p>Rybka trafiła na bombę!</p>
          <button onClick={startNewGame}>LEĆ JESZCZE RAZ</button>
          <div className="best">Rekord: <b>{uiState.best}</b></div>
        </section>
      )}

      {uiState.playing && !uiState.dead && <div className="hint">PRZESUWAJ W LEWO / PRAWO</div>}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);