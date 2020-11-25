package util

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

type ctxKeySpaceID int

// SpaceIDKey is the key that holds the unique space ID in a request context.
const SpaceIDKey ctxKeySpaceID = 0

// CheckSpace check X-Space in header
func CheckSpace(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if strings.Split(strings.Trim(r.URL.Path, "/"), "/")[1] != "spaces" {
			space := r.Header.Get("X-Space")
			if space == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			uid, err := strconv.Atoi(space)
			if err != nil || uid == 0 {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			ctx := r.Context()

			ctx = context.WithValue(ctx, SpaceIDKey, uid)
			h.ServeHTTP(w, r.WithContext(ctx))
			return
		}
	})
}

// GetSpace return space ID
func GetSpace(ctx context.Context) (int, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	spaceID := ctx.Value(SpaceIDKey)
	if spaceID != nil {
		return spaceID.(int), nil
	}
	return 0, errors.New("something went wrong")
}
