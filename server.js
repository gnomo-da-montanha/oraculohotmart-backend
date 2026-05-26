const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   BANCO TEMPORÁRIO
========================= */

const tokens = {};

/* =========================
   TESTE
========================= */

app.get('/', (req,res)=>{

  res.send('Backend Oráculo Online');

});

/* =========================
   CRIAR TOKEN
========================= */

app.post('/criar-token', (req,res)=>{

  const token = crypto.randomBytes(24).toString('hex');

  tokens[token] = {
    usado:false,
    criadoEm:Date.now()
  };

  res.json({
    token
  });

});

/* =========================
   VALIDAR TOKEN
========================= */

app.post('/validar-token', (req,res)=>{

  const { token } = req.body;

  if(!token){

    return res.json({
      valido:false
    });

  }

  const dados = tokens[token];

  if(!dados){

    return res.json({
      valido:false
    });

  }

  if(dados.usado){

    return res.json({
      valido:false
    });

  }

  res.json({
    valido:true
  });

});

/* =========================
   USAR TOKEN
========================= */

app.post('/finalizar-leitura', (req, res) => {

  const { token } = req.body;

  if (tokens[token]) {
    tokens[token].usado = true;
  }

  res.json({ ok: true });

});
app.post('/webhook/hotmart', (req, res) => {

  console.log('WEBHOOK RECEBIDO:', req.body);
const crypto = require('crypto');
const fs = require('fs');

app.post('/webhook/hotmart', (req, res) => {

  console.log("WEBHOOK RECEBIDO:", req.body);

  if (req.body.event !== 'PURCHASE_APPROVED') {
    return res.sendStatus(200);
  }

  const token = crypto.randomBytes(20).toString('hex');

  let db = {};
  try {
    db = JSON.parse(fs.readFileSync('./tokens.json'));
  } catch (e) {
    db = {};
  }

  db[token] = {
    status: "active",
    createdAt: Date.now()
  };

  fs.writeFileSync('./tokens.json', JSON.stringify(db, null, 2));

  console.log("TOKEN GERADO:", token);

  res.sendStatus(200);
});
  const email = req.body?.data?.buyer?.email || req.body?.data?.email;
  const transaction = req.body?.data?.purchase?.transaction || req.body?.data?.transaction;

  const token = crypto.randomBytes(24).toString('hex');
  const accessLink = `https://SEU-USUARIO.github.io/SEU-REPO/acesso.html?token=${token}`;

console.log("LINK DE ACESSO:", accessLink);

  tokens[token] = {
    email,
    transaction,
    usado: false,
    criadoEm: Date.now()
  };

  console.log('TOKEN GERADO:', token);

  res.json({ ok: true });

});
app.get('/gerar-acesso', (req,res)=>{

  const token = crypto.randomBytes(24).toString('hex');

  tokens[token] = {
    usado:false,
    criadoEm:Date.now()
  };

  res.redirect(
  `https://gnomo-da-montanha.github.io/oraculohotmart/acesso.html?token=${token}`
);

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{

  console.log('Servidor rodando');

});
