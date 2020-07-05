package errors

import (
	"net/http"

	"github.com/factly/x/renderx"
)

type message struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Source  string `json:"source"`
}

// InvalidID error
func InvalidID() message {
	return message{
		Code:    404,
		Message: "Invalid ID",
	}
}

// InternalServerError error
func InternalServerError() message {
	return message{
		Code:    500,
		Message: "Something went wrong",
	}
}

// DBError - Database errors
func DBError() message {
	return message{
		Code:    500,
		Message: "Something went wrong with db queries",
	}
}

//RecordNotFound - record not found error
func RecordNotFound() message {
	return message{
		Code:    404,
		Message: "Record not found",
	}
}

//DecodeError - errors while decoding request body
func DecodeError() message {
	return message{
		Code:    422,
		Message: "Invalid request body",
	}
}

//NetworkError - errors while decoding request body
func NetworkError() message {
	return message{
		Code:    503,
		Message: "Connection failed",
	}
}

type response struct {
	Errors interface{} `json:"errors"`
}

// Render -  render errors
func Render(w http.ResponseWriter, err interface{}, code int) {

	result := response{
		Errors: err,
	}
	renderx.JSON(w, code, result)
}

// Parser - to parse error messages
func Parser(msg message) []message {

	err := make([]message, 1)
	err[0] = msg
	return err
}
