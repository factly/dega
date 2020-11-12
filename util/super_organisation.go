package util

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// CheckSuperOrganisation checks weather organisation of user is super org or not
func CheckSuperOrganisation(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		oID, err := GetOrganisation(r.Context())
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		resp, err := KetoGetRequest("/engines/acp/ory/regex/policies/app:dega:superorg")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		if resp.StatusCode != http.StatusOK {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var policy model.KetoPolicy
		json.NewDecoder(resp.Body).Decode(&policy)

		if len(policy.Subjects) == 0 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		if fmt.Sprint(oID) != policy.Subjects[0] {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		h.ServeHTTP(w, r)
	})
}

// FactCheckPermission checks weather organisation has fact-check permission
func FactCheckPermission(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		oID, err := GetOrganisation(r.Context())
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		permission := model.OrganisationPermission{}
		err = config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
			OrganisationID: uint(oID),
		}).First(&permission).Error

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		if !permission.FactCheck {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		h.ServeHTTP(w, r)
	})
}
