// mpesa.js
const Mpesa = require('mpesa-node');
require('dotenv').config();

const mpesa = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: 'sandbox', // Change to 'production' for live
  shortCode: '600000',
  initiatorName: 'testapi',
  lipaNaMpesaShortCode: '174379',
  lipaNaMpesaShortPass: 'bfb279f9aa9bdbcf158e97dd71a467cd2b7e74f7',
  securityCredential: 'test',
  certPath: null
});

// Define any required initialization function if needed
const initializeMpesa = (config) => {
  // If any additional setup is required, do it here
  // Note: If you're not using `config` in the current setup, you can remove this function
  console.log('M-Pesa initialized with the following config:', config);
};

const createPayment = (amount, phone) => {
  return mpesa.lipaNaMpesaOnline({
    BusinessShortCode: '174379',
    Amount: amount,
    PartyA: phone,
    PartyB: '174379',
    PhoneNumber: phone,
    CallBackURL: 'https://yourdomain.com/callback',
    AccountReference: 'Movie Purchase',
    TransactionDesc: 'Payment for movie purchase'
  });
};

module.exports = { createPayment, initializeMpesa };
