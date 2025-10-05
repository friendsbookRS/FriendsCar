const shortid = require('shortid');
const { getDb } = require('../utils/dbHelper');
module.exports = async (req, res) => {
  try {
    const { passenger, origin, destination, distanciaKm=5, tempoMin=12 } = req.body;
    const tarifaBase = 3.00;
    const valorPorKm = 1.80;
    const valorPorMin = 0.20;
    const taxaEmbarque = 3.50;
    const manutencao = 1.00;
    const preco = Math.max(tarifaBase + (valorPorKm * distanciaKm) + (valorPorMin * tempoMin), tarifaBase);
    const precoRounded = Math.round(preco*100)/100;
    const db = await getDb();
    const ride = { id: shortid.generate(), passenger, origin, destination, distanciaKm, tempoMin, precoEstimado: precoRounded, taxaEmbarque, manutencao, status:'requested', created_at: new Date().toISOString() };
    db.data.rides.push(ride);
    await db.write();
    res.json({ ok: true, ride });
  } catch (err) { console.error(err); res.status(500).json({ error:'internal' }); }
};
