function getError(error) {
  if (
    error.response &&
    error.response.data &&
    error.response.data.errors &&
    error.response.data.errors.length > 0
  ) {
    return error.response.data.errors[0].message;
  } else {
    return error.message;
  }
}
export default getError;
