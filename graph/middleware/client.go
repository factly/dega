package middleware

import (
	"context"
	"net/http"
)

// Middleware decodes the share session cookie and packs the session into context
func Client() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			client := r.Header.Get("client")

			// Allow unauthenticated users in
			if client == "" {
				http.Error(w, "Invalid cookie", http.StatusForbidden)
				return
			}

			// put it in context
			ctx := context.WithValue(r.Context(), "client", client)

			// and call the next with our new context
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}
