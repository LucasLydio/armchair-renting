const { json, options, badRequest, serverError } = require('../../backend/response');
const { requireSession } = require('../../backend/apiAuth');
const { getAllArmchairs, getArmchairById } = require('../../backend/apiArmchairs');

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') return options(event);
    if (event.httpMethod !== 'GET') return json(event, 405, { error: 'Use GET' });

    requireSession(event);

    const { armchair_id, page, limit, name } = event.queryStringParameters || {};

    if (armchair_id) {
      const data = await getArmchairById(armchair_id);
      return json(event, 200, { data });
    }

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 50;
    if (pageInt <= 0 || limitInt <= 0) return badRequest(event, 'Parâmetros inválidos');

    const { data, count } = await getAllArmchairs({ page: pageInt, limit: limitInt, name });
    return json(event, 200, { data, count });
  } catch (err) {
    if (err?.statusCode === 401) return json(event, 401, { error: 'Unauthorized' });
    return serverError(event, err);
  }
};

