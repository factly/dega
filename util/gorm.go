package util

import (
	"context"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/go-chi/chi/middleware"
)

// GormRequestID returns middleware to add request_id in gorm context
func GormRequestID(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := middleware.GetReqID(r.Context())
		config.DB = config.DB.WithContext(context.WithValue(r.Context(), middleware.RequestIDKey, requestID))
		h.ServeHTTP(w, r)
	})
}
