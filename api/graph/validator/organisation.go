package validator

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/dega-api/util/httpx"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
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

			token, err := GetSpaceToken(ctx)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			organisationID, err := GetOrganisationIDfromSpaceID(uint(spaceID), token)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			ctx = context.WithValue(ctx, OrgIDKey, organisationID)
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

func GetOrganisationIDfromSpaceID(spaceID uint, token string) (int, error) {
	req, err := http.NewRequest(http.MethodGet, viper.GetString("kavach_url")+fmt.Sprintf("/util/space/%d/getOrganisationUsingToken", spaceID), nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("X-Space-Token", token)
	client := httpx.CustomHttpClient()
	response, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer response.Body.Close()
	responseBody := map[string]interface{}{}
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return 0, err
	}

	if response.StatusCode != 200 {
		return 0, errors.New("internal server error on kavach while getting organisation id from space id")
	}
	organisationID := int(responseBody["organisation_id"].(float64))
	return organisationID, nil
}
