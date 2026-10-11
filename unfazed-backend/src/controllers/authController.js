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
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
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
      name = req.body.name || email.split('@')[0];
      picture = req.body.picture || '';
      google_id = req.body.google_id || `google_${Date.now()}`;
    }

    if (!email) {
      return res.status(400).json({ message: 'Google authentication payload missing email.' });
    }

    email = email.toLowerCase().trim();

    let therapist = await Therapist.findOne({ email });

    if (!therapist) {
      // First time Google sign-in: create new practitioner account
      const slug = await generateSlug(name || 'Dr. Practitioner');
      therapist = new Therapist({
        email,
        name: name || 'Dr. Practitioner',
        slug,
        google_id,
        avatar: picture || '',
        title: 'Licensed Mental Health Practitioner',
        subscription_tier: 'free'
      });
      await therapist.save();

      // Initialize default availability
      const Availability = require('../models/Availability');
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
    } else {
      if (!therapist.google_id && google_id) {
        therapist.google_id = google_id;
      }
      if (!therapist.avatar && picture) {
        therapist.avatar = picture;
      }
      await therapist.save();
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
        avatar: therapist.avatar
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    res.status(500).json({ message: 'Google Authentication Server Error' });
  }
};

