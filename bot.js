require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { createPayment, executePayment } = require('./paypal.js');
const { initializeMpesa, createMpesaPayment } = require('./mpesa.js');
const { getMoviesFromDatabase, getMovieById } = require('./airtable.js');
const LocalSession = require('telegraf-session-local');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const app = express();
app.use(bodyParser.json());

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

bot.use((new LocalSession({ database: 'example_db.json' })).middleware());

bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Telegram Movie Bot! Use /list to see available movies.');
});

bot.command('list', async (ctx) => {
  try {
    const movies = await getMoviesFromDatabase();
    if (movies.length === 0) {
      ctx.reply('No movies available at the moment.');
    } else {
      for (const movie of movies) {
        let responseText = `*${movie.title}*\n\n*Genre:* ${movie.genre}\n*Director:* ${movie.director}\n*Year:* ${movie.year}\n*Price:* $${movie.price}\n\n${movie.link ? `[Watch Trailer](${movie.link})` : ''}\n\nTo buy, use /buy ${movie.id}`;
        if (movie.coverImageUrl) {
          await ctx.replyWithPhoto({ url: movie.coverImageUrl }, { caption: responseText, parse_mode: 'Markdown' });
        } else {
          await ctx.reply(responseText, { parse_mode: 'Markdown' });
        }
      }
    }
  } catch (error) {
    console.error('Error listing movies:', error);
    ctx.reply('An error occurred while listing movies. Please try again later.');
  }
});

bot.command('movie', async (ctx) => {
  const movieId = ctx.message.text.split(' ')[1];
  if (!movieId) {
    return ctx.reply('Please provide a movie ID. Usage: /movie <movie_id>');
  }
  try {
    const movie = await getMovieById(movieId);
    if (movie) {
      let responseText = `*${movie.title}*\n\n*Genre:* ${movie.genre}\n*Director:* ${movie.director}\n*Year:* ${movie.year}\n*Price:* $${movie.price}\n\n${movie.link ? `[Watch Trailer](${movie.link})` : ''}\n\nTo buy, use /buy ${movieId}`;
      if (movie.coverImageUrl) {
        ctx.replyWithPhoto({ url: movie.coverImageUrl }, { caption: responseText, parse_mode: 'Markdown' });
      } else {
        ctx.reply(responseText, { parse_mode: 'Markdown' });
      }
    } else {
      ctx.reply('Movie not found.');
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    ctx.reply('An error occurred while fetching movie details. Please try again later.');
  }
});

bot.command('buy', async (ctx) => {
  const movieId = ctx.message.text.split(' ')[1];
  if (!movieId) {
    return ctx.reply('Please provide a movie ID. Usage: /buy <movie_id>');
  }
  try {
    const movie = await getMovieById(movieId);
    if (movie) {
      ctx.reply(`You are about to purchase "${movie.title}" for $${movie.price}.\nPlease choose a payment method:\n1. PayPal\n2. M-Pesa`);
      ctx.session.movieId = movieId;
    } else {
      ctx.reply('Movie not found.');
    }
  } catch (error) {
    console.error('Error initiating purchase:', error);
    ctx.reply('An error occurred while initiating the purchase. Please try again later.');
  }
});

bot.hears('PayPal', async (ctx) => {
  const movieId = ctx.session.movieId;
  if (!movieId) {
    return ctx.reply('No movie selected. Use /buy <movie_id> to select a movie first.');
  }
  try {
    const movie = await getMovieById(movieId);
    if (movie) {
      const payment = await createPayment(movie.price);
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
      ctx.reply(`Please make the payment by clicking the following link: ${approvalUrl}`);
    } else {
      ctx.reply('Movie not found.');
    }
  } catch (error) {
    console.error('Error creating PayPal payment:', error);
    ctx.reply('An error occurred while creating the payment. Please try again later.');
  }
});

bot.hears('M-Pesa', async (ctx) => {
  const movieId = ctx.session.movieId;
  if (!movieId) {
    return ctx.reply('No movie selected. Use /buy <movie_id> to select a movie first.');
  }
  try {
    const movie = await getMovieById(movieId);
    if (movie) {
      const phone = 'your-phone-number'; // Replace with logic to get user's phone number
      const payment = await createMpesaPayment(movie.price, phone);
      ctx.reply('Please follow the instructions sent to your phone.');
    } else {
      ctx.reply('Movie not found.');
    }
  } catch (error) {
    console.error('Error creating M-Pesa payment:', error);
    ctx.reply('An error occurred while creating the payment. Please try again later.');
  }
});

app.post('/paypal-callback', async (req, res) => {
  const { paymentId, payerId } = req.body;
  try {
    const payment = await executePayment(paymentId, payerId);
    res.status(200).send('Payment successful');
  } catch (error) {
    console.error('Error executing PayPal payment:', error);
    res.status(500).send('Error executing payment');
  }
});

app.post('/mpesa-callback', (req, res) => {
  const paymentDetails = req.body;
  console.log('M-Pesa callback received:', paymentDetails);
  res.status(200).send('Callback received');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

bot.launch().catch((error) => {
  console.error('Failed to launch bot:', error);
  process.exit(1);
});
