package util

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
)

type ketoAllowed struct {
	Subject  string `json:"subject"`
	Action   string `json:"action"`
	Resource string `json:"resource"`
}

// CheckKetoPolicy returns middleware that checks the permissions of user from keto server
func CheckKetoPolicy(entity, action string) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			sID, err := GetSpace(ctx)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			uID, err := GetUser(ctx)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			oID, err := GetOrganisation(ctx)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			commonString := fmt.Sprint(":org:", oID, ":app:dega:space:", sID, ":")

			kresource := fmt.Sprint("resources", commonString, entity)
			kaction := fmt.Sprint("actions", commonString, entity, ":", action)

			result := ketoAllowed{}

			result.Action = kaction
			result.Resource = kresource
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

			h.ServeHTTP(w, r)
		})
	}
}
