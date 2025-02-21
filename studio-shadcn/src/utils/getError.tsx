interface ErrorMessage {
  message: string;
}

// Interface for the API error response
interface ErrorResponse {
  data: {
    errors: ErrorMessage[];
  };
}

// Interface for the error object
interface ApiError extends Error {
  response?: ErrorResponse;
}

function getError(error: ApiError): string {
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
