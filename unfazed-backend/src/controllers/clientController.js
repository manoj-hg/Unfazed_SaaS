const Client = require('../models/Client');

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ therapist_id: req.user.id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, therapist_id: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
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
        consent_signed_at: req.body.consent ? new Date() : null
      },
      { new: true }
    );
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
