const Session = require('../models/Session');
const Client = require('../models/Client');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res) => {
  try {
    const therapistId = new mongoose.Types.ObjectId(req.user.id);

    const activeClientsCount = await Client.countDocuments({ therapist_id: therapistId, status: 'active' });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const sessionsAgg = await Session.aggregate([
      { 
        $match: { 
          therapist_id: therapistId, 
          status: 'completed',
          start_time: { $gte: startOfMonth }
        } 
      },
      {
        $count: "completed_sessions"
      }
    ]);
    const completedSessions = sessionsAgg.length > 0 ? sessionsAgg[0].completed_sessions : 0;

    const revenueAgg = await Payment.aggregate([
      {
        $match: {
          therapist_id: therapistId,
          status: 'successful',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    res.json({
      activeClientsCount,
      completedSessions,
      revenue
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
