package validator

import (
	"context"
	"errors"
	"net/http"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/models"
)

type ctxKeyOrganisationID int

// SpaceIDKey is the key that holds the unique space ID in a request context.
const OrgIDKey ctxKeyOrganisationID = 0

// CheckOrganisation - to get org from space in header
func CheckOrganisation() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			spaceID, err := GetSpace(ctx)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			space := &models.Space{}
			space.ID = spaceID

			err = config.DB.First(&space).Error
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			ctx = context.WithValue(ctx, OrgIDKey, space.OrganisationID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetOrganisation return space ID
func GetOrganisation(ctx context.Context) (int, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	orgID := ctx.Value(OrgIDKey)
	if orgID != nil {
		return orgID.(int), nil
	}
	return 0, errors.New("something went wrong")
}
