package util

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	//	"github.com/factly/dega-server/config"

	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"
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

func GetOrganisationIDfromSpaceID(spaceID, userID uint) (int, error) {
	//** need to make change in x-package if space id is given organisation should be returned
	req, err := http.NewRequest(http.MethodGet, viper.GetString("kavach_url")+fmt.Sprintf("/util/space/%d/getOrganisation", spaceID), nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
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
