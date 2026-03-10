const jwt = require('jsonwebtoken');
const { COOKIE_NAME, JWT_SECRET, COOKIE_MAX_AGE_SECONDS, isSecureCookie } = require('./authConfig');

const FIXED_USER = { username: 'adm1' };
const FIXED_PASSWORD = 'adm1';

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return acc;
      const key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function buildSessionCookie(token) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (isSecureCookie()) parts.push('Secure');
  return parts.join('; ');
}

function buildClearCookie() {
  const parts = [
    `${COOKIE_NAME}=`,
    'Max-Age=0',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (isSecureCookie()) parts.push('Secure');
  return parts.join('; ');
}

function signToken() {
  return jwt.sign({ sub: FIXED_USER.username }, JWT_SECRET, {
    expiresIn: COOKIE_MAX_AGE_SECONDS,
  });
}

function verifyToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (!payload?.sub) throw new Error('Invalid session');
  return { username: payload.sub };
}

function getSessionFromEvent(event) {
  const cookieHeader = event?.headers?.cookie || event?.headers?.Cookie || '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

function requireSession(event) {
  const session = getSessionFromEvent(event);
  if (!session) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  return session;
}

function validateLogin({ username, password }) {
  return username === FIXED_USER.username && password === FIXED_PASSWORD;
}

module.exports = {
  FIXED_USER,
  validateLogin,
  signToken,
  verifyToken,
  buildSessionCookie,
  buildClearCookie,
  getSessionFromEvent,
  requireSession,
};

