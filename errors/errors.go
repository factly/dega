package errors

import (
	"net/http"

	"github.com/factly/x/renderx"
)

// InvalidID error message
var InvalidID string = "Invalid ID"

// InternalServerError  message
var InternalServerError string = "Something went wrong"

// error type
type message struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Field   string `json:"title"`
}

type response struct {
	Errors interface{} `json:"errors"`
}

// Validator -  validation errors
func Validator(w http.ResponseWriter, err interface{}) {

	result := response{
		Errors: err,
	}
	renderx.JSON(w, 422, result)
}

// Parser - to parse error messages
func Parser(w http.ResponseWriter, msg string, statusCode int) {

	err := make([]message, 1)
	err[0] = message{
		Code:    statusCode,
		Message: msg,
	}
	result := response{
		Errors: err,
	}
	renderx.JSON(w, statusCode, result)
}
