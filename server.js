const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// FRONTEND
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// BANCO PERSISTENTE
// =======================

const DB_FILE = path.join(__dirname, 'tokens.json');

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// =======================
// HOME
// =======================

app.get('/', (req, res) => {
  res.send('Backend Oráculo Online');
});

// =======================
// VALIDAR TOKEN
// =======================

app.post('/validar-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.json({ valido: false });
  }

  const db = loadDB();
  const data = db[token];

  if (!data || data.usado) {
    return res.json({ valido: false });
  }

  return res.json({ valido: true });
});

// =======================
// CONSUMIR TOKEN (1 USO)
// =======================

app.post('/finalizar-leitura', (req, res) => {
  const { token } = req.body;

  const db = loadDB();

  if (db[token]) {
    db[token].usado = true;
    db[token].usadoEm = Date.now();
    saveDB(db);
  }

  return res.json({ ok: true });
});

// =======================
// WEBHOOK HOTMART
// =======================

app.post('/webhook/hotmart', (req, res) => {
  console.log('WEBHOOK RECEBIDO:', req.body);

  if (req.body.event !== 'PURCHASE_APPROVED') {
    return res.sendStatus(200);
  }

  const email = req.body?.data?.buyer?.email;
  const transaction = req.body?.data?.purchase?.transaction;

  const token = crypto.randomBytes(24).toString('hex');

  const db = loadDB();

  db[token] = {
    email,
    transaction,
    usado: false,
    criadoEm: Date.now()
  };

  saveDB(db);

  const accessLink =
    `https://oraculohotmart-backend.onrender.com/acesso.html?token=${token}`;

  console.log('TOKEN GERADO:', token);
  console.log('LINK DE ACESSO:', accessLink);

  return res.sendStatus(200);
});

// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});
