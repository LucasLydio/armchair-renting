const { json, options, badRequest, serverError } = require('../../backend/response');
const { requireSession } = require('../../backend/apiAuth');
const { deleteArmchair } = require('../../backend/apiArmchairs');

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') return options(event);
    if (event.httpMethod !== 'DELETE') return json(event, 405, { error: 'Use DELETE' });

    requireSession(event);

    const { armchair_id } = event.queryStringParameters || {};
    if (!armchair_id) return badRequest(event, 'armchair_id é obrigatório');

    const data = await deleteArmchair(armchair_id);
    return json(event, 200, { data });
  } catch (err) {
    if (err?.statusCode === 401) return json(event, 401, { error: 'Unauthorized' });
    return serverError(event, err);
  }
};

