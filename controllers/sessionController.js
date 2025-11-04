// controllers/sessionController.js
const UserSession = require('../models/UserSession');

const getUserDevices = async (req, res) => {
  try {
    const sessions = await UserSession.find({ user: req.userId }).sort({ lastActive: -1 });

    const devices = sessions.map(s => ({
      id: s._id,
      device: s.device || s.userAgent,
      userAgent: s.userAgent,
      ip: s.ip,
      browser: s.browser,
      os: s.os,
      lastActive: s.lastActive,
      createdAt: s.createdAt
    }));

    res.json({ success: true, devices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteUserDevice = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await UserSession.findOne({ _id: sessionId, user: req.userId });
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    await session.deleteOne();
    res.json({ success: true, message: 'Device logged out' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getUserDevices, deleteUserDevice };
