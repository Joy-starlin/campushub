const axios = require('axios');
const { 
  FLW_PUBLIC_KEY, 
  FLW_SECRET_KEY, 
  FLW_ENCRYPTION_KEY 
} = require('../config/env');

const flw = axios.create({
  baseURL: 'https://api.flutterwave.com/v3',
  headers: {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Initiate Mobile Money Payment (MTN/Airtel)
 * @param {Object} data - Payment details (amount, currency, email, tx_ref, phone_number, network)
 */
const initiateMobileMoneyPayment = async (data) => {
  try {
    const { 
      amount, 
      currency, 
      email, 
      tx_ref, 
      phone_number, 
      network, 
      fullname 
    } = data;

    // Map network to Flutterwave types if needed
    // network: 'MTN' or 'AIRTEL'
    const payload = {
      amount,
      currency,
      email,
      tx_ref,
      phone_number,
      network: network.toUpperCase(),
      fullname,
      type: 'mobile_money_uganda'
    };

    const response = await flw.post('/charges?type=mobile_money_uganda', payload);
    
    return {
      success: response.data.status === 'success',
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Flutterwave MoMo Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Verify Transaction Status
 * @param {string} transactionId - Flutterwave transaction ID
 */
const verifyTransaction = async (transactionId) => {
  try {
    const response = await flw.get(`/transactions/${transactionId}/verify`);
    
    return {
      success: response.data.status === 'success',
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Flutterwave Verify Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Get Transaction by Reference
 * @param {string} txRef - Your internal transaction reference
 */
const getTransactionByRef = async (txRef) => {
  try {
    const response = await flw.get(`/transactions/verify_by_reference?tx_ref=${txRef}`);
    
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  } catch (error) {
    console.error('Flutterwave Ref Verify Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

module.exports = {
  initiateMobileMoneyPayment,
  verifyTransaction,
  getTransactionByRef
};
