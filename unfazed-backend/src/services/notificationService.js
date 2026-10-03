const nodemailer = require('nodemailer');

exports.sendNotification = async (event, data) => {
  console.log(`[NotificationService] Event: ${event}`);
  console.log(`Data:`, data);

  console.log(`[WhatsApp Stub] Sending message to client...`);

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: '"Unfazed" <no-reply@unfazed.in>',
        to: data.client_email,
        subject: `Notification: ${event}`,
        text: `Hello ${data.client_name}, this is a notification for your session on ${data.start_time}`
      });
      console.log('Email sent successfully');
    } catch (err) {
      console.error('Error sending email', err);
    }
  }
};
