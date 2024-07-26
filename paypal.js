const paypal = require('paypal-rest-sdk');
require('dotenv').config();

paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET
});

const createPayment = (amount) => {
  const payment = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel'
    },
    transactions: [{
      amount: {
        total: amount,
        currency: 'USD'
      },
      description: 'Movie Purchase'
    }]
  };

  return new Promise((resolve, reject) => {
    paypal.payment.create(payment, (error, payment) => {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });
};

const executePayment = (paymentId, payerId) => {
  const execute = {
    payer_id: payerId
  };

  return new Promise((resolve, reject) => {
    paypal.payment.execute(paymentId, execute, (error, payment) => {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });
};

module.exports = { createPayment, executePayment };
