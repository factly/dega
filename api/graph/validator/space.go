package validator

import (
	"context"
	"errors"

	"net/http"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ctxKeySpaceID int

// SpaceIDKey is the key that holds the unique space ID in a request context.
const SpaceIDKey ctxKeySpaceID = 0

type ValidationBody struct {
	Token string `json:"token" validate:"required"`
}

// CheckSpace - to check Space in header
func CheckSpace() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			spaceHeader := r.Header.Get("X-Space")
			authHeader := r.Header.Get("X-Dega-API-Key")

			if spaceHeader == "" || authHeader == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			sID, err := uuid.Parse(spaceHeader)
			if err != nil || sID == uuid.Nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			space := &models.Space{}

			err = config.DB.Model(&models.Space{}).Where(&models.Space{
				ID: sID,
			}).First(&space).Error

			if err != nil {
				if err == gorm.ErrRecordNotFound {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			spaceToken := &models.SpaceToken{}

			err = config.DB.Model(&models.SpaceToken{}).Where(&models.SpaceToken{
				SpaceID: sID,
				Token:   authHeader,
			}).First(&spaceToken).Error

			if err != nil {
				if err == gorm.ErrRecordNotFound {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			ctx := r.Context()
			ctx = context.WithValue(ctx, SpaceIDKey, sID.String())
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetSpace return space ID
func GetSpace(ctx context.Context) (uuid.UUID, error) {
	if ctx == nil {
		return uuid.Nil, errors.New("context not found")
	}
	spaceID := ctx.Value(SpaceIDKey).(string)

	parseSpaceID, err := uuid.Parse(spaceID)
	if err != nil {
		return uuid.Nil, errors.New("something went wrong")
	}

	return parseSpaceID, nil

}
