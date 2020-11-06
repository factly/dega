package util

import (
	"net/http"

	"github.com/spf13/viper"
)

// CheckSuperOrganisation checks weather organisation of user is super org or not
func CheckSuperOrganisation(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !viper.IsSet("organisation_id") {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		oID, err := GetOrganisation(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		if oID != viper.GetInt("organisation_id") {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		h.ServeHTTP(w, r)
	})
}
