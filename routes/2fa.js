const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const User = require('../models/User');

// POST /api/user/2fa/setup
router.post('/setup', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({ name: 'KonnectX' });

    // Save secret to user in DB
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.json({
      success: true,
      message: '2FA secret generated',
      qrCodeUrl: secret.otpauth_url,
      manualKey: secret.base32,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/user/2fa/verify
router.post('/verify', async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not initialized' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (verified) {
      user.twoFactorEnabled = true;
      await user.save();
      return res.json({ message: '2FA verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
