const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let tokens = {};

if (fs.existsSync("tokens.json")) {
  tokens = JSON.parse(fs.readFileSync("tokens.json"));
}

/* =========================
   HOTMART WEBHOOK
========================= */

app.post("/webhook", (req, res) => {

  const data = req.body;

  // pagamento aprovado
  if (data.event === "PURCHASE_APPROVED") {

    const token = gerarToken();

    tokens[token] = {
      usado: false,
      criado: Date.now()
    };

    salvarTokens();

    console.log("TOKEN GERADO:", token);
  }

  res.sendStatus(200);
});

/* =========================
   VALIDAR TOKEN
========================= */

app.post("/validar-token", (req, res) => {

  const { token } = req.body;

  if (!tokens[token]) {
    return res.json({
      valido: false
    });
  }

  if (tokens[token].usado) {
    return res.json({
      valido: false
    });
  }

  res.json({
    valido: true
  });
});

/* =========================
   USAR TOKEN
========================= */

app.post("/usar-token", (req, res) => {

  const { token } = req.body;

  if (tokens[token]) {

    tokens[token].usado = true;

    salvarTokens();
  }

  res.sendStatus(200);
});

/* =========================
   FUNÇÕES
========================= */

function gerarToken() {
  return Math.random().toString(36).substring(2, 15);
}

function salvarTokens() {
  fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2));
}

app.listen(PORT, () => {
  console.log("Servidor rodando");
});
