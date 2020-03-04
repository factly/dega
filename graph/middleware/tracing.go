package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

const requestIDKey = "logging"

// Tracing incoming req
func Tracing() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			requestID := r.Header.Get("X-Request-Id")
			if requestID == "" {
				requestID = fmt.Sprintf("%d", time.Now().UnixNano())
			}
			ctx := context.WithValue(r.Context(), requestIDKey, requestID)
			w.Header().Set("X-Request-Id", requestID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
