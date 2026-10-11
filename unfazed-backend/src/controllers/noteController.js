const SessionNote = require('../models/SessionNote');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const entitlementService = require('../services/entitlementService');

exports.createNote = async (req, res) => {
  try {
    const { client_id, session_id, content, type, format, soap_data, dap_data, title } = req.body;

    // Entitlement gate: Shared notes
    if (type === 'shared') {
      const sharedEntitlement = await entitlementService.canAccess(req.user.id, 'can_use_shared_notes');
      if (!sharedEntitlement.allowed) {
        return res.status(403).json({
          code: 'ENTITLEMENT_LOCKED',
          feature: 'can_use_shared_notes',
          message: 'Client-shared clinical notes require a Pro subscription. Upgrade to share notes with clients.'
        });
      }
    }

    // Entitlement gate: Structured SOAP/DAP templates
    if (format === 'soap' || format === 'dap') {
      const soapEntitlement = await entitlementService.canAccess(req.user.id, 'can_use_soap_templates');
      if (!soapEntitlement.allowed) {
        return res.status(403).json({
          code: 'ENTITLEMENT_LOCKED',
          feature: 'can_use_soap_templates',
          message: 'Structured clinical templates (SOAP/DAP) are available on Pro and Enterprise tiers.'
        });
      }
    }

    const note = new SessionNote({
      therapist_id: req.user.id,
      client_id,
      session_id,
      title: title || (format === 'soap' ? 'SOAP Progress Note' : format === 'dap' ? 'DAP Progress Note' : 'Session Note'),
      content,
      type: type || 'private',
      format: format || 'freeform',
      soap_data: soap_data || {},
      dap_data: dap_data || {}
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getNotesForClient = async (req, res) => {
  try {
    const { client_id } = req.params;
    // Therapist sees all notes (both private and shared) for their client
    const notes = await SessionNote.find({
      therapist_id: req.user.id,
      client_id
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/**
 * CLIENT-FACING ROUTE:
 * Strictly returns ONLY notes where type === 'shared'.
 * Under NO condition will a private note be exposed here.
 */
exports.getSharedNotes = async (req, res) => {
  try {
    const { slug, clientEmail } = req.params;
    
    const therapist = await Therapist.findOne({ slug });
    if (!therapist) return res.status(404).json({ message: 'Practitioner not found' });

    const client = await Client.findOne({ therapist_id: therapist._id, email: clientEmail });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Role-restricted query: ALWAYS enforced at API layer
    const notes = await SessionNote.find({
      therapist_id: therapist._id,
      client_id: client._id,
      type: 'shared'
    }).select('-soap_data.assessment').sort({ createdAt: -1 }); // Only shared notes

    res.json({
      client: { name: client.name, email: client.email },
      notes
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await SessionNote.findOneAndDelete({
      _id: req.params.id,
      therapist_id: req.user.id
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
