const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const notificationService = require('./services/notificationService');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => res.json({ status: 'ok', name: 'Unfazed SaaS API', timestamp: new Date() }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime() }));

// Core API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/therapist', require('./routes/therapistRoutes'));
app.use('/api/scheduling', require('./routes/schedulingRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));

// Notification Audit Log Endpoint (For demo & practice dashboard inspection)
app.get('/api/notifications/logs', (req, res) => {
  res.json(notificationService.getNotificationLogs());
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
