const express = require('express');
const router = express.Router();
const { passport, generateToken } = require('../controllers/authSocialController');

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    // send token back to frontend or redirect with token
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);

module.exports = router;
