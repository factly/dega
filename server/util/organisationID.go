package util

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/middlewarex"
)

type ctxKeyOrganisationID int

// OrganisationIDKey is the key that holds the unique user ID in a request context.
const OrganisationIDKey ctxKeyOrganisationID = 0

// GenerateOrganisation check X-User in header
func GenerateOrganisation(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokens := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(tokens) <= 1 || tokens[1] != "spaces" {
			ctx := r.Context()
			sID, err := middlewarex.GetSpace(ctx)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			space := &model.Space{}
			space.ID = uint(sID)
			var count int64
			err = config.DB.Model(&model.Space{}).Find(&model.Space{
				Base: config.Base{
					ID: uint(sID),
				},
			}).Count(&count).Error

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			err = config.DB.First(space).Error

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			ctx = context.WithValue(ctx, OrganisationIDKey, space.OrganisationID)
			h.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		h.ServeHTTP(w, r)
	})
}

// GetOrganisation return organisation ID
func GetOrganisation(ctx context.Context) (int, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	organisationID := ctx.Value(OrganisationIDKey)
	if organisationID != nil {
		return organisationID.(int), nil
	}
	return 0, errors.New("something went wrong")
}
