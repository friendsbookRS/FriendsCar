const { getDb } = require('../utils/dbHelper');
const { sendWhatsApp } = require('../utils/whatsappHelper');
module.exports = async (req, res) => {
  try {
    const body = req.body;
    const rideId = body.rideId || body.external_reference || (body.data && body.data.id);
    const status = body.status || body.payment_status || (body.data && body.data.status);
    if (!rideId) return res.status(400).json({ error:'missing rideId' });
    const db = await getDb();
    const ride = db.data.rides.find(r => r.id === rideId);
    if (!ride) return res.status(404).json({ error:'ride not found' });

    if (status === 'paid' || status === 'approved' || status === 'success') {
      ride.status = 'paid';
      ride.pago_em = new Date().toISOString();
      const manutencao = ride.manutencao || 1.00;
      const valor = ride.valorFinal || ride.precoEstimado;
      ride.retencao = manutencao;
      ride.driverRecebe = Math.round((valor - manutencao) * 100) / 100;
      await db.write();
      await sendWhatsApp(ride.motoristaId || ride.passenger, `✅ Pagamento confirmado para a corrida ${ride.id}. Motorista recebe R$ ${ride.driverRecebe.toFixed(2)}.`);
      return res.json({ ok: true, ride });
    }
    return res.json({ ok: false, received: body });
  } catch (err) { console.error('pagamento.confirmar error', err); res.status(500).json({ error:'internal' }); }
};
