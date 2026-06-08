import mongoose from 'mongoose';

const siteSettingsSchema = mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    default: 'Parin Studio',
  },
  logoImage: {
    type: String,
    required: true,
    default: '/images/hero-section.jpg',
  },
  heroTitle: {
    type: String,
    required: true,
    default: 'Start where you feel calm.\nWrite where you grow.',
  },
  heroText: {
    type: String,
    required: true,
    default: 'Parin creates notebooks inspired by gardens, sunlight, and quiet moments.\nEach page is a gentle space for you to slow down, listen inward, and begin again.',
  },
  heroImage: {
    type: String,
    required: true,
    default: '/images/hero-section.jpg',
  },
  aboutTitle: {
    type: String,
    required: true,
    default: 'Your Personal Garden',
  },
  aboutText: {
    type: String,
    required: true,
    default: 'More than stationery, PARIN is a quiet companion\nfor journaling, reflection, and mindful living.',
  },
  featureTitle: {
    type: String,
    required: true,
    default: 'Why choose PARIN',
  },
  featureText: {
    type: String,
    required: true,
    default: 'Parin was born from a love of gardens\nand the art of writing. We believe in creating\na quiet space where you can pause, reflect, and grow.',
  },
  featureImage: {
    type: String,
    required: true,
    default: '/images/hero-section.jpg',
  },
  reviewTitle: {
    type: String,
    required: true,
    default: 'From garden to notebook',
  },
  reviewText: {
    type: String,
    required: true,
    default: '"Parin was born from a love of gardens\nand the art of writing. We believe in creating\na quiet space where you can pause, reflect, and grow"',
  },
  reviewImage: {
    type: String,
    required: true,
    default: '/images/hero-section.jpg',
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'parin.studio25@gmail.com',
  },
  paypalClientId: {
    type: String,
    default: '',
  },
  paypalClientSecret: {
    type: String,
    default: '',
  },
  paypalEnabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  stripeSecretKey: {
    type: String,
    default: '',
  },
  stripeEnabled: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
