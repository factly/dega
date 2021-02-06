package util

import (
	"fmt"
	"net/http"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"
)

// CheckAccess middleware to check if user can access the application
func CheckAccess(appSlug string) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			uID, err := middlewarex.GetUser(r.Context())
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
				return
			}

			oID, err := GetOrganisation(r.Context())
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
				return
			}

			path := fmt.Sprint("/organisations/", oID, "/applications/", appSlug, "/access")
			req, err := http.NewRequest("GET", viper.GetString("kavach_url")+path, nil)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("X-User", fmt.Sprint(uID))

			client := &http.Client{}
			resp, err := client.Do(req)

			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.NetworkError()))
				return
			}

			if resp.StatusCode > 400 && resp.StatusCode <= 500 {
				errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
				return
			}

			h.ServeHTTP(w, r)
		})
	}
}
