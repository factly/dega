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
type errorsList struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// Parser - to parse error messages
func Parser(w http.ResponseWriter, r *http.Request, message string, statusCode int) {

	err := make([]errorsList, 1)
	err[0] = errorsList{
		Code:    statusCode,
		Message: message,
	}
	renderx.JSON(w, statusCode, err)
}
