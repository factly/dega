package validator

import (
	"context"
	"errors"
	"net/http"
	"strconv"
)

type ctxKeySpaceID int

// SpaceIDKey is the key that holds the unique space ID in a request context.
const SpaceIDKey ctxKeySpaceID = 0

// CheckSpace - to check Space in header
func CheckSpace() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			space := r.Header.Get("X-Space")

			if space == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			uid, err := strconv.Atoi(space)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			ctx := r.Context()

			ctx = context.WithValue(ctx, SpaceIDKey, uid)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetSpace return space ID
func GetSpace(ctx context.Context) (uint, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	spaceID := ctx.Value(SpaceIDKey)
	if spaceID != nil {
		return uint(spaceID.(int)), nil
	}
	return 0, errors.New("something went wrong")
}
