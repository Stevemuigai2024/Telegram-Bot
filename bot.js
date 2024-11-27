require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const LocalSession = require('telegraf-session-local');
const { createPayment, executePayment } = require('./paypal.js');
const { initializeMpesa, createMpesaPayment } = require('./mpesa.js');
const { getMoviesFromDatabase, getMovieById } = require('./airtable.js');

// Initialize bot and Express app
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const app = express();

// Use bodyParser and session middleware
app.use(bodyParser.json());
bot.use(new LocalSession({ database: 'example_db.json' }).middleware());

// Initialize Mpesa (if applicable)
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORT_CODE,
  initiatorName: process.env.MPESA_INITIATOR_NAME,
  lipaNaMpesaShortcode: process.env.MPESA_LIPA_NA_MPESA_SHORTCODE,
  lipaNaMpesaPasskey: process.env.MPESA_LIPA_NA_MPESA_PASSKEY,
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
};
initializeMpesa(mpesaConfig);

// Bot Commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Telegram Movie Bot! Use /list to see available movies.');
});

bot.command('list', async (ctx) => {
  // Example list command logic
});

// Other commands here...

// Express Server for Webhooks
app.post('/paypal-callback', async (req, res) => {
  // PayPal callback logic
});

app.post('/mpesa-callback', (req, res) => {
  // Mpesa callback logic
});

// Start server and bot
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

bot.launch().catch((error) => {
  console.error('Failed to launch bot:', error);
  process.exit(1);
});
