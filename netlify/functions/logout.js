const { json, options, serverError } = require('../../backend/response');
const { buildClearCookie } = require('../../backend/apiAuth');

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') return options(event);
    if (event.httpMethod !== 'POST') return json(event, 405, { error: 'Use POST' });

    return json(event, 200, { ok: true }, { 'Set-Cookie': buildClearCookie() });
  } catch (err) {
    return serverError(event, err);
  }
};

