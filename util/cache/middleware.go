package cache

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/factly/x/renderx"
)

type requestBody struct {
	OperationName string      `json:"operationName"`
	Query         string      `json:"query"`
	Variables     interface{} `json:"variables"`
}

func CachingMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body := requestBody{}
			bodyBytes, _ := ioutil.ReadAll(r.Body)
			err := json.Unmarshal(bodyBytes, &body)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			if body.OperationName == "IntrospectionQuery" {
				r.Body.Close()
				r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
				next.ServeHTTP(w, r)
				return
			}

			// get query string from the request body
			queryString := body.Query
			queryStr := strings.ReplaceAll(queryString, "\n", "")
			queryStr = strings.ReplaceAll(queryStr, " ", "")

			varBytes, _ := json.Marshal(body.Variables)
			varString := string(varBytes)

			// hash query
			h := md5.New()
			_, _ = io.WriteString(h, fmt.Sprint(queryStr, varString))
			hash := hex.EncodeToString(h.Sum(nil))

			respBodyBytes, err := GlobalCache.Get(r.Context(), hash)
			if err == nil {
				var data interface{}
				_ = json.Unmarshal(respBodyBytes, &data)
				renderx.JSON(w, http.StatusOK, data)
				return
			}

			r.Body.Close()
			r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
			next.ServeHTTP(w, r)
		})
	}
}
