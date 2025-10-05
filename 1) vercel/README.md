# Ride Bot Vercel - Completo (Mercado Pago + WhatsApp)

Este projeto foi gerado para deploy no Vercel (serverless functions).
Taxa de embarque: R$ 3.50
Retenção da plataforma por corrida: R$ 1.00

## Como usar
1. Faça upload deste projeto no seu repositório ou direto no painel do Vercel.
2. Configure as variáveis de ambiente no Vercel (veja `.env.example`).
3. Rode `vercel dev` localmente para testar ou apenas deploy no Vercel.
4. Configure o webhook do WhatsApp Cloud API para apontar para: `https://<seu-projeto>.vercel.app/api/webhook-whatsapp`
5. Configure notificações do Mercado Pago (opcional) para `https://<seu-projeto>.vercel.app/api/pagamento-confirmar`.

Observação: este é um projeto pronto para POC. Em produção, valide os webhooks e migre para um DB gerenciado (MongoDB, Postgres) se necessário.
