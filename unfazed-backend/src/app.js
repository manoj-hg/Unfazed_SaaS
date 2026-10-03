const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/therapist', require('./routes/therapistRoutes'));
app.use('/api/scheduling', require('./routes/schedulingRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
