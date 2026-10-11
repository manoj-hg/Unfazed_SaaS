const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const Lead = require('../models/Lead');
const notificationService = require('../services/notificationService');
const { parseISO, addMinutes, isBefore, isAfter, eachDayOfInterval } = require('date-fns');
const { fromZonedTime, toZonedTime, formatInTimeZone } = require('date-fns-tz');

exports.setAvailability = async (req, res) => {
  try {
    const { session_duration, buffer_time, timezone, weekly_schedule } = req.body;
    let availability = await Availability.findOne({ therapist_id: req.user.id });

    if (availability) {
      if (session_duration) availability.session_duration = session_duration;
      if (buffer_time !== undefined) availability.buffer_time = buffer_time;
      if (timezone) availability.timezone = timezone;
      if (weekly_schedule) availability.weekly_schedule = weekly_schedule;
      await availability.save();
    } else {
      availability = new Availability({
        therapist_id: req.user.id,
        session_duration: session_duration || 60,
        buffer_time: buffer_time !== undefined ? buffer_time : 15,
        timezone: timezone || 'Asia/Kolkata',
        weekly_schedule: weekly_schedule || {
          monday: { isAvailable: true, start: "10:00", end: "18:00" },
          tuesday: { isAvailable: true, start: "10:00", end: "18:00" },
          wednesday: { isAvailable: true, start: "10:00", end: "18:00" },
          thursday: { isAvailable: true, start: "10:00", end: "18:00" },
          friday: { isAvailable: true, start: "10:00", end: "18:00" },
          saturday: { isAvailable: false, start: "10:00", end: "14:00" },
          sunday: { isAvailable: false, start: "10:00", end: "14:00" }
        }
      });
      await availability.save();
    }

    res.json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getAvailability = async (req, res) => {
  try {
    let availability = await Availability.findOne({ therapist_id: req.user.id });
    if (!availability) {
      availability = new Availability({
        therapist_id: req.user.id,
        session_duration: 60,
        buffer_time: 15,
        timezone: 'Asia/Kolkata',
        weekly_schedule: {
          monday: { isAvailable: true, start: "10:00", end: "18:00" },
          tuesday: { isAvailable: true, start: "10:00", end: "18:00" },
          wednesday: { isAvailable: true, start: "10:00", end: "18:00" },
          thursday: { isAvailable: true, start: "10:00", end: "18:00" },
          friday: { isAvailable: true, start: "10:00", end: "18:00" },
          saturday: { isAvailable: false, start: "10:00", end: "14:00" },
          sunday: { isAvailable: false, start: "10:00", end: "14:00" }
        }
      });
      await availability.save();
    }
    res.json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getSlots = async (req, res) => {
  try {
    const { slug } = req.params;
    let { start_date, end_date } = req.query;

    const therapist = await Therapist.findOne({ slug });
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

    let availability = await Availability.findOne({ therapist_id: therapist._id });
    if (!availability) {
      return res.json([]);
    }

    const startDate = start_date ? parseISO(start_date) : new Date();
    const endDate = end_date ? parseISO(end_date) : addMinutes(startDate, 60 * 24 * 14); // 14 days default
    const tz = availability.timezone || 'Asia/Kolkata';

    const sessions = await Session.find({
      therapist_id: therapist._id,
      status: { $in: ['booked', 'confirmed'] },
      start_time: { $gte: startDate },
      end_time: { $lte: endDate }
    });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    let availableSlots = [];
    const now = new Date();

    days.forEach(day => {
      const dateString = day.toISOString().split('T')[0];
      const dayOfWeek = dayNames[day.getDay()];
      const daySchedule = availability.weekly_schedule ? availability.weekly_schedule[dayOfWeek] : null;

      if (daySchedule && daySchedule.isAvailable) {
        const startString = `${dateString} ${daySchedule.start}:00`; 
        const endString = `${dateString} ${daySchedule.end}:00`;

        const dayStartTime = fromZonedTime(startString, tz);
        const dayEndTime = fromZonedTime(endString, tz);

        let currentSlotStart = dayStartTime;

        while (isBefore(currentSlotStart, dayEndTime)) {
          const currentSlotEnd = addMinutes(currentSlotStart, availability.session_duration || 60);
          
          if (isAfter(currentSlotEnd, dayEndTime)) break;

          const isOverlapping = sessions.some(session => {
            const sStart = new Date(session.start_time);
            const sEnd = new Date(session.end_time);
            return (currentSlotStart < sEnd && currentSlotEnd > sStart);
          });

          if (!isOverlapping && currentSlotStart > now) {
            availableSlots.push({
              start_time: currentSlotStart.toISOString(),
              end_time: currentSlotEnd.toISOString(),
              formatted_time: formatInTimeZone(currentSlotStart, tz, 'hh:mm a'),
              date: dateString,
              duration: availability.session_duration
            });
          }

          currentSlotStart = addMinutes(currentSlotEnd, availability.buffer_time || 15);
        }
      }
    });

    res.json(availableSlots);
  } catch (err) {
    console.error('Error in getSlots:', err);
    res.status(500).send('Server Error');
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { slug } = req.params;
    const { client_name, client_email, client_phone, start_time, end_time, session_type } = req.body;

    const therapist = await Therapist.findOne({ slug });
    if (!therapist) return res.status(404).json({ message: 'Practitioner not found' });

    // Check if slot is already occupied
    const existingSession = await Session.findOne({
      therapist_id: therapist._id,
      status: { $in: ['booked', 'confirmed'] },
      start_time: new Date(start_time)
    });

    if (existingSession) {
      return res.status(400).json({ message: 'This slot was just booked by another client. Please select another slot.' });
    }

    let client = await Client.findOne({ email: client_email, therapist_id: therapist._id });
    if (!client) {
      client = await Client.create({
        therapist_id: therapist._id,
        name: client_name,
        email: client_email,
        phone: client_phone || '',
        status: 'active'
      });
    }

    const session = new Session({
      therapist_id: therapist._id,
      client_name,
      client_email,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      status: 'booked'
    });

    await session.save();

    // Trigger Notification
    notificationService.sendNotification('booking_confirmed', {
      client_email,
      client_name,
      client_phone,
      therapist_name: therapist.name,
      start_time,
      meeting_link: `https://meet.unfazed.in/${slug}-${session._id.toString().slice(-6)}`
    });

    res.status(201).json({
      message: 'Session slot successfully booked',
      session,
      client: { id: client._id, name: client.name, email: client.email }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This slot has already been booked.' });
    }
    console.error('Booking error:', err);
    res.status(500).send('Server Error');
  }
};

exports.getTherapistSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ therapist_id: req.user.id })
      .sort({ start_time: 1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.cancelSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, therapist_id: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session marked as cancelled', session });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.joinWaitlist = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email, phone, notes } = req.body;

    const therapist = await Therapist.findOne({ slug });
    if (!therapist) return res.status(404).json({ message: 'Practitioner not found' });

    const lead = new Lead({
      therapist_id: therapist._id,
      name,
      email,
      phone,
      status: 'waitlist',
      notes
    });
    await lead.save();

    notificationService.sendNotification('waitlist_joined', {
      client_name: name,
      client_email: email,
      therapist_name: therapist.name
    });

    res.json({ message: 'You have been added to the priority waitlist! We will notify you once a slot frees up.', lead });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
