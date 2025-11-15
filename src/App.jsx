import React, { useState, useEffect } from "react";
import Game from "./Game";

const levels = [
  {
    name: "Livello 1",
    background: "/assets/images/1900.jpg",
    column: "/assets/images/colonna.png",
    image: "/assets/images/figlie-di-maria.jpg",
    description:
      "Opera 1:\nL'opera eclettica è realizzata dall'artista contemporaneo Patrizio Sannazzo. Lo stile emula quello delle sculture Atellane in età augustea"
  },
  {
    name: "Livello 2",
    background: "/assets/images/firenze.jpg",
    columnUp: "/assets/images/colonna.png",
    columnDown: "/assets/images/colonna.png",
    image: "/assets/images/400.jpg",
    description:
      "Opera 2:\nAncora oggi conserviamo i disegni preparatori originali di Raffaello Sanzio"
  },
  {
    name: "Livello 3",
    background: "/assets/images/1600.jpg",
    columnUp: "/assets/images/lvl3up.jpg",
    columnDown: "/assets/images/lvl3down.jpg",
    image: "/assets/images/700.jpeg",
    description:
      "Opera 3:\nCrocifisso barocco realizzato interamente in legno dipinto nel tardo XVIII secolo."
  },
  {
    name: "Livello 4",
    background: "/assets/images/1800.jpg",
    columnUp: "/assets/images/torru.png",
    columnDown: "/assets/images/torr.png",
    image: "/assets/images/800.jpe",
    description:
      "Opera 4:\nCalice del 1800 di autore sconosciuto, la sottocoppa in oro ospita 2 cherubini, un'effige di San Francesco e la Vergine col bambino."
  },
  {
    name: "Livello 5",
    background: "/assets/images/2000.jpg",
    columnUp: "/assets/images/2222.png",
    columnDown: "/assets/images/2222.png",
    image: "/assets/images/interno-chiesa-orta.jpg",
    description:
      "Opera 5:\nLuigi Marruzzella, artista Atellano sceglie di valorizzare il patrimonio locale, dipingendo i ricchi arredi originali della chiesa di San Massimo Vescovo."
  }
];

export default function App() {
  const [showVolantino, setShowVolantino] = useState(true);
  const [mode, setMode] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [restartKey, setRestartKey] = useState(0);
  const [storyPage, setStoryPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const storyImgs = [
    "/assets/images/imago1.jpg",
    "/assets/images/imago2.jpg",
    "/assets/images/imago3.jpg",
    "/assets/images/imago4.jpg",
    "/assets/images/imago5.jpg"
  ];

  // Aggiorna --vh dinamicamente per iOS
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  const startLevel = (index) => {
    if (!firstLoadDone) {
      setLoading(true);
      setTimeout(() => {
        setCurrentLevel(index);
        setRestartKey((k) => k + 1);
        setLoading(false);
        setFirstLoadDone(true);
      }, 1000);
    } else {
      setCurrentLevel(index);
      setRestartKey((k) => k + 1);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel === null) return;
    if (currentLevel + 1 < levels.length) {
      setCurrentLevel(currentLevel + 1);
      setRestartKey((k) => k + 1);
    } else {
      setMode(null);
      setCurrentLevel(null);
    }
  };

  // ---------------------------
  // VOLANTINO FULLSCREEN
  // ---------------------------
  if (showVolantino) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "calc(var(--vh, 1vh) * 100)",
          overflow: "hidden"
        }}
      >
        <img
          src="/assets/images/volantino.jpg"
          alt="Volantino"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
        <button
          onClick={() => setShowVolantino(false)}
          style={{
            position: "absolute",
            bottom: `calc(200px + env(safe-area-inset-bottom))`,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 22px",
            background: "gold",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 20,
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
          }}
        >
          Scopri di più
        </button>
      </div>
    );
  }

  // ---------------------------
  // MENU PRINCIPALE
  // ---------------------------
  if (!mode) {
    return (
      <div
        style={{
          width: "100%",
          height: "calc(var(--vh, 1vh) * 100)",
          background: "linear-gradient(180deg, #2c2c2c, #000)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "serif",
          textAlign: "center",
          padding: 12
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: 30, color: "gold" }}>
          Seleziona modalità
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: "center" }}>
          <div>
            <h2 style={{ color: "orange", marginBottom: 15 }}>🎮 Gioco</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => setMode("levels")}
                style={{ padding: "10px 18px", background: "gold", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Livelli
              </button>
              <button
                onClick={() => setMode("arcade")}
                style={{ padding: "10px 18px", background: "orange", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Arcade
              </button>
            </div>
          </div>

          <div>
            <h2 style={{ color: "lightblue", marginBottom: 15 }}>ℹ️ Informazioni</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => window.open("https://www.instagram.com/parrocchiasanmassimoo/", "_blank")}
                style={{ padding: "10px 18px", background: "teal", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Instagram
              </button>
              <button
                onClick={() => window.open("https://facebook.com/groups/218139638344704/", "_blank")}
                style={{ padding: "10px 18px", background: "#1877f2", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Facebook
              </button>
              <button
                onClick={() => { setMode("storia"); setStoryPage(0); }}
                style={{ padding: "10px 18px", background: "purple", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Storia
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------
  // STORIA
  // ---------------------------
  if (mode === "storia") {
    const img = storyImgs[storyPage];
    return (
      <div
        style={{
          width: "100%",
          height: "calc(var(--vh, 1vh) * 100)",
          background: "#111",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
          padding: 12
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: 500,
            aspectRatio: "2 / 3",
            marginBottom: 20,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(255,255,255,0.3)"
          }}
        >
          <img src={img} alt={`imago${storyPage + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        {storyPage < storyImgs.length - 1 ? (
          <button
            onClick={() => setStoryPage(storyPage + 1)}
            style={{ padding: "12px 20px", background: "gold", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Continua
          </button>
        ) : (
          <button
            onClick={() => setMode(null)}
            style={{ padding: "12px 20px", background: "crimson", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Torna al menu
          </button>
        )}
      </div>
    );
  }

  // ---------------------------
  // SCELTA LIVELLO
  // ---------------------------
  if (mode === "levels" && currentLevel === null) {
    return (
      <div
        style={{
          width: "100%",
          height: "calc(var(--vh, 1vh) * 100)",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 12
        }}
      >
        <h1>Seleziona livello</h1>
        {loading ? (
          <p style={{ marginTop: 20, fontSize: "1.2rem", color: "gold" }}>Caricamento...</p>
        ) : (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {levels.map((lvl, idx) => (
              <button
                key={idx}
                onClick={() => startLevel(idx)}
                style={{ padding: "10px 18px", background: "gold", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                {lvl.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------
  // GIOCO
  // ---------------------------
  const levelObj = mode === "arcade" ? null : levels[currentLevel];
  return (
    <Game
      key={`${mode}-${currentLevel}-${restartKey}`}
      level={levelObj}
      mode={mode}
      currentLevel={currentLevel}
      onNextLevel={handleNextLevel}
      onExit={() => { setMode(null); setCurrentLevel(null); }}
    />
  );
}
