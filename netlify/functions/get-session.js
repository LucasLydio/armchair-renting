const { json, options, serverError } = require('../../backend/response');
const { getSessionFromEvent } = require('../../backend/apiAuth');

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') return options(event);
    if (event.httpMethod !== 'GET') return json(event, 405, { error: 'Use GET' });

    const session = getSessionFromEvent(event);
    return json(event, 200, { ok: true, session });
  } catch (err) {
    return serverError(event, err);
  }
};

