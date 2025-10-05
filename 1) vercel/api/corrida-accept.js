const { getDb } = require('../utils/dbHelper');
const { sendWhatsApp } = require('../utils/whatsappHelper');
module.exports = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    const db = await getDb();
    const ride = db.data.rides.find(r => r.id === rideId);
    if (!ride) return res.status(404).json({ error:'ride not found' });
    if (ride.status !== 'requested') return res.status(400).json({ error:'not available' });
    ride.status = 'accepted';
    ride.motoristaId = driverId;
    ride.accepted_at = new Date().toISOString();
    await db.write();
    await sendWhatsApp(ride.passenger, `Seu motorista (ID: ${driverId}) aceitou a corrida e está a caminho.`);
    res.json({ ok: true, ride });
  } catch (err) { console.error(err); res.status(500).json({ error:'internal' }); }
};
