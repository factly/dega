package util

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/zitadel/zitadel-go/v3/pkg/authorization/oauth"
	zitadelMiddleware "github.com/zitadel/zitadel-go/v3/pkg/http/middleware"
)

type ctxKeyUserID int

// UserIDKey is the key that holds the unique user ID in a request context.
const UserIDKey ctxKeyUserID = 0

// CheckUser check X-User in header
func CheckUser(zitadelInterceptor *zitadelMiddleware.Interceptor[*oauth.IntrospectionContext]) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			authCtx := zitadelInterceptor.Context(ctx)

			if authCtx == nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			ctx = context.WithValue(ctx, UserIDKey, authCtx.UserID())
			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUser return user ID
func GetUser(ctx context.Context) (int, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	userID := ctx.Value(UserIDKey)

	log.Println("userID", userID)
	if userID != nil {
		return userID.(int), nil
	}
	return 0, errors.New("something went wrong")
}
