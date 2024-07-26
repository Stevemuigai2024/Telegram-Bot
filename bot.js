const { Telegraf } = require('telegraf');
const express = require('express');
const { createPayment: createPaypalPayment, executePayment } = require('./paypal');
const { createPayment: createMpesaPayment } = require('./mpesa');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => {
  ctx.reply('Welcome! You can buy movies here. Type /buy to start.');
});

bot.command('buy', (ctx) => {
  ctx.reply('Choose your payment method:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'PayPal', callback_data: 'paypal' }],
        [{ text: 'M-Pesa', callback_data: 'mpesa' }]
      ]
    }
  });
});

bot.action('paypal', async (ctx) => {
  try {
    const payment = await createPaypalPayment('5.00');
    const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
    ctx.reply(`Please pay using this link: ${approvalUrl}`);
  } catch (error) {
    console.error(error);
    ctx.reply('Failed to create PayPal payment. Please try again later.');
  }
});

bot.action('mpesa', (ctx) => {
  ctx.reply('Please enter your phone number (in the format 2547XXXXXXXX):');
  bot.on('text', async (ctx) => {
    const phone = ctx.message.text;
    try {
      await createMpesaPayment('500', phone); // Amount in KES
      ctx.reply('Payment request sent. Please check your phone to complete the transaction.');
    } catch (error) {
      console.error(error);
      ctx.reply('Failed to create M-Pesa payment. Please try again later.');
    }
  });
});

bot.launch();

const app = express();

app.get('/success', (req, res) => {
  const { paymentId, PayerID } = req.query;
  executePayment(paymentId, PayerID).then(() => {
    res.send('Payment successful. Your movie will be sent shortly.');
  }).catch((error) => {
    console.error(error);
    res.send('Payment failed. Please try again.');
  });
});

app.get('/cancel', (req, res) => {
  res.send('Payment cancelled.');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
