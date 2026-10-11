const Therapist = require('../models/Therapist');
const Package = require('../models/Package');
const entitlementService = require('../services/entitlementService');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');

exports.updateProfile = async (req, res) => {
  const {
    name,
    title,
    bio,
    qualifications,
    experience_years,
    city,
    session_rate,
    currency,
    phone,
    gstin,
    avatar,
    specializations,
    languages,
    slug
  } = req.body;

  const therapistFields = {};
  if (name !== undefined) therapistFields.name = name;
  if (title !== undefined) therapistFields.title = title;
  if (bio !== undefined) therapistFields.bio = bio;
  if (qualifications !== undefined) therapistFields.qualifications = qualifications;
  if (experience_years !== undefined) therapistFields.experience_years = experience_years;
  if (city !== undefined) therapistFields.city = city;
  if (session_rate !== undefined) therapistFields.session_rate = session_rate;
  if (currency !== undefined) therapistFields.currency = currency;
  if (phone !== undefined) therapistFields.phone = phone;
  if (gstin !== undefined) therapistFields.gstin = gstin;
  if (avatar !== undefined) therapistFields.avatar = avatar;
  if (specializations !== undefined) therapistFields.specializations = specializations;
  if (languages !== undefined) therapistFields.languages = languages;

  // If changing slug, check uniqueness
  if (slug) {
    const existing = await Therapist.findOne({ slug, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(400).json({ message: 'Branded slug is already taken by another practitioner.' });
    }
    therapistFields.slug = slug;
  }

  try {
    const therapist = await Therapist.findByIdAndUpdate(
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
    const therapist = await Therapist.findOne({ slug: req.params.slug }).select('-password_hash');
    if (!therapist) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    // Include available packages
    const packages = await Package.find({ therapist_id: therapist._id, active: true });

    res.json({
      ...therapist.toObject(),
      packages
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getMyEntitlements = async (req, res) => {
  try {
    const entitlements = await entitlementService.getTherapistEntitlements(req.user.id);
    const availableTiers = await SubscriptionTierConfig.find();
    res.json({
      current: entitlements,
      availableTiers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.upgradeTier = async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['free', 'pro', 'enterprise'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid subscription tier selected' });
    }

    const therapist = await Therapist.findByIdAndUpdate(
      req.user.id,
      { subscription_tier: tier },
      { new: true }
    ).select('-password_hash');

    const entitlements = await entitlementService.getTherapistEntitlements(req.user.id);

    res.json({
      message: `Practice plan successfully upgraded to ${tier.toUpperCase()}`,
      therapist,
      entitlements
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
