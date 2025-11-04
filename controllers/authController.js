// controllers/authController.js
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user._id,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    user.lastLogin = new Date();
    await user.save();

    // Session tracking
    const ua = req.get('user-agent') || '';
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';

    const detect = (uaString) => {
      const a = { browser: 'Unknown', os: 'Unknown', device: '' };
      if (/iphone|ipad|ipod/i.test(uaString)) a.device = 'iPhone/iPad';
      else if (/android/i.test(uaString)) a.device = 'Android';
      else if (/macintosh|mac os x/i.test(uaString)) a.device = 'Mac';
      else if (/windows|win32/i.test(uaString)) a.device = 'Windows';
      else a.device = 'Unknown';

      if (/chrome\/([0-9.]+)/i.test(uaString)) a.browser = 'Chrome';
      else if (/firefox\/([0-9.]+)/i.test(uaString)) a.browser = 'Firefox';
      else if (/safari\/([0-9.]+)/i.test(uaString)) a.browser = 'Safari';

      if (/android/i.test(uaString)) a.os = 'Android';
      else if (/iphone|ipad|ipod/i.test(uaString)) a.os = 'iOS';
      else if (/macintosh|mac os x/i.test(uaString)) a.os = 'macOS';
      else if (/windows|win32/i.test(uaString)) a.os = 'Windows';

      return a;
    };

    const uaInfo = detect(ua);

    const sessionDoc = await UserSession.create({
      user: user._id,
      device: `${uaInfo.device} - ${uaInfo.browser}`,
      userAgent: ua,
      ip,
      os: uaInfo.os,
      browser: uaInfo.browser,
      lastActive: new Date()
    });

    return res.json({
      success: true,
      token,
      refreshToken,
      sessionId: sessionDoc._id,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REFRESH TOKEN
const refreshToken = (req, res) => {
  try {
    const { token } = req.body; // client sends refreshToken

    if (!token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Invalid refresh token' });

      const newToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ success: true, token: newToken });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select("+password");

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Old password incorrect" });

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate password reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Normally, we send email — but for now just return token as simulation
    res.json({
      success: true,
      message: "Password reset email sent",
      resetToken // You will use this later to reset password
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGOUT
const logout = (req, res) => {
  // For JWT, logout is client-side (delete token)
  // Optionally, you can maintain a blacklist in DB
  res.json({ success: true, message: 'Logged out successfully' });
};
// controllers/authController.js (append near other exports)
const fetch = global.fetch || require('node-fetch'); // node 18+ has fetch; node-fetch fallback
const { default: fetchDefault } = require('node-fetch'); // in case require needed

// Helper to generate tokens (reuse same method as login)
function generateTokens(user) {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
}

/**
 * Google social login
 * Expects body: { idToken: '<google id_token>' }
 */
const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    // Verify the token with Google's tokeninfo endpoint
    // You can also use google-auth-library for stronger verification.
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const resp = await fetch(googleVerifyUrl);
    if (!resp.ok) return res.status(401).json({ error: 'Invalid Google token' });

    const payload = await resp.json();
    // payload includes: sub (google id), email, email_verified, name, picture, given_name, family_name
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      // optional check to ensure token is for your client id
      return res.status(401).json({ error: 'Google token was not issued for this app' });
    }

    const googleEmail = payload.email;
    // Find or create user
    let user = await User.findOne({ email: googleEmail });
    if (!user) {
      user = new User({
        firstName: payload.given_name || payload.name?.split(' ')[0] || 'Google',
        lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '',
        email: googleEmail,
        password: '', // empty because social login; keep select:false so no leaks
        profileImage: payload.picture || '',
        emailVerified: payload.email_verified || false,
        role: 'user'
      });
      await user.save();
    }

    const { token, refreshToken } = generateTokens(user);

    return res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google sign-in error', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Facebook social login
 * Expects body: { accessToken: '<facebook access token>' }
 */
const facebookSignIn = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'accessToken required' });

    // Validate token & get profile: call /me?fields=id,name,email,picture
    const fbFields = 'id,name,email,picture';
    const fbUrl = `https://graph.facebook.com/me?fields=${fbFields}&access_token=${accessToken}`;
    const resp = await fetch(fbUrl);
    if (!resp.ok) {
      const body = await resp.text();
      return res.status(401).json({ error: 'Invalid Facebook token', detail: body });
    }

    const profile = await resp.json();
    // profile: { id, name, email, picture: { data: { url } } }
    const fbEmail = profile.email;
    // If email is not provided (FB sometimes doesn't return email), consider using id as unique fallback
    if (!fbEmail) {
      // optional: request more permissions from frontend or return error
      return res.status(400).json({ error: 'Facebook account does not provide email. Request email permission.' });
    }

    let user = await User.findOne({ email: fbEmail });
    if (!user) {
      const [firstName, ...rest] = (profile.name || 'Facebook User').split(' ');
      user = new User({
        firstName,
        lastName: rest.join(' '),
        email: fbEmail,
        password: '',
        profileImage: profile.picture?.data?.url || '',
        emailVerified: true,
        role: 'user'
      });
      await user.save();
    }

    const { token, refreshToken } = generateTokens(user);

    return res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Facebook sign-in error', error);
    return res.status(500).json({ error: error.message });
  }
};


module.exports = { register, login, refreshToken, logout, changePassword,forgotPassword, googleSignIn, facebookSignIn
 };








