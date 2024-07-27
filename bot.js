require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const { createPayment, executePayment } = require('./paypal.js');
const { initializeMpesa, createMpesaPayment } = require('./mpesa.js');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const app = express();
app.use(bodyParser.json()); // For parsing JSON bodies

// Load M-Pesa configuration
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORT_CODE,
  initiatorName: process.env.MPESA_INITIATOR_NAME,
  lipaNaMpesaShortcode: process.env.MPESA_LIPA_NA_MPESA_SHORTCODE,
  lipaNaMpesaPasskey: process.env.MPESA_LIPA_NA_MPESA_PASSKEY,
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL
};

// Initialize M-Pesa
initializeMpesa(mpesaConfig);

// Telegram Bot Commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Telegram Movie Bot!');
});

// Handle PayPal Payment Creation
bot.command('buy', async (ctx) => {
  try {
    const amount = '10.00'; // Amount for the movie
    const phone = 'your-phone-number'; // Replace with user's phone number or ask them for it
    const payment = await createPayment(amount); // Assuming createPayment returns PayPal payment details
    const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
    ctx.reply(`Please make the payment by clicking the following link: ${approvalUrl}`);
  } catch (error) {
    console.error('Error creating payment:', error);
    ctx.reply('An error occurred while creating the payment. Please try again later.');
  }
});

// Handle M-Pesa Payment Creation
bot.command('buy_mpesa', async (ctx) => {
  try {
    const amount = '10.00'; // Amount for the movie
    const phone = 'your-phone-number'; // Replace with user's phone number or ask them for it
    const payment = await createMpesaPayment(amount, phone); // Assuming createMpesaPayment handles M-Pesa payments
    const responseMessage = payment ? 'Payment request sent successfully. Check your phone for instructions.' : 'Error processing payment.';
    ctx.reply(responseMessage);
  } catch (error) {
    console.error('Error creating M-Pesa payment:', error);
    ctx.reply('An error occurred while creating the payment. Please try again later.');
  }
});

// Express Server to Handle PayPal Webhook
app.post('/paypal-callback', async (req, res) => {
  const { paymentId, payerId } = req.body;
  try {
    const payment = await executePayment(paymentId, payerId); // Assuming executePayment finalizes PayPal payments
    res.status(200).send('Payment successful');
  } catch (error) {
    console.error('Error executing payment:', error);
    res.status(500).send('Error executing payment');
  }
});

// Express Server to Handle M-Pesa Callback
app.post('/mpesa-callback', (req, res) => {
  const paymentDetails = req.body;
  console.log('M-Pesa callback received:', paymentDetails);

  // Process the payment details (e.g., update database, send notifications)
  res.status(200).send('Callback received');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Launch the Telegram Bot
bot.launch().catch((error) => {
  console.error('Failed to launch bot:', error);
  process.exit(1);
});
