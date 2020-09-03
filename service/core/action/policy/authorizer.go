package policy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
)

type ketoAllowed struct {
	Subject  string `json:"subject"`
	Action   string `json:"action"`
	Resource string `json:"resource"`
}

// Authorizer check the user permissions
func Authorizer(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		url := strings.Trim(r.URL.Path, "/")
		method := r.Method
		path := strings.Split(url, "/")

		if path[1] != "spaces" {
			ctx := r.Context()

			sID, err := util.GetSpace(ctx)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			uID, err := util.GetUser(ctx)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			oID, err := util.GetOrganisation(ctx)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			allowedServices := []string{"core", "fact-check"}
			allowedEntities := []string{"authors", "categories", "formats", "media", "policies", "posts", "tags", "claims", "claimants", "fact-checks", "ratings", "search"}

			actionMapper := map[string]string{
				"GET":    "get",
				"POST":   "create",
				"PUT":    "update",
				"DELETE": "delete",
			}

			if !(len(path) == 2 || len(path) == 3) {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			if !contains(allowedServices, path[0]) {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			if !contains(allowedEntities, path[1]) {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			commonString := fmt.Sprint(":org:", oID, ":app:dega:space:", sID, ":")

			resource := fmt.Sprint("resources", commonString, path[1])
			action := fmt.Sprint("actions", commonString, path[1], ":", actionMapper[method])

			result := ketoAllowed{}

			result.Action = action
			result.Resource = resource
			result.Subject = fmt.Sprint(uID)

			buf := new(bytes.Buffer)
			err = json.NewEncoder(buf).Encode(&result)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DecodeError()))
				return
			}

			req, err := http.NewRequest("POST", config.KetoURL+"/engines/acp/ory/regex/allowed", buf)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
			req.Header.Set("Content-Type", "application/json")

			client := &http.Client{}
			resp, err := client.Do(req)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			if resp.StatusCode != 200 {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
		}
		h.ServeHTTP(w, r)
	})
}
