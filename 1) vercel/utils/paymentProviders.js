/**
 * paymentProviders.js
 * Mercado Pago integration (Pix and Card) for serverless env.
 * Requires MERCADOPAGO_ACCESS_TOKEN in env.
 */

const axios = require('axios');
const qrcode = require('qrcode');

const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

async function gerarPixMercadoPago(valor, descricao, referenceId) {
  if (!MP_TOKEN) throw new Error('MERCADOPAGO_ACCESS_TOKEN not set');
  // Create a payment with payment_method_id 'pix'
  const body = {
    transaction_amount: Number(valor),
    description: descricao,
    payment_method_id: 'pix',
    external_reference: referenceId,
    payer: { email: 'not_provided@domain.com' }
  };
  const resp = await axios.post('https://api.mercadopago.com/v1/payments', body, { headers: { Authorization: `Bearer ${MP_TOKEN}` } });
  const data = resp.data;
  const tx = data.point_of_interaction?.transaction_data || {};
  const codigo = tx.qr_code || null;
  const qrBase64 = tx.qr_code_base64 || null;
  let qrImageBase64 = qrBase64;
  if (!qrImageBase64 && codigo) {
    qrImageBase64 = await qrcode.toDataURL(codigo);
  }
  return { codigoPix: codigo, qrCodeBase64: qrImageBase64, raw: data };
}

async function gerarLinkCartaoMercadoPago(valor, descricao, referenceId) {
  if (!MP_TOKEN) throw new Error('MERCADOPAGO_ACCESS_TOKEN not set');
  const pref = {
    items: [{ title: descricao, quantity: 1, unit_price: Number(valor) }],
    external_reference: referenceId,
    back_urls: {
      success: (process.env.BASE_URL || '') + '/pagamento/sucesso',
      failure: (process.env.BASE_URL || '') + '/pagamento/falha',
      pending: (process.env.BASE_URL || '') + '/pagamento/pendente'
    },
    auto_return: 'approved'
  };
  const resp = await axios.post('https://api.mercadopago.com/checkout/preferences', pref, { headers: { Authorization: `Bearer ${MP_TOKEN}` } });
  return { link: resp.data.init_point, preferenceId: resp.data.id, raw: resp.data };
}

module.exports = { gerarPixMercadoPago, gerarLinkCartaoMercadoPago };
