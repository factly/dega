package util

import (
	"context"
	"errors"
	"net/http"
	"strconv"
)

type ctxKeyUserID int

// UserIDKey is the key that holds the unique user ID in a request context.
const UserIDKey ctxKeyUserID = 0

// CheckUser check X-User in header
func CheckUser(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := r.Header.Get("X-User")
		if user == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		uid, err := strconv.Atoi(user)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		ctx := r.Context()
		ctx = context.WithValue(ctx, UserIDKey, uid)
		h.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUser return user ID
func GetUser(ctx context.Context) (int, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	userID := ctx.Value(UserIDKey)
	if userID != nil {
		return userID.(int), nil
	}
	return 0, errors.New("something went wrong")
}
