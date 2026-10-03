const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const { parseISO, addMinutes, isBefore, isAfter, eachDayOfInterval } = require('date-fns');
const { zonedTimeToUtc } = require('date-fns-tz');

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
        session_duration,
        buffer_time,
        timezone,
        weekly_schedule
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
      availability = new Availability({ therapist_id: req.user.id });
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
    const { start_date, end_date } = req.query; 

    const therapist = await Therapist.findOne({ slug });
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

    const availability = await Availability.findOne({ therapist_id: therapist._id });
    if (!availability) return res.json([]);

    const startDate = parseISO(start_date);
    const endDate = parseISO(end_date);
    const tz = availability.timezone;

    const sessions = await Session.find({
      therapist_id: therapist._id,
      status: 'booked',
      start_time: { $gte: startDate },
      end_time: { $lte: endDate }
    });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    let availableSlots = [];

    days.forEach(day => {
      const dateString = day.toISOString().split('T')[0];
      const dayOfWeek = dayNames[day.getDay()];
      const daySchedule = availability.weekly_schedule[dayOfWeek];

      if (daySchedule && daySchedule.isAvailable) {
        const startString = `${dateString} ${daySchedule.start}:00`; 
        const endString = `${dateString} ${daySchedule.end}:00`;

        const dayStartTime = zonedTimeToUtc(startString, tz);
        const dayEndTime = zonedTimeToUtc(endString, tz);

        let currentSlotStart = dayStartTime;

        while (isBefore(currentSlotStart, dayEndTime)) {
          const currentSlotEnd = addMinutes(currentSlotStart, availability.session_duration);
          
          if (isAfter(currentSlotEnd, dayEndTime)) break;

          const isOverlapping = sessions.some(session => {
            const sStart = new Date(session.start_time);
            const sEnd = new Date(session.end_time);
            return (currentSlotStart < sEnd && currentSlotEnd > sStart);
          });

          if (!isOverlapping && currentSlotStart > new Date()) {
            availableSlots.push({
              start_time: currentSlotStart.toISOString(),
              end_time: currentSlotEnd.toISOString(),
            });
          }

          currentSlotStart = addMinutes(currentSlotEnd, availability.buffer_time);
        }
      }
    });

    res.json(availableSlots);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { slug } = req.params;
    const { client_name, client_email, start_time, end_time } = req.body;

    const therapist = await Therapist.findOne({ slug });
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

    let client = await require('../models/Client').findOne({ email: client_email, therapist_id: therapist._id });
    if (!client) {
      client = await require('../models/Client').create({
        therapist_id: therapist._id,
        name: client_name,
        email: client_email,
        status: 'active'
      });
    }

    const session = new Session({
      therapist_id: therapist._id,
      client_name,
      client_email,
      start_time,
      end_time,
      status: 'booked'
    });

    await session.save();

    require('../services/notificationService').sendNotification('booking_confirmed', {
      client_email,
      client_name,
      start_time
    });

    res.status(201).json({ message: 'Slot booked successfully', session });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This slot has already been booked.' });
    }
    console.error(err);
    res.status(500).send('Server Error');
  }
};
