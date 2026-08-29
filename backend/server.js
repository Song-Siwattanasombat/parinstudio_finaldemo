import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoute.js';
import orderRoutes from './routes/orderRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import uploadRoutes from './routes/uploadRoutes.js';
import siteSettingsRoutes from './routes/siteSettingsRoutes.js';
import SiteSettings from './models/siteSettingsModel.js';

const port = process.env.PORT || 5000;

connectDB(); // Connect to the MongoDB database

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

// API routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/api/settings', siteSettingsRoutes);

app.get('/api/config/paypal', async (req, res) => {
  res.send({ clientId: '' });
});

app.get('/api/config/payments', async (req, res) => {
  const settings = await SiteSettings.findOne({}).catch(() => null);

  res.send({
    stripeEnabled: settings?.stripeEnabled !== false,
    stripeConfigured: Boolean(settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY),
    paypalEnabled: false,
    paypalConfigured: false,
  });
});

if (!process.env.VERCEL) {
  const __dirname = path.resolve(); // set __dirname to current directory
  app.use('/uploads', express.static(path.join(__dirname,'/uploads')));

  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;
