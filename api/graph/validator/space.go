package validator

import (
	"context"
	"errors"
	"fmt"

	"net/http"
	"strconv"

	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
)

type ctxKeySpaceID int
type ctxKeyToken string

// SpaceIDKey is the key that holds the unique space ID in a request context.
const SpaceIDKey ctxKeySpaceID = 0
const TokenIDKey ctxKeyToken = "spaceToken"

type ValidationBody struct {
	Token string `json:"token" validate:"required"`
}

// CheckSpace - to check Space in header
func CheckSpace() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			space := r.Header.Get("X-Space")
			if space == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			sID, err := strconv.Atoi(space)
			if err != nil || sID == 0 {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			authHeader := r.Header.Get("X-Dega-API-Key")
			if authHeader == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			tokenBody := ValidationBody{
				Token: authHeader,
			}

			res, err := requestx.Request("POST", viper.GetString("kavach_url")+"/spaces/"+fmt.Sprintf("%d", sID)+"/validateToken", tokenBody, nil)
			if err != nil || res.StatusCode != http.StatusOK {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			ctx := r.Context()
			ctx = context.WithValue(ctx, SpaceIDKey, sID)
			ctx = context.WithValue(ctx, TokenIDKey, authHeader)
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

func GetSpaceToken(ctx context.Context) (string, error) {
	if ctx == nil {
		return "", errors.New("context not found")
	}
	token := ctx.Value(TokenIDKey)
	if token != nil {
		return token.(string), nil
	}
	return "", errors.New("something went wrong")
}
