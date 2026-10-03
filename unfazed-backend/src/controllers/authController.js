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
