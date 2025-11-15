const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');

// =========================
// POST /api/user/2fa/setup
// =========================
router.post('/setup', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const secret = speakeasy.generateSecret({
      name: `KonnectX (${user.email})`,
      length: 20
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: '2FA setup successful',
      qrCode: qrDataUrl,
      manualKey: secret.base32
    });

  } catch (err) {
    console.error('2fa/setup error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =========================
// POST /api/user/2fa/verify
// =========================
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const user = await User.findOne({ email });
    if (!user || !user.twoFactorSecret) return res.status(400).json({ success: false, message: '2FA not initialized' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: String(otp),
      window: 1
    });

    if (!verified) return res.status(400).json({ success: false, message: 'Invalid token' });

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: '2FA verified and enabled successfully' });

  } catch (err) {
    console.error('2fa/verify error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
