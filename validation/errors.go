package validation

import (
	"net/http"
	"strings"

	"github.com/factly/dega-server/util/render"
)

// InvalidID - response for invalid ID
func InvalidID(w http.ResponseWriter, r *http.Request) {
	var msg []string
	msg = append(msg, "Invalid id")
	render.JSON(w, http.StatusBadRequest, msg)
}

// InvalidFieldIDs - response for invalid field IDs
func InvalidFieldIDs(w http.ResponseWriter, r *http.Request) {
	var msg []string
	msg = append(msg, "Invalid  field ids")
	render.JSON(w, http.StatusBadRequest, msg)
}

// RecordNotFound - response for record not found
func RecordNotFound(w http.ResponseWriter, r *http.Request) {
	var msg []string
	msg = append(msg, "Record not found")
	render.JSON(w, http.StatusNotFound, msg)
}

// ValidErrors - errors from validator
func ValidErrors(w http.ResponseWriter, r *http.Request, msg string) {
	err := strings.Split(msg, "\n")
	render.JSON(w, http.StatusBadRequest, err)
}
