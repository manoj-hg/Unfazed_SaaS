const Package = require('../models/Package');
const ClientPackage = require('../models/ClientPackage');
const entitlementService = require('../services/entitlementService');

exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ therapist_id: req.user.id });
    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createPackage = async (req, res) => {
  try {
    const entitlement = await entitlementService.canAccess(req.user.id, 'can_sell_packages');
    if (!entitlement.allowed) {
      return res.status(403).json({
        code: 'ENTITLEMENT_LOCKED',
        feature: 'can_sell_packages',
        message: 'Selling multi-session packages is a Pro feature. Upgrade to unlock session bundling.'
      });
    }

    const { name, session_count, price, discount_percentage, description, validity_days } = req.body;

    const pkg = new Package({
      therapist_id: req.user.id,
      name,
      session_count,
      price,
      discount_percentage: discount_percentage || 10,
      description: description || '',
      validity_days: validity_days || 90
    });

    await pkg.save();
    res.status(201).json(pkg);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.deletePackage = async (req, res) => {
  try {
    await Package.findOneAndDelete({ _id: req.params.id, therapist_id: req.user.id });
    res.json({ message: 'Package removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getClientPackages = async (req, res) => {
  try {
    const clientPackages = await ClientPackage.find({ therapist_id: req.user.id })
      .populate('client_id', 'name email')
      .populate('package_id', 'name session_count price')
      .sort({ createdAt: -1 });
    res.json(clientPackages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
