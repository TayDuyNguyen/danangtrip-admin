export function successEnvelope<T>(data: T, message = 'success') {
  return {
    code: 200,
    message,
    data,
  };
}

export function errorEnvelope(message: string, code = 422) {
  return {
    code,
    message,
    data: null,
  };
}
