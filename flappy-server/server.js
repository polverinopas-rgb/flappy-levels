import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let scores = [];

// Invia punteggio e riceve posizione
app.post("/submit-score", (req, res) => {
  const { name, score } = req.body;
  scores.push({ name, score });
  scores.sort((a, b) => b.score - a.score);
  const position = scores.findIndex((s) => s.name === name) + 1;
  res.json({ position });
});

// Recupera lista punteggi
app.get("/scores", (req, res) => {
  res.json(scores);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

