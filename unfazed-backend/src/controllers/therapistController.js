const Therapist = require('../models/Therapist');

exports.updateProfile = async (req, res) => {
  const { name, bio, specializations, languages } = req.body;
  const therapistFields = {};
  if (name) therapistFields.name = name;
  if (bio) therapistFields.bio = bio;
  if (specializations) therapistFields.specializations = specializations;
  if (languages) therapistFields.languages = languages;

  try {
    let therapist = await Therapist.findById(req.user.id);
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

    therapist = await Therapist.findByIdAndUpdate(
      req.user.id,
      { $set: therapistFields },
      { new: true }
    ).select('-password_hash');

    res.json(therapist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getPublicProfileBySlug = async (req, res) => {
  try {
    const therapist = await Therapist.findOne({ slug: req.params.slug }).select('-password_hash -email');
    if (!therapist) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(therapist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
