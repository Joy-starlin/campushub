const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Base email template
const createEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bugema Hub</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          color: #495057;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #0056b3;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .highlight {
          background-color: #fff3cd;
          padding: 15px;
          border-left: 4px solid #ffc107;
          margin: 20px 0;
        }
        .event-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          background-color: #28a745;
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 Bugema Hub</div>
          <div class="title">${title}</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2024 Bugema Hub. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Welcome email template
const welcome = async (user) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <p>Hi ${user.firstName},</p>
      <p>Welcome to Bugema Hub! We're excited to have you join our vibrant campus community.</p>
      
      <div class="highlight">
        <strong>🎯 Next Steps:</strong>
        <ul>
          <li>Complete your profile to connect with fellow students</li>
          <li>Explore upcoming events and activities</li>
          <li>Join clubs that match your interests</li>
          <li>Start networking with your peers</li>
        </ul>
      </div>
      
      <p>Bugema Hub is your gateway to:</p>
      <ul>
        <li>📅 Campus events and activities</li>
        <li>👥 Student clubs and organizations</li>
        <li>💼 Marketplace for buying and selling</li>
        <li>💬 Real-time messaging and chat</li>
        <li>🏆 Gamification and rewards</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">Get Started</a>
      </p>
      
      <p>If you have any questions, don't hesitate to reach out to our support team.</p>
      
      <p>Best regards,<br>The Bugema Hub Team</p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Bugema Hub! 🎓',
      html: createEmailTemplate('Welcome to Bugema Hub!', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Student verification email template
const verifyStudent = async (user, otp) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <p>Hi ${user.firstName},</p>
      <p>Thank you for signing up for Bugema Hub! To complete your student verification, please use the OTP code below:</p>
      
      <div class="highlight" style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
        ${otp}
      </div>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>This OTP will expire in 10 minutes</li>
        <li>Never share this code with anyone</li>
        <li>Enter it exactly as shown above</li>
      </ul>
      
      <p>Verification helps us ensure that only verified students have access to exclusive campus features and events.</p>
      
      <p>If you didn't request this verification, please ignore this email.</p>
      
      <p>Best regards,<br>The Bugema Hub Team</p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Student Verification - Bugema Hub',
      html: createEmailTemplate('Verify Your Student Account', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: error.message };
  }
};

// Password reset email template
const passwordReset = async (user, otp) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <p>Hi ${user.firstName},</p>
      <p>We received a request to reset your password for your Bugema Hub account.</p>
      
      <div class="highlight" style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
        ${otp}
      </div>
      
      <p><strong>Reset Instructions:</strong></p>
      <ul>
        <li>Use this OTP to reset your password</li>
        <li>This code will expire in 10 minutes</li>
        <li>Never share this code with anyone</li>
      </ul>
      
      <p>If you didn't request this password reset, please secure your account immediately and contact our support team.</p>
      
      <p>Best regards,<br>The Bugema Hub Team</p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset - Bugema Hub',
      html: createEmailTemplate('Reset Your Password', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Payment confirmation email template
const paymentConfirmed = async (user, plan, amount) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <p>Hi ${user.firstName},</p>
      <p>🎉 Congratulations! Your payment has been successfully processed.</p>
      
      <div class="event-details">
        <h3>Payment Details</h3>
        <p><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Payment Method:</strong> Card Payment</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="highlight">
        <strong>🎯 Your New Benefits:</strong>
        <ul>
          ${plan === 'premium' ? 
            `<li>✅ All Member features</li>
             <li>✅ Unlimited messaging</li>
             <li>✅ Advanced analytics</li>
             <li>✅ Priority marketplace listings</li>
             <li>✅ Premium support</li>` :
            `<li>✅ Advanced search</li>
             <li>✅ Priority support</li>
             <li>✅ Profile customization</li>
             <li>✅ Enhanced networking</li>`
          }
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">Explore Your New Features</a>
      </p>
      
      <p>Thank you for choosing Bugema Hub Premium! Your subscription will automatically renew.</p>
      
      <p>Best regards,<br>The Bugema Hub Team</p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Payment Confirmed - Bugema Hub Premium',
      html: createEmailTemplate('Payment Successful! 🎉', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Event reminder email template
const eventReminder = async (user, event) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <p>Hi ${user.firstName},</p>
      <p>📅 This is a friendly reminder about an upcoming event you're registered for!</p>
      
      <div class="event-details">
        <h3>${event.title}</h3>
        <p><span class="badge">EVENT</span></p>
        <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>⏰ Time:</strong> ${event.time}</p>
        <p><strong>📍 Location:</strong> ${event.location}</p>
        <p><strong>👥 Organizer:</strong> ${event.organizer}</p>
      </div>
      
      ${event.description ? `<p><strong>About the event:</strong></p><p>${event.description}</p>` : ''}
      
      <div class="highlight">
        <strong>⏰ Reminder Details:</strong>
        <ul>
          <li>This event starts in 24 hours</li>
          <li>Please arrive 15 minutes early</li>
          <li>Don't forget to bring any required materials</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/events/${event.id}" class="button">View Event Details</a>
      </p>
      
      <p>We look forward to seeing you there!</p>
      
      <p>Best regards,<br>The Bugema Hub Team</p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Event Reminder: ${event.title}`,
      html: createEmailTemplate('Event Reminder 📅', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send event reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Weekly digest email template
const weeklyDigest = async (user, stats) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <p>Hi ${user.firstName},</p>
      <p>📊 Here's your weekly Bugema Hub activity summary!</p>
      
      <div class="event-details">
        <h3>Your Week at a Glance</h3>
        <p><strong>📈 Points Earned:</strong> +${stats.pointsEarned || 0}</p>
        <p><strong>👥 New Connections:</strong> ${stats.newConnections || 0}</p>
        <p><strong>📅 Events Attended:</strong> ${stats.eventsAttended || 0}</p>
        <p><strong>💬 Messages Sent:</strong> ${stats.messagesSent || 0}</p>
        <p><strong>🏆 Current Rank:</strong> ${stats.currentRank || 'Student'}</p>
      </div>
      
      ${stats.achievements && stats.achievements.length > 0 ? `
        <div class="highlight">
          <strong>🏆 New Achievements:</strong>
          <ul>
            ${stats.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${stats.upcomingEvents && stats.upcomingEvents.length > 0 ? `
        <h3>📅 Upcoming Events</h3>
        <ul>
          ${stats.upcomingEvents.map(event => `<li><strong>${event.title}</strong> - ${new Date(event.date).toLocaleDateString()}</li>`).join('')}
        </ul>
      ` : ''}
      
      <h3>💡 Tips for This Week</h3>
      <ul>
        <li>Join a new club to expand your network</li>
        <li>Check out the marketplace for great deals</li>
        <li>Attend campus events to earn more points</li>
        <li>Connect with fellow students in your field</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Full Dashboard</a>
      </p>
      
      <p>Keep up the great work! Every interaction helps you build a stronger campus network.</p>
      
      <p>Best regards,<br>The Bugema Hub Team</p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your Weekly Bugema Hub Digest 📊',
      html: createEmailTemplate('Weekly Activity Summary', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send weekly digest email:', error);
    return { success: false, error: error.message };
  }
};

// Badge earned email template
const badgeEarned = async (user, badge) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <p>Hi ${user.firstName},</p>
      <p>🎉 Congratulations! You've earned a new badge!</p>
      
      <div class="event-details" style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 15px;">🏆</div>
        <h3>${badge.name}</h3>
        <p><span class="badge">NEW BADGE</span></p>
        <p><strong>Description:</strong> ${badge.description}</p>
        <p><strong>Category:</strong> ${badge.category}</p>
        <p><strong>Points Awarded:</strong> +${badge.points || 0}</p>
      </div>
      
      <div class="highlight">
        <strong>🎯 Achievement Unlocked!</strong>
        <p>This badge recognizes your outstanding contribution to the Bugema Hub community. Share your achievement with friends and inspire others!</p>
      </div>
      
      <h3>📈 Your Progress</h3>
      <ul>
        <li>Total Badges: ${badge.totalBadges || 1}</li>
        <li>Current Points: ${badge.currentPoints || 0}</li>
        <li>Next Milestone: ${badge.nextMilestone || 'Keep going!'}</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/profile" class="button">View Your Profile</a>
      </p>
      
      <p>Keep up the excellent work! Your contributions make our campus community stronger.</p>
      
      <p>Best regards,<br>The Bugema Hub Team</p>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `🏆 New Badge Earned: ${badge.name}`,
      html: createEmailTemplate('Congratulations! New Badge Earned', content)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send badge earned email:', error);
    return { success: false, error: error.message };
  }
};

// Generic email sender
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const { to, subject, template, data } = options;
    
    let html;
    switch (template) {
      case 'notification':
        html = createEmailTemplate(subject || 'Notification', `
          <p>Hi ${data.userName},</p>
          <p>${data.message}</p>
          ${data.link ? `<p style="text-align: center;"><a href="${data.link}" class="button">View Details</a></p>` : ''}
          <p>Best regards,<br>The Bugema Hub Team</p>
        `);
        break;
      default:
        html = options.html;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: options.text
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  welcome,
  verifyStudent,
  passwordReset,
  paymentConfirmed,
  eventReminder,
  weeklyDigest,
  badgeEarned,
  sendEmail
};
