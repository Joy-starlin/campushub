const africastalking = require('africastalking');

// Initialize Africa's Talking client
const initializeAT = () => {
  return africastalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME
  });
};

// Validate phone number (Uganda format)
const validatePhoneNumber = (phone) => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Uganda phone formats: 2567XXXXXXXX or 07XXXXXXXX
  if (/^2567\d{8}$/.test(cleanPhone)) {
    return cleanPhone;
  }
  
  if (/^07\d{8}$/.test(cleanPhone)) {
    return '256' + cleanPhone.substring(1);
  }
  
  throw new Error('Invalid Uganda phone number format');
};

// Send single SMS message
const sendSMS = async (options) => {
  try {
    const { to, message, priority = 'normal' } = options;
    
    // Validate phone number
    const phoneNumber = validatePhoneNumber(to);
    
    // Validate message length (SMS limit is 160 characters for GSM-7, 70 for Unicode)
    if (message.length > 160) {
      console.warn('Message exceeds 160 characters, may be split into multiple SMS');
    }
    
    const at = initializeAT();
    const sms = at.SMS();
    
    const smsOptions = {
      to: [phoneNumber],
      message: message,
      from: process.env.AFRICASTALKING_SENDER_NAME || 'BugemaHub'
    };

    // Add priority for urgent messages
    if (priority === 'urgent') {
      smsOptions.enqueue = false; // Send immediately
    }

    const result = await sms.send(smsOptions);
    
    if (result.SMSMessageData.Recipients && result.SMSMessageData.Recipients.length > 0) {
      const recipient = result.SMSMessageData.Recipients[0];
      
      return {
        success: true,
        messageId: recipient.messageId,
        status: recipient.status,
        cost: recipient.cost,
        phoneNumber: recipient.number
      };
    } else {
      throw new Error('No recipients in response');
    }
    
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'SMS_SEND_FAILED'
    };
  }
};

// Send bulk SMS to multiple recipients
const sendBulkSMS = async (options) => {
  try {
    const { phones, message, priority = 'normal' } = options;
    
    if (!Array.isArray(phones) || phones.length === 0) {
      throw new Error('Phone numbers array is required');
    }
    
    // Validate all phone numbers
    const validPhones = phones.map(phone => validatePhoneNumber(phone));
    
    // Africa's Talking supports up to 1000 recipients per bulk SMS
    if (validPhones.length > 1000) {
      throw new Error('Maximum 1000 recipients allowed per bulk SMS');
    }
    
    const at = initializeAT();
    const sms = at.SMS();
    
    const smsOptions = {
      to: validPhones,
      message: message,
      from: process.env.AFRICASTALKING_SENDER_NAME || 'BugemaHub'
    };

    // Add priority for urgent messages
    if (priority === 'urgent') {
      smsOptions.enqueue = false;
    }

    const result = await sms.send(smsOptions);
    
    return {
      success: true,
      messageId: result.SMSMessageData.Message,
      recipients: result.SMSMessageData.Recipients,
      totalRecipients: validPhones.length,
      totalCost: result.SMSMessageData.Recipients.reduce((sum, r) => sum + (r.cost || 0), 0)
    };
    
  } catch (error) {
    console.error('Failed to send bulk SMS:', error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'BULK_SMS_SEND_FAILED'
    };
  }
};

// Send verification code
const sendVerificationCode = async (phoneNumber, code, type = 'verification') => {
  try {
    let message;
    
    switch (type) {
      case 'verification':
        message = `Your Bugema Hub verification code is: ${code}. This code will expire in 10 minutes. Reply STOP to unsubscribe.`;
        break;
      case 'password_reset':
        message = `Your Bugema Hub password reset code is: ${code}. This code will expire in 10 minutes. Reply STOP to unsubscribe.`;
        break;
      case 'phone_verification':
        message = `Your phone verification code is: ${code}. This code will expire in 10 minutes. Reply STOP to unsubscribe.`;
        break;
      default:
        message = `Your Bugema Hub code is: ${code}. This code will expire in 10 minutes. Reply STOP to unsubscribe.`;
    }
    
    return await sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal'
    });
    
  } catch (error) {
    console.error('Failed to send verification code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send event reminder
const sendEventReminder = async (phoneNumber, event) => {
  try {
    const message = `Reminder: ${event.title} on ${new Date(event.date).toLocaleDateString()} at ${event.time} at ${event.location}. Don't miss it! - BugemaHub`;
    
    return await sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal'
    });
    
  } catch (error) {
    console.error('Failed to send event reminder SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send payment confirmation
const sendPaymentConfirmation = async (phoneNumber, paymentDetails) => {
  try {
    const { plan, amount, currency = 'UGX' } = paymentDetails;
    const message = `Payment confirmed! You've successfully upgraded to ${plan} plan for ${amount} ${currency}. Enjoy your new features! - BugemaHub`;
    
    return await sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal'
    });
    
  } catch (error) {
    console.error('Failed to send payment confirmation SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send urgent alert
const sendUrgentAlert = async (phoneNumber, alert) => {
  try {
    const message = `URGENT: ${alert.title}. ${alert.message}. Please take immediate action. - BugemaHub`;
    
    return await sendSMS({
      to: phoneNumber,
      message,
      priority: 'urgent'
    });
    
  } catch (error) {
    console.error('Failed to send urgent alert SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send welcome message
const sendWelcomeMessage = async (phoneNumber, userName) => {
  try {
    const message = `Welcome to Bugema Hub, ${userName}! 🎓 Get started by exploring events and joining clubs. Reply STOP to unsubscribe. - BugemaHub`;
    
    return await sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal'
    });
    
  } catch (error) {
    console.error('Failed to send welcome SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Check SMS delivery status
const checkDeliveryStatus = async (messageId) => {
  try {
    const at = initializeAT();
    const sms = at.SMS();
    
    const result = await sms.getMessageStatus(messageId);
    
    return {
      success: true,
      status: result.status,
      details: result
    };
    
  } catch (error) {
    console.error('Failed to check SMS delivery status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get SMS usage statistics
const getSMSUsage = async (startDate, endDate) => {
  try {
    const at = initializeAT();
    
    // Note: Africa's Talking doesn't have a direct usage API endpoint
    // This would typically be tracked in your own database
    // For now, return a placeholder response
    
    return {
      success: true,
      usage: {
        totalSMS: 0,
        totalCost: 0,
        period: { startDate, endDate }
      }
    };
    
  } catch (error) {
    console.error('Failed to get SMS usage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Legacy functions for backward compatibility
const sendNotificationSMS = async (phoneNumber, notificationMessage) => {
  return sendSMS({
    to: phoneNumber,
    message: `${notificationMessage} - BugemaHub`,
    priority: 'normal'
  });
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendVerificationCode,
  sendEventReminder,
  sendPaymentConfirmation,
  sendUrgentAlert,
  sendWelcomeMessage,
  checkDeliveryStatus,
  getSMSUsage,
  // Legacy functions
  sendNotificationSMS,
  sendWelcomeSMS: sendWelcomeMessage,
  sendPasswordResetSMS: (phone, code) => sendVerificationCode(phone, code, 'password_reset'),
  sendEventReminderSMS: sendEventReminder
};
