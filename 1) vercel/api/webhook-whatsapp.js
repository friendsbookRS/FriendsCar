const axios = require('axios');
const shortid = require('shortid');
const { getDb } = require('../utils/dbHelper');
const { sendWhatsApp } = require('../utils/whatsappHelper');

module.exports = async (req, res) => {
  try {
    const payload = req.body;
    const text = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
    const from = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    if (!text || !from) return res.status(200).send('ok');

    const parts = text.split(';').map(p => p.trim());
    const origin = parts[0]?.replace(/^Pegar:\s*/i,'') || '';
    const destination = parts[1]?.replace(/^Levar:\s*/i,'') || '';

    const distanciaKm = 5;
    const tempoMin = 12;

    const tarifaBase = 3.00;
    const valorPorKm = 1.80;
    const valorPorMin = 0.20;
    const taxaEmbarque = 3.50;
    const manutencao = 1.00;

    const preco = Math.max(tarifaBase + (valorPorKm * distanciaKm) + (valorPorMin * tempoMin), tarifaBase);
    const precoRounded = Math.round(preco * 100) / 100;

    const db = await getDb();
    const ride = {
      id: shortid.generate(),
      passenger: from,
      origin,
      destination,
      distanciaKm,
      tempoMin,
      precoEstimado: precoRounded,
      taxaEmbarque,
      manutencao,
      status: 'requested',
      motoristaId: null,
      created_at: new Date().toISOString()
    };
    db.data.rides.push(ride);
    await db.write();

    const msg = `Olá 👋 sua corrida de ${origin} até ${destination} foi solicitada. Valor estimado: R$ ${precoRounded.toFixed(2)}.\nTaxa de embarque: R$ ${taxaEmbarque.toFixed(2)}.\nEscolha a forma de pagamento:\n1 - Pix\n2 - Cartão\n0 - Cancelar\nID: ${ride.id}`;
    await sendWhatsApp(from, msg);

    return res.status(200).send('ok');
  } catch (err) {
    console.error('webhook-whatsapp error', err);
    return res.status(500).json({ error: 'internal' });
  }
};
