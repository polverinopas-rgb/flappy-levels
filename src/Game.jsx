import React, { useEffect, useRef, useState } from "react";

/**
 * Game.jsx - versione corretta per far funzionare Restart su iPhone/Safari
 * - Restart ora riavvia correttamente il loop di gioco
 * - loop è memorizzato in loopRef per poterlo avviare/fermre da qualsiasi funzione
 */

export default function Game({
  level = null,
  mode = "arcade",
  currentLevel = 0,
  onNextLevel = () => {},
  onExit = () => {}
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // "stato caldo" usato nel loop
  const bird = useRef({ x: 100, y: 320, radius: 15, vy: 0 });
  const pipes = useRef([]);
  const columnImg = useRef(null);
  const columnUpImg = useRef(null);
  const columnDownImg = useRef(null);
  const bgImg = useRef(null);

  // UI react-state (solo per mostrare informazioni)
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const isGameOverRef = useRef(false);

  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  const isLevelCompletedRef = useRef(false);

  // constants
  const CANVAS_W = 360;
  const CANVAS_H = 640;
  const gravity = 0.5;
  const jumpStrength = -8;
  const basePipeWidth = 60;
  const baseGap = 200;
  const baseSpeed = 3;
  const targetScore = 4;

  const pipeColorByLevel = [
    "#3A5F0B",
    "#4E9F3D",
    "#2C7BB6",
    "#D95F02",
    "#A50F15"
  ];

  // loop / timing helpers
  const loopRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  // carica immagini bg/colonna
  useEffect(() => {
    if (level?.column) {
      const img = new Image();
      img.src = level.column;
      img.onload = () => {
        columnImg.current = img;
      };
      img.onerror = () => {
        columnImg.current = null;
      };
    } else columnImg.current = null;

    if (level?.columnUp) {
      const imgUp = new Image();
      imgUp.src = level.columnUp;
      imgUp.onload = () => {
        columnUpImg.current = imgUp;
      };
      imgUp.onerror = () => {
        columnUpImg.current = null;
      };
    } else columnUpImg.current = null;

    if (level?.columnDown) {
      const imgDown = new Image();
      imgDown.src = level.columnDown;
      imgDown.onload = () => {
        columnDownImg.current = imgDown;
      };
      imgDown.onerror = () => {
        columnDownImg.current = null;
      };
    } else columnDownImg.current = null;

    if (level?.background) {
      const b = new Image();
      b.src = level.background;
      b.onload = () => {
        bgImg.current = b;
      };
      b.onerror = () => {
        bgImg.current = null;
      };
    } else bgImg.current = null;
  }, [level]);

  // reset gioco
  const resetGame = () => {
    bird.current = { x: 100, y: CANVAS_H / 2, radius: 15, vy: 0 };
    pipes.current = [
      { x: CANVAS_W + 10, height: 180, passed: false },
      { x: CANVAS_W + 260, height: 140, passed: false }
    ];
    scoreRef.current = 0;
    setScore(0);
    isGameOverRef.current = false;
    setIsGameOver(false);
    isLevelCompletedRef.current = false;
    setIsLevelCompleted(false);

    // assicurati che il canvas abbia dimensioni corrette (utile su iOS)
    if (canvasRef.current) {
      canvasRef.current.width = CANVAS_W;
      canvasRef.current.height = CANVAS_H;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    }
  };

  // input: jump via pointerdown (migliore per mobile) e space
  useEffect(() => {
    const handleJump = (e) => {
      // evita di saltare quando game over / milestone
      if (isGameOverRef.current || isLevelCompletedRef.current) return;
      // su eventi pointerdown / click
      if (e.type === "pointerdown" || e.type === "click" || e.type === "touchstart") {
        // previeni scroll su iOS quando necessario
        if (e.cancelable) e.preventDefault();
        bird.current.vy = jumpStrength;
      } else if (e.code === "Space") {
        bird.current.vy = jumpStrength;
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("pointerdown", handleJump);
      // anche touchstart per compatibilità extra
      canvas.addEventListener("touchstart", handleJump, { passive: false });
    }
    window.addEventListener("keydown", handleJump);

    return () => {
      if (canvas) {
        canvas.removeEventListener("pointerdown", handleJump);
        canvas.removeEventListener("touchstart", handleJump);
      }
      window.removeEventListener("keydown", handleJump);
    };
  }, []);

  // collision helper
  const circleRectCollision = (cx, cy, r, rx, ry, rw, rh) => {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < r * r;
  };

  // definizione del loop memorizzata in loopRef (riutilizzabile)
  useEffect(() => {
    loopRef.current = function loop(time) {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(loopRef.current);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(loopRef.current);
        return;
      }

      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const delta = dt / 16.67; // normalizza a 60fps

      // fisica
      bird.current.vy += gravity * delta;
      bird.current.y += bird.current.vy * delta;

      const levelFactor = mode === "levels" ? 1 + (currentLevel || 0) * 0.05 : 1;
      const arcadeFactor = mode === "arcade" ? 1 + scoreRef.current * 0.02 : 1;
      const difficulty = levelFactor * arcadeFactor;

      const gap = Math.max(120, baseGap / difficulty);
      const pipeWidth = mode === "levels" && currentLevel === 0 ? Math.round(basePipeWidth * 0.75) : basePipeWidth;
      const speed = baseSpeed * difficulty;

      // background
      if (bgImg.current) ctx.drawImage(bgImg.current, 0, 0, CANVAS_W, CANVAS_H);
      else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      // bird
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(bird.current.x, bird.current.y, bird.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      // genera pipes
      if (pipes.current.length === 0 || pipes.current[pipes.current.length - 1].x < CANVAS_W - 220) {
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
          if (columnUpImg.current) ctx.drawImage(columnUpImg.current, pipe.x, 0, pipeWidth, pipe.height);
          else {
            ctx.fillStyle = pipeColorByLevel[currentLevel] || "#2ecc71";
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
          }

          if (columnDownImg.current) ctx.drawImage(columnDownImg.current, pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap);
          else {
            ctx.fillStyle = pipeColorByLevel[currentLevel] || "#2ecc71";
            ctx.fillRect(pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap);
          }
        } else {
          ctx.fillStyle = pipeColorByLevel[currentLevel] || "#2ecc71";
          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
          ctx.fillRect(pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap);
        }

        // collisione
        if (
          circleRectCollision(bird.current.x, bird.current.y, bird.current.radius, pipe.x, 0, pipeWidth, pipe.height) ||
          circleRectCollision(bird.current.x, bird.current.y, bird.current.radius, pipe.x, pipe.height + gap, pipeWidth, CANVAS_H - pipe.height - gap)
        ) {
          isGameOverRef.current = true;
          setIsGameOver(true);
        }

        // punteggio
        if (!pipe.passed && pipe.x + pipeWidth < bird.current.x) {
          pipe.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }

      while (pipes.current.length && pipes.current[0].x + pipeWidth < 0) pipes.current.shift();

      // confini
      if (bird.current.y + bird.current.radius > CANVAS_H || bird.current.y - bird.current.radius < 0) {
        isGameOverRef.current = true;
        setIsGameOver(true);
      }

      // disegna score
      ctx.fillStyle = "#fff";
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${scoreRef.current}`, 20, 40);

      // milestone
      if (mode === "levels" && scoreRef.current >= targetScore) {
        isLevelCompletedRef.current = true;
        setIsLevelCompleted(true);
      }

      // continua il loop solo se non siamo in game over / milestone
      if (!isGameOverRef.current && !isLevelCompletedRef.current) {
        rafRef.current = requestAnimationFrame(loopRef.current);
      } else {
        rafRef.current = null;
      }
    };

    // quando il component monta, reset + start
    resetGame();
    startLoop();

    // pulizia sul dismount
    return () => {
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, mode, currentLevel]); // ri-crea loop quando cambia il livello / modalità

  // helpers per start/stop loop
  function startLoop() {
    // cancella eventuale raf precedente
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // reset tempo per evitare grandi dt
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loopRef.current);
  }

  function stopLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // restart che ora riavvia il loop
  const handleRestart = () => {
    resetGame();
    // riporta lo stato booleano UI a false
    setIsGameOver(false);
    setIsLevelCompleted(false);
    // riavvia il loop
    startLoop();
  };

  const handleNext = () => {
    resetGame();
    onNextLevel();
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, margin: "auto" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ background: "#000", display: "block", touchAction: "none" }}
      />

      {isGameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12
          }}
        >
          <h2>Game Over</h2>
          <p>Punteggio: {score}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleRestart} style={{ padding: "10px 18px", background: "gold", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Restart
            </button>
            <button onClick={() => { stopLoop(); onExit(); }} style={{ padding: "10px 18px", background: "gray", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Menu
            </button>
          </div>
        </div>
      )}

      {isLevelCompleted && level && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
          <h1 style={{ color: "gold", marginBottom: 6 }}>Milestone!</h1>
          <h2>{level.name} completato!</h2>
          <img src={level.image} alt={level.name} style={{ width: "80%", borderRadius: 8, marginTop: 12 }} />
          <p style={{ whiteSpace: "pre-line", textAlign: "center", marginTop: 10 }}>{level.description}</p>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={handleNext} style={{ padding: "10px 18px", background: "gold", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Vai al livello successivo
            </button>
            <button onClick={() => { stopLoop(); onExit(); }} style={{ padding: "10px 18px", background: "gray", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
