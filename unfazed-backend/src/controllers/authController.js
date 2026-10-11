const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Therapist = require('../models/Therapist');
const generateSlug = require('../utils/generateSlug');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name } = req.body;

  try {
    let therapist = await Therapist.findOne({ email });
    if (therapist) {
      return res.status(400).json({ message: 'Therapist already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const slug = await generateSlug(name);

    therapist = new Therapist({
      email,
      password_hash,
      name,
      slug
    });

    await therapist.save();

    const payload = { id: therapist.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production', { expiresIn: '7d' });

    res.status(201).json({ token, therapist: { id: therapist.id, name, email, slug } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const therapist = await Therapist.findOne({ email });
    if (!therapist) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, therapist.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { id: therapist.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production', { expiresIn: '7d' });

    res.json({ token, therapist: { id: therapist.id, name: therapist.name, email, slug: therapist.slug } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.user.id).select('-password_hash');
    res.json(therapist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.googleAuth = async (req, res) => {
  try {
    let email, name, picture, google_id;

    if (req.body.credential) {
      try {
        const parts = req.body.credential.split('.');
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadJson = Buffer.from(base64, 'base64').toString('utf-8');
          const decoded = JSON.parse(payloadJson);
          email = decoded.email;
          name = decoded.name;
          picture = decoded.picture;
          google_id = decoded.sub;
        }
      } catch (decodeErr) {
        console.warn('Failed to parse Google JWT payload:', decodeErr.message);
      }
    }

    if (!email && req.body.email) {
      email = req.body.email;
      name = req.body.name;
      picture = req.body.picture || '';
      google_id = req.body.google_id || `google_${Date.now()}`;
    }

    if (!email) {
      return res.status(400).json({ message: 'Google authentication payload missing email.' });
    }

    email = email.toLowerCase().trim();

    if (!name || name.trim() === '') {
      const localPart = email.split('@')[0].replace(/[._-]/g, ' ');
      name = 'Dr. ' + localPart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    if (!picture) {
      picture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5`;
    }

    let therapist = await Therapist.findOne({ email });

    if (!therapist) {
      // First time Google sign-in: create new practitioner account
      const slug = await generateSlug(name);
      therapist = new Therapist({
        email,
        name,
        slug,
        google_id: google_id || `google_${Date.now()}`,
        avatar: picture,
        title: 'Licensed Mental Health Practitioner',
        subscription_tier: 'free'
      });
      await therapist.save();

      // Initialize default availability safely
      try {
        const Availability = require('../models/Availability');
        const existingAvail = await Availability.findOne({ therapist_id: therapist._id });
        if (!existingAvail) {
          await Availability.create({
            therapist_id: therapist._id,
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
        }
      } catch (availErr) {
        console.warn('Availability initialization warning:', availErr.message);
      }
    } else {
      let shouldSave = false;
      if (!therapist.google_id && google_id) {
        therapist.google_id = google_id;
        shouldSave = true;
      }
      if (!therapist.avatar && picture) {
        therapist.avatar = picture;
        shouldSave = true;
      }
      if (shouldSave) {
        await therapist.save();
      }
    }

    const payload = { id: therapist.id };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'unfazed_jwt_secret_super_secure_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      therapist: {
        id: therapist.id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        subscription_tier: therapist.subscription_tier,
        avatar: therapist.avatar,
        title: therapist.title
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    res.status(500).json({ message: 'Google Authentication Server Error: ' + err.message });
  }
};

