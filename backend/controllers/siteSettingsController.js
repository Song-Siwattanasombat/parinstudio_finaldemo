import asyncHandler from '../middleware/asyncHandler.js';
import SiteSettings from '../models/siteSettingsModel.js';
import User from '../models/userModel.js';

const wordLimits = {
  brandName: 4,
  heroTitle: 12,
  heroText: 35,
  aboutTitle: 8,
  aboutText: 18,
  featureTitle: 8,
  featureText: 30,
  reviewTitle: 8,
  reviewText: 30,
};

const countWords = (value) =>
  String(value || '').trim().split(/\s+/).filter(Boolean).length;

const settingsResponse = (settings) => {
  const settingsObject = settings.toObject();

  delete settingsObject.paypalClientSecret;
  delete settingsObject.paypalClientId;
  delete settingsObject.paypalEnabled;
  delete settingsObject.stripeSecretKey;

  return {
    ...settingsObject,
    hasStripeSecretKey: Boolean(settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY),
  };
};

const getSiteSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne({});

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  res.status(200).json(settingsResponse(settings));
});

const updateSiteSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne({});

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  const nextStripeSecretKey = req.body.stripeSecretKey;
  const currentStripeSecretKey = settings.stripeSecretKey || '';
  const stripeSecretKeyChanged =
    nextStripeSecretKey !== undefined &&
    nextStripeSecretKey !== '' &&
    nextStripeSecretKey !== currentStripeSecretKey;

  if (stripeSecretKeyChanged) {
    if (!req.body.adminPassword) {
      res.status(400);
      throw new Error('Admin password is required to change payment account settings');
    }

    const adminUser = await User.findById(req.user._id);

    if (!adminUser || !(await adminUser.matchPassword(req.body.adminPassword))) {
      res.status(401);
      throw new Error('Invalid admin password');
    }
  }

  const fields = [
    'brandName',
    'logoImage',
    'heroTitle',
    'heroText',
    'heroImage',
    'aboutTitle',
    'aboutText',
    'featureTitle',
    'featureText',
    'featureImage',
    'reviewTitle',
    'reviewText',
    'reviewImage',
    'contactEmail',
    'stripeEnabled',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (wordLimits[field] && countWords(req.body[field]) > wordLimits[field]) {
        res.status(400);
        throw new Error(`${field} must be ${wordLimits[field]} words or fewer`);
      }

      settings[field] = req.body[field];
    }
  });

  if (stripeSecretKeyChanged) {
    settings.stripeSecretKey = nextStripeSecretKey;
  }

  const updatedSettings = await settings.save();
  res.status(200).json(settingsResponse(updatedSettings));
});

export { getSiteSettings, updateSiteSettings };
