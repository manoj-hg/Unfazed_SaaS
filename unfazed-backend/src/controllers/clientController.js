const Client = require('../models/Client');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const SessionNote = require('../models/SessionNote');
const ChatMessage = require('../models/ChatMessage');
const entitlementService = require('../services/entitlementService');

exports.getClients = async (req, res) => {
  try {
    const { search, status, tag } = req.query;
    const query = { therapist_id: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query).sort({ updatedAt: -1 });

    // Enrich with last session date
    const clientIds = clients.map(c => c._id);
    const sessions = await Session.find({
      therapist_id: req.user.id,
      client_email: { $in: clients.map(c => c.email) }
    }).sort({ start_time: -1 });

    const enriched = clients.map(client => {
      const clientSessions = sessions.filter(s => s.client_email === client.email);
      const lastSession = clientSessions.find(s => s.status === 'completed') || clientSessions[0];
      return {
        ...client.toObject(),
        last_session: lastSession ? lastSession.start_time : null,
        total_sessions: clientSessions.length
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, therapist_id: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Aggregate sessions, notes, payments
    const sessions = await Session.find({
      therapist_id: req.user.id,
      client_email: client.email
    }).sort({ start_time: -1 });

    const notes = await SessionNote.find({
      therapist_id: req.user.id,
      client_id: client._id
    }).sort({ createdAt: -1 });

    const payments = await Payment.find({
      therapist_id: req.user.id,
      $or: [{ client_id: client._id }, { reference_id: client._id }]
    }).sort({ createdAt: -1 });

    res.json({
      client,
      sessions,
      notes,
      payments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, status, tags } = req.body;

    // Check entitlement tier limit for active clients
    const entitlement = await entitlementService.canAccess(req.user.id, 'max_active_clients');
    if (!entitlement.allowed) {
      return res.status(403).json({
        code: 'ENTITLEMENT_LOCKED',
        message: entitlement.reason,
        cap: entitlement.cap,
        current: entitlement.current,
        tier: entitlement.tier
      });
    }

    let existing = await Client.findOne({ therapist_id: req.user.id, email });
    if (existing) {
      return res.status(400).json({ message: 'Client with this email already exists in your practice.' });
    }

    const client = new Client({
      therapist_id: req.user.id,
      name,
      email,
      phone: phone || '',
      status: status || 'active',
      tags: tags || []
    });

    await client.save();
    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, therapist_id: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.submitIntake = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, therapist_id: req.user.id },
      { 
        intake_form: req.body.intake_form,
        consent_signed_at: req.body.consent ? new Date() : null,
        consent_ip: req.ip || '127.0.0.1'
      },
      { new: true }
    );
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getClientChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      therapist_id: req.user.id,
      client_id: req.params.id
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
