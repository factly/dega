package middleware

import (
	"context"
	"net/http"
)

// Client adding client id into context
func Client() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			client := r.Header.Get("client")

			// adding client into context
			ctx := context.WithValue(r.Context(), "client", client)

			// and call the next with our new context
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}
