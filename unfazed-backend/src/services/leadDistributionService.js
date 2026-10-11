const Lead = require('../models/Lead');
const Client = require('../models/Client');
const notificationService = require('./notificationService');

/**
 * Lead Distribution & Waitlist Management Service
 */
exports.captureLead = async (therapistId, leadData) => {
  const lead = new Lead({
    therapist_id: therapistId,
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone || '',
    service_interested: leadData.service_interested || 'Individual Therapy',
    preferred_time: leadData.preferred_time || 'Anytime',
    status: leadData.isWaitlist ? 'waitlist' : 'new',
    notes: leadData.notes || ''
  });

  await lead.save();

  // Notify therapist of new inquiry / waitlist addition
  await notificationService.sendNotification(
    leadData.isWaitlist ? 'waitlist_joined' : 'lead_received',
    {
      client_name: lead.name,
      client_email: lead.email,
      therapist_id: therapistId,
      notes: lead.notes
    }
  );

  return lead;
};

/**
 * Convert lead to active client
 */
exports.convertLeadToClient = async (leadId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found');

  let client = await Client.findOne({ therapist_id: lead.therapist_id, email: lead.email });
  if (!client) {
    client = new Client({
      therapist_id: lead.therapist_id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: 'active',
      tags: ['Converted Lead']
    });
    await client.save();
  }

  lead.status = 'converted';
  await lead.save();

  return client;
};
