import React, { useEffect, useRef, useState } from "react";

/**
 * Game.jsx
 * - level: object or null (arcade)
 * - mode: "levels" | "arcade"
 * - currentLevel: index (0..)
 * - onNextLevel: callback
 * - onExit: callback
 *
 * NOTE: usa immagini in public/assets/images
 */

export default function Game({ level = null, mode = "arcade", currentLevel = 0, onNextLevel = () => {}, onExit = () => {} }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // game state
  const bird = useRef({ x: 100, y: 320, radius: 15, vy: 0 });
  const pipes = useRef([]);
  const columnImg = useRef(null);
  const columnUpImg = useRef(null);
  const columnDownImg = useRef(null);
  const bgImg = useRef(null);

  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);

  // constants
  const CANVAS_W = 360;
  const CANVAS_H = 640;
  const gravity = 0.5;
  const jumpStrength = -8;
  const basePipeWidth = 60;
  const baseGap = 200;
  const baseSpeed = 3;
  const targetScore = 4; // target per livello

  const pipeColorByLevel = [
    "#3A5F0B", // livello 1
    "#4E9F3D", // livello 2
    "#2C7BB6", // livello 3
    "#D95F02", // livello 4
    "#A50F15", // livello 5
  ];

  // carica immagini bg/colonna
  useEffect(() => {
    // column
    if (level?.column) {
      const img = new Image();
      img.src = level.column;
      img.onload = () => { columnImg.current = img; };
      img.onerror = () => { columnImg.current = null; };
    } else columnImg.current = null;

    if (level?.columnUp) {
      const imgUp = new Image();
      imgUp.src = level.columnUp;
      imgUp.onload = () => { columnUpImg.current = imgUp; };
      imgUp.onerror = () => { columnUpImg.current = null; };
    } else columnUpImg.current = null;

    if (level?.columnDown) {
      const imgDown = new Image();
      imgDown.src = level.columnDown;
      imgDown.onload = () => { columnDownImg.current = imgDown; };
      imgDown.onerror = () => { columnDownImg.current = null; };
    } else columnDownImg.current = null;

    if (level?.background) {
      const b = new Image();
      b.src = level.background;
      b.onload = () => { bgImg.current = b; };
      b.onerror = () => { bgImg.current = null; };
    } else bgImg.current = null;
  }, [level]);

  // reset gioco
  const resetGame = () => {
    bird.current = { x: 100, y: CANVAS_H / 2, radius: 15, vy: 0 };
    pipes.current = [
      { x: CANVAS_W + 10, height: 180, passed: false },
      { x: CANVAS_W + 260, height: 140, passed: false },
    ];
    setScore(0);
    setIsGameOver(false);
    setIsLevelCompleted(false);
  };

  useEffect(() => {
    resetGame();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [level, mode, currentLevel]);

  // input
  useEffect(() => {
    const handleJump = (e) => {
      if (isGameOver || isLevelCompleted) return;
      if (e.type === "click" || e.type === "touchstart") bird.current.vy = jumpStrength;
      else if (e.code === "Space") bird.current.vy = jumpStrength;
    };
    window.addEventListener("keydown", handleJump);
    window.addEventListener("click", handleJump);
    window.addEventListener("touchstart", handleJump, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleJump);
      window.removeEventListener("click", handleJump);
      window.removeEventListener("touchstart", handleJump);
    };
  }, [isGameOver, isLevelCompleted]);

  const circleRectCollision = (cx, cy, r, rx, ry, rw, rh) => {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (r * r);
  };

  // loop principale
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastTime = performance.now();

    const loop = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      const delta = dt / 16.67; // normalizza a 60fps
      bird.current.vy += gravity * delta;
      bird.current.y += bird.current.vy * delta;

      const levelFactor = mode === "levels" ? 1 + (currentLevel || 0) * 0.05 : 1;
      const arcadeFactor = mode === "arcade" ? 1 + score * 0.02 : 1;
      const difficulty = levelFactor * arcadeFactor;

      const gap = Math.max(120, baseGap / difficulty);
      const pipeWidth = (mode === "levels" && currentLevel === 0) ? Math.round(basePipeWidth * 0.75) : basePipeWidth;
      const speed = baseSpeed * difficulty;

      // background
      if (bgImg.current) ctx.drawImage(bgImg.current, 0, 0, CANVAS_W, CANVAS_H);
      else { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }

      // bird
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(bird.current.x, bird.current.y, bird.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      // genera pipes
      if (pipes.current.length === 0 || (pipes.current[pipes.current.length - 1].x < CANVAS_W - 220)) {
        const h = Math.random() * (CANVAS_H - gap - 120) + 40;
        pipes.current.push({ x: CANVAS_W + 10, height: h, passed: false });
      }

      // muovi + disegna pipes
      for (let i = 0; i < pipes.current.length; i++) {
        const pipe = pipes.current[i];
        pipe.x -= speed * delta;

        // disegna pipe
        if (columnImg.current && currentLevel === 0) {
          ctx.drawImage(columnImg.current, pipe.x, 0, pipeWidth, pipe.height);
          ctx.drawImage(columnImg.current, pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap);
        } else if (columnUpImg.current || columnDownImg.current) {
          // top
          if (columnUpImg.current) ctx.drawImage(columnUpImg.current, pipe.x, 0, pipeWidth, pipe.height);
          else { ctx.fillStyle = pipeColorByLevel[currentLevel] || "#2ecc71"; ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height); }

          // bottom
          if (columnDownImg.current) ctx.drawImage(columnDownImg.current, pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap);
          else { ctx.fillStyle = pipeColorByLevel[currentLevel] || "#2ecc71"; ctx.fillRect(pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap); }
        } else {
          ctx.fillStyle = pipeColorByLevel[currentLevel] || "#2ecc71";
          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
          ctx.fillRect(pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap);
        }

        // collisione
        if (circleRectCollision(bird.current.x, bird.current.y, bird.current.radius, pipe.x, 0, pipeWidth, pipe.height) ||
            circleRectCollision(bird.current.x, bird.current.y, bird.current.radius, pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap)) {
          setIsGameOver(true);
        }

        // punteggio
        if (!pipe.passed && pipe.x + pipeWidth < bird.current.x) {
          pipe.passed = true;
          setScore(s => s + 1);
        }
      }

      while (pipes.current.length && (pipes.current[0].x + pipeWidth < 0)) pipes.current.shift();

      // confini
      if (bird.current.y + bird.current.radius > CANVAS_H || bird.current.y - bird.current.radius < 0) setIsGameOver(true);

      // disegna score
      ctx.fillStyle = "#fff";
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${score}`, 20, 40);

      // milestone
      if (mode === "levels" && score >= targetScore) setIsLevelCompleted(true);

      if (!isGameOver && !isLevelCompleted) rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [score, isGameOver, isLevelCompleted, level, mode, currentLevel]);

  const handleRestart = () => { resetGame(); };
  const handleNext = () => { resetGame(); onNextLevel(); };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, margin: "auto" }}>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ background: "#000", display: "block" }} />

      {isGameOver && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.75)", color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12
        }}>
          <h2>Game Over</h2>
          <p>Punteggio: {score}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleRestart} style={{ padding: "10px 18px", background: "gold", border: "none", borderRadius: 8, cursor: "pointer" }}>Restart</button>
            <button onClick={() => { onExit(); }} style={{ padding: "10px 18px", background: "gray", border: "none", borderRadius: 8, cursor: "pointer" }}>Menu</button>
          </div>
        </div>
      )}

      {isLevelCompleted && level && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.75)", color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 16
        }}>
          <h1 style={{ color: "gold", marginBottom: 6 }}>Milestone!</h1>
          <h2>{level.name} completato!</h2>
          <img src={level.image} alt={level.name} style={{ width: "80%", borderRadius: 8, marginTop: 12 }} />
          <p style={{ whiteSpace: "pre-line", textAlign: "center", marginTop: 10 }}>{level.description}</p>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={handleNext} style={{ padding: "10px 18px", background: "gold", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Vai al livello successivo
            </button>
            <button onClick={() => { onExit(); }} style={{ padding: "10px 18px", background: "gray", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}