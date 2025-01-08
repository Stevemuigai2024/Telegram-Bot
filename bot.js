// Updated bot.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const LocalSession = require('telegraf-session-local');
const { createPayment, executePayment } = require('./paypal.js');
const { initializeMpesa, createMpesaPayment } = require('./mpesa.js');
const { getMoviesFromDatabase, getMovieById } = require('./airtable.js');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const app = express();
app.use(bodyParser.json());

bot.use(new LocalSession({ database: 'example_db.json' }).middleware());

const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortCode: process.env.MPESA_SHORT_CODE,
  initiatorName: process.env.MPESA_INITIATOR_NAME,
  lipaNaMpesaShortcode: process.env.MPESA_LIPA_NA_MPESA_SHORTCODE,
  lipaNaMpesaPasskey: process.env.MPESA_LIPA_NA_MPESA_PASSKEY,
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL
};

initializeMpesa(mpesaConfig);

bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Telegram Movie Bot! Use /list to see available movies.');
});

bot.command('list', async (ctx) => {
  try {
    const movies = await getMoviesFromDatabase();
    if (!movies || movies.length === 0) {
      ctx.reply('No movies available at the moment.');
    } else {
      const movieList = movies
        .map(movie => `${movie.title || 'Unknown Title'} - $${movie.price || 'N/A'} - ID: ${movie.id}`)
        .join('\n');
      ctx.reply(`Available Movies:\n${movieList}`);
    }
  } catch (error) {
    console.error('Error listing movies:', error);
    ctx.reply('An error occurred while listing movies. Please try again later.');
  }
});

// Other commands remain unchanged...

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

bot.launch().catch((error) => {
  console.error('Failed to launch bot:', error);
  process.exit(1);
});
