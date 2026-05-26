
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

  console.log("WEBHOOK RECEBIDO:", req.body);

  if (req.body.event !== 'PURCHASE_APPROVED') {
    res.sendStatus(200);
return;

  const email = req.body?.data?.buyer?.email;
  const transaction = req.body?.data?.purchase?.transaction;

  const token = crypto.randomBytes(24).toString('hex');

  const accessLink =
    `https://oraculohotmart-backend.onrender.com/acesso.html?token=${token}`;

  console.log("LINK DE ACESSO:", accessLink);
  console.log("TOKEN GERADO:", token);

  tokens[token] = {
    email,
    transaction,
    usado: false,
    criadoEm: Date.now()
  };

  return res.sendStatus(200);
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor rodando');
});
