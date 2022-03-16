const responseWrapper = <T>(data: T, message: string, status: number) => ({
  result: data,
  message: message,
  status: status
});

const internalServerError = {
  result: null,
  message: 'Internal Server Error',
  status: 500
};

export { internalServerError };

export default responseWrapper;
