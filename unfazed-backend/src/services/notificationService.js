const nodemailer = require('nodemailer');

// In-memory audit trail of sent notifications (for dashboard preview)
const notificationLogs = [];

exports.sendNotification = async (event, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[NotificationService] Event: ${event} at ${timestamp}`);
  console.log(`Payload:`, data);

  // Generate WhatsApp message stub
  let whatsappText = '';
  switch (event) {
    case 'booking_confirmed':
      whatsappText = `*Unfazed Practice Alert*: Hi ${data.client_name || 'Client'}, your session with Dr. ${data.therapist_name || 'Therapist'} is confirmed for ${data.start_time ? new Date(data.start_time).toLocaleString('en-IN') : 'upcoming slot'}. Meeting Link: ${data.meeting_link || 'https://meet.unfazed.in/session'}`;
      break;
    case 'payment_received':
      whatsappText = `*Payment Receipt*: Thank you ${data.client_name}! We received ₹${data.amount} for your therapy booking. Invoice: ${data.invoice_number || 'UNF-INV'}.`;
      break;
    case 'reminder_24h':
      whatsappText = `*Appointment Reminder*: Gentle reminder for your therapy session tomorrow at ${data.start_time}.`;
      break;
    case 'waitlist_opened':
      whatsappText = `*Slot Available!* A slot opened up for Dr. ${data.therapist_name}. Click here to claim your spot: ${data.booking_url}`;
      break;
    default:
      whatsappText = `*Notification (${event})*: Update regarding your therapy practice at Unfazed.`;
  }

  const logEntry = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    event,
    client_name: data.client_name,
    client_email: data.client_email,
    timestamp,
    channel: 'WhatsApp & Email',
    whatsapp_message: whatsappText,
    status: 'Delivered (Stubbed)'
  };
  notificationLogs.unshift(logEntry);
  if (notificationLogs.length > 50) notificationLogs.pop();

  console.log(`[WhatsApp Stub Outbox] [To: ${data.client_phone || data.client_email}]: ${whatsappText}`);

  // Optional Email dispatch if credentials exist
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: '"Unfazed Practice Suite" <no-reply@unfazed.in>',
        to: data.client_email,
        subject: `Appointment Notification: ${event.replace('_', ' ').toUpperCase()}`,
        text: whatsappText
      });
      console.log('[NotificationService] Email sent successfully to:', data.client_email);
    } catch (err) {
      console.warn('[NotificationService] Nodemailer error (stubbed):', err.message);
    }
  }

  return logEntry;
};

exports.getNotificationLogs = () => {
  return notificationLogs;
};
