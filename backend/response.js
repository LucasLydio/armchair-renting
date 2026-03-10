function getOrigin(event) {
  return (
    event?.headers?.origin ||
    event?.headers?.Origin ||
    event?.headers?.['x-forwarded-host'] ||
    null
  );
}

function corsHeaders(event) {
  const origin = getOrigin(event);
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  };

  if (origin && origin.startsWith('http')) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Vary'] = 'Origin';
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

function json(event, statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(event),
      ...extraHeaders,
    },
  };
}

function options(event) {
  return { statusCode: 204, body: '', headers: { ...corsHeaders(event) } };
}

function badRequest(event, message, details) {
  return json(event, 400, { error: message, details });
}

function unauthorized(event, message = 'Unauthorized') {
  return json(event, 401, { error: message });
}

function notFound(event, message = 'Not found') {
  return json(event, 404, { error: message });
}

function serverError(event, err) {
  return json(event, 500, { error: err?.message || 'Internal error' });
}

module.exports = {
  corsHeaders,
  json,
  options,
  badRequest,
  unauthorized,
  notFound,
  serverError,
};

