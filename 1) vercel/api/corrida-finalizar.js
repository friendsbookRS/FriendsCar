const { getDb } = require('../utils/dbHelper');
const { gerarPixMercadoPago, gerarLinkCartaoMercadoPago } = require('../utils/paymentProviders');
const { sendWhatsApp } = require('../utils/whatsappHelper');

module.exports = async (req, res) => {
  try {
    const { rideId, metodo='pix' } = req.body;
    const db = await getDb();
    const ride = db.data.rides.find(r => r.id === rideId);
    if (!ride) return res.status(404).json({ error:'ride not found' });

    const valor = ride.precoEstimado;
    ride.status = 'finalized';
    ride.valorFinal = valor;
    ride.metodoPagamento = metodo;
    ride.updated_at = new Date().toISOString();

    let payment;
    if (metodo === 'pix') {
      payment = await gerarPixMercadoPago(valor, `Corrida #${ride.id}`, ride.id);
      const body = `🚗 Corrida finalizada!\nValor: R$ ${valor.toFixed(2)}\nPague via Pix (copia-e-cola):\n${payment.codigoPix || '[não disponível]'}\n\nQuando o pagamento for confirmado, sua corrida será atualizada.`;
      await sendWhatsApp(ride.passenger, body);
      ride.payment = { provider:'mercadopago', metodo:'pix', codigo: payment.codigoPix };
    } else {
      payment = await gerarLinkCartaoMercadoPago(valor, `Corrida #${ride.id}`, ride.id);
      const body = `🚗 Corrida finalizada!\nValor: R$ ${valor.toFixed(2)}\nPague com cartão no link:\n${payment.link}\n\nQuando o pagamento for confirmado, sua corrida será atualizada.`;
      await sendWhatsApp(ride.passenger, body);
      ride.payment = { provider:'mercadopago', metodo:'card', link: payment.link };
    }

    await db.write();
    res.json({ ok: true, ride, payment });
  } catch (err) { console.error('finalizar error', err); res.status(500).json({ error:'internal' }); }
};
