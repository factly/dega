package util

import (
	"net/http"

	"github.com/factly/x/errorx"
)

func CannotDeleteError() errorx.Message {
	return errorx.Message{
		Code:    http.StatusInternalServerError,
		Message: "Cannot delete item",
	}
}
