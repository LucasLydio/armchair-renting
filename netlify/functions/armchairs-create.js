const { json, options, badRequest, serverError } = require('../../backend/response');
const { requireSession } = require('../../backend/apiAuth');
const { validateArmchairPayload } = require('../../backend/validators');
const { createArmchair } = require('../../backend/apiArmchairs');

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') return options(event);
    if (event.httpMethod !== 'POST') return json(event, 405, { error: 'Use POST' });

    requireSession(event);

    const body = event.body ? JSON.parse(event.body) : {};
    const { value, errors, ok } = validateArmchairPayload(body, { partial: false });
    if (!ok) return badRequest(event, 'Campos inválidos', errors);

    const data = await createArmchair(value);
    return json(event, 201, { data });
  } catch (err) {
    if (err?.statusCode === 401) return json(event, 401, { error: 'Unauthorized' });
    return serverError(event, err);
  }
};

