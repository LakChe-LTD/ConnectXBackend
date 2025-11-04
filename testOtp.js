const speakeasy = require('speakeasy');

// Copy the secret from your DB exactly
const secret = 'G5VVWW2RJFGVIKBZKJBT4RDZLA2SSUSI';

// Enter the 6-digit OTP currently showing in Authy
const token = '216360';

const verified = speakeasy.totp.verify({
  secret,
  encoding: 'base32',
  token,
  window: 2
});

console.log('Verified?', verified);
