const { json, options, badRequest, serverError } = require('../../backend/response');
const { requireSession } = require('../../backend/apiAuth');
const { validateArmchairPayload } = require('../../backend/validators');
const { updateArmchair } = require('../../backend/apiArmchairs');

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') return options(event);
    if (!['PUT', 'PATCH'].includes(event.httpMethod)) return json(event, 405, { error: 'Use PUT/PATCH' });

    requireSession(event);

    const { armchair_id } = event.queryStringParameters || {};
    if (!armchair_id) return badRequest(event, 'armchair_id é obrigatório');

    const body = event.body ? JSON.parse(event.body) : {};
    const { value, errors, ok } = validateArmchairPayload(body, { partial: true });
    if (!ok) return badRequest(event, 'Campos inválidos', errors);
    if (Object.keys(value).length === 0) return badRequest(event, 'Nada para atualizar');

    const data = await updateArmchair(armchair_id, value);
    return json(event, 200, { data });
  } catch (err) {
    if (err?.statusCode === 401) return json(event, 401, { error: 'Unauthorized' });
    return serverError(event, err);
  }
};

