require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth2fa');  
const twoFaRoutes = require('./routes/2fa');
const walletRoutes = require("./routes/walletRoutes");
const referralRoutes = require('./routes/referralRoutes');
const storeRoutes = require('./routes/storeRoutes');

const app = express();

connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/store', storeRoutes);


app.use('/api/referrals', referralRoutes);
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/user', require('./routes/userRoutes')); 
app.use('/api/hotspots', require('./routes/hotspotRoutes'));
app.use('/api/user', require('./routes/sessionRoutes'));
app.use('/api/user/2fa', twoFaRoutes);

app.use("/api/wallet", walletRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
