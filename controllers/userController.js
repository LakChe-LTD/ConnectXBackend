const User = require("../models/User");
const UserDevice = require("../models/UserDevice");  // ✅ correct
const speakeasy = require('speakeasy');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.userId; // ✅ consistent with other methods

    const device = await UserDevice.findOne({ _id: deviceId, userId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found or unauthorized"
      });
    }

    await device.deleteOne();

    return res.json({
      success: true,
      message: "Device removed successfully"
    });

  } catch (error) {
    console.error("Error removing device:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


exports.setupTwoFactorAuth = async (req, res) => {
  try {
    // 1) Generate new TOTP secret
    const secret = speakeasy.generateSecret({
      name: "KonnectX", // your platform name (shows inside Google Authenticator app)
      length: 20
    });

    // 2) save secret to DB, but don’t enable 2FA yet
    await User.findByIdAndUpdate(req.userId, { 
      twoFactorSecret: secret.base32 
    });

    return res.json({
      success: true,
      message: "2FA secret generated",
      qrCodeUrl: secret.otpauth_url, // frontend will convert to QR code
      manualKey: secret.base32        // in case user wants to enter manually
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyTwoFactorAuth = async (req, res) => {
  try {
    const { token } = req.body; // user input OTP

    const user = await User.findById(req.userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: "2FA not initialized" });
    }

    // ✅ Verify OTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    // ✅ Enable 2FA permanently
    user.twoFactorEnabled = true;
    await user.save();

    return res.json({
      success: true,
      message: "2FA successfully enabled"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

