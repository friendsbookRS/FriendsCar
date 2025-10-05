const axios = require('axios');
async function sendWhatsApp(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    console.log('[whatsapp] missing token or phone id. Message:', text);
    return;
  }
  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
  await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    text: { body: text }
  }, { headers: { Authorization: `Bearer ${token}` } });
}
module.exports = { sendWhatsApp };
