
require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { createPayment, executePayment } = require('./paypal.js');
const { initializeMpesa } = require('./mpesa.js');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const app = express();

// Your existing bot and server setup code

try {
  bot.command('start', (ctx) => {
    ctx.reply('Welcome to the Telegram Movie Bot!');
  });

  // Handle payment creation
  bot.command('buy', async (ctx) => {
    try {
      const amount = '10.00'; // Amount for the movie
      const payment = await createPayment(amount);
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
      ctx.reply(`Please make the payment by clicking the following link: ${approvalUrl}`);
    } catch (error) {
      console.error('Error creating payment:', error);
      ctx.reply('An error occurred while creating the payment. Please try again later.');
    }
  });

  // Your other bot handlers and webhook setup

  // Express server to handle PayPal webhook
  app.post('/callback', express.json(), async (req, res) => {
    const paymentId = req.body.paymentId;
    const payerId = req.body.payerId;
    try {
      const payment = await executePayment(paymentId, payerId);
      res.status(200).send('Payment successful');
    } catch (error) {
      console.error('Error executing payment:', error);
      res.status(500).send('Error executing payment');
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  bot.launch();
} catch (error) {
  console.error('An error occurred:', error);
}
