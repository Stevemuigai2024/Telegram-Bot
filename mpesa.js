const axios = require('axios');

let mpesaAccessToken = '';

// Function to get M-Pesa access token
const getMpesaAccessToken = async (config) => {
  try {
    const { consumerKey, consumerSecret } = config;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    mpesaAccessToken = response.data.access_token;
    console.log('M-Pesa Access Token:', mpesaAccessToken); // Log the access token
  } catch (error) {
    console.error('Error fetching M-Pesa access token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to create M-Pesa payment
const createMpesaPayment = async (amount, phone) => {
  try {
    const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, -2); // Format timestamp as YYYYMMDDHHMMSS
    const password = Buffer.from(`${process.env.MPESA_LIPA_NA_MPESA_SHORTCODE}${process.env.MPESA_LIPA_NA_MPESA_PASSKEY}${timestamp}`).toString('base64');
    
    const data = {
      BusinessShortCode: process.env.MPESA_LIPA_NA_MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_LIPA_NA_MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: 'MoviePurchase',
      TransactionDesc: 'Payment for movie'
    };

    console.log('M-Pesa Payment Request Data:', data); // Log request data

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${mpesaAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('M-Pesa Payment Response:', response.data); // Log the response data
    return response.data;
  } catch (error) {
    console.error('Error creating M-Pesa payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to initialize M-Pesa
const initializeMpesa = async (config) => {
  await getMpesaAccessToken(config);
};

module.exports = {
  initializeMpesa,
  createMpesaPayment
};
