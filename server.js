require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/authRoutes');  
const auth2faRoutes = require('./routes/auth2fa');  
const twoFaRoutes = require('./routes/2fa');
const walletRoutes = require('./routes/walletRoutes');
const referralRoutes = require('./routes/referralRoutes');
const storeRoutes = require('./routes/storeRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const hotspotRoutes = require('./routes/hotspotRoutes');
const cartRoutes = require('./routes/cartRoutes');





const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route (health check)
app.get('/', (req, res) => {
  res.send('ConnectX Backend API is running!');
});

// API routes
app.use('/api/store', storeRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth/2fa', auth2faRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/sessions', sessionRoutes);
app.use('/api/hotspots', hotspotRoutes);
app.use('/api/user/2fa', twoFaRoutes);
app.use('/api/wallet', walletRoutes);

// ... other routes
app.use('/api/cart', cartRoutes);


// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
