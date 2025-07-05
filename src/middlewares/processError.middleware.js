function processError(error, request, response, next) {
  const statusCode = error.statusCode ? error.statusCode : 500;
  const message = error.message ? error.message : 'Internal server error';
  return response.status(statusCode).json({
    message,
    statusCode,
  });
}

export default processError;
