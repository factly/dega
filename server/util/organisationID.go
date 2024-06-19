package util

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
)

type ctxKeyOrganisationID string

// OrganisationIDKey is the key that holds the unique user ID in a request context.
const OrganisationIDKey ctxKeyOrganisationID = ""

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

			userID, err := GetUser(r.Context())
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			//** need to make change in x-package if space id is given organisation should be returned
			organisationID, err := GetOrganisationIDfromSpaceID(uint(sID), uint(userID))
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			ctx = context.WithValue(ctx, OrganisationIDKey, organisationID)
			h.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		h.ServeHTTP(w, r)
	})
}

// GetOrganisation return organisation ID
func GetOrganisation(ctx context.Context) (string, error) {
	if ctx == nil {
		return "", errors.New("context not found")
	}
	organisationID := ctx.Value(OrganisationIDKey)
	if organisationID != nil {
		return organisationID.(string), nil
	}
	return "", errors.New("something went wrong")
}

func GetOrganisationIDfromSpaceID(spaceID, userID uint) (string, error) {
	//** need to make change in x-package if space id is given organisation should be returned

	space := model.Space{}

	err := config.DB.Model(&model.Space{}).Where(&model.Space{
		Base: config.Base{ID: spaceID},
	}).First(&space).Error

	if err != nil {
		return "", err
	}

	return space.OrganisationID, nil
}
