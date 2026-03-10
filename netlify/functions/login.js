const { json, badRequest, options, serverError } = require('../../backend/response');
const { validateLogin, signToken, buildSessionCookie, FIXED_USER } = require('../../backend/apiAuth');

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'OPTIONS') return options(event);
    if (event.httpMethod !== 'POST') return badRequest(event, 'Use POST');

    const body = event.body ? JSON.parse(event.body) : {};
    const username = body?.username;
    const password = body?.password;

    if (!validateLogin({ username, password })) {
      return json(event, 401, { error: 'Usuário ou senha inválidos' });
    }

    const token = signToken();
    return json(
      event,
      200,
      { ok: true, user: FIXED_USER },
      { 'Set-Cookie': buildSessionCookie(token) },
    );
  } catch (err) {
    return serverError(event, err);
  }
};

