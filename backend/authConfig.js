require('dotenv').config();

const COOKIE_NAME = process.env.COOKIE_NAME || 'armchair_session';
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_MAX_AGE_SECONDS = Number(process.env.COOKIE_MAX_AGE_SECONDS || 28800);

if (!JWT_SECRET) throw new Error('Missing env JWT_SECRET');

function isSecureCookie() {
  if (process.env.NETLIFY_DEV === 'true') return false;
  if (process.env.NODE_ENV === 'production') return true;
  return false;
}

module.exports = {
  COOKIE_NAME,
  JWT_SECRET,
  COOKIE_MAX_AGE_SECONDS,
  isSecureCookie,
};

