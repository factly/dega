package render

import (
	"encoding/json"
	"net/http"
)

// JSON - render json
func JSON(w http.ResponseWriter, status int, data interface{}) {

	w.Header().Set("Content-type", "application/json")

	w.WriteHeader(status)

	json.NewEncoder(w).Encode(data)
}
