package cache

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/tmc/graphql/parser"
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
				next.ServeHTTP(w, r)
				return
			}

			// get query string from the request body
			queryString := body.Query

			queryType, err := getQueryType(queryString)
			if err != nil {
				errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse query", http.StatusUnprocessableEntity)))
				return
			}

			queryStr := strings.ReplaceAll(queryString, "\n", "")
			queryStr = strings.ReplaceAll(queryStr, " ", "")

			// hash query
			h := md5.New()
			_, _ = io.WriteString(h, queryStr)
			hash := hex.EncodeToString(h.Sum(nil))

			respBodyBytes, err := GlobalCache.Get(r.Context(), hash)
			if err == nil {
				var respBody interface{}
				err = json.Unmarshal(respBodyBytes, &respBody)
				if err != nil {
					errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
					return
				}
				data := map[string]interface{}{
					"data": map[string]interface{}{
						queryType: respBody,
					},
				}
				renderx.JSON(w, http.StatusOK, data)
				return
			}

			r.Body.Close()
			r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
			next.ServeHTTP(w, r)
		})
	}
}

func getQueryType(queryString string) (string, error) {
	plural := map[string]string{
		"category": "categories",
		"tag":      "tags",
		"post":     "posts",
		"page":     "pages",
		"user":     "users",
	}
	qd, err := parser.ParseOperation([]byte(queryString))
	if err != nil {
		return "", err
	}

	lastQT := qd.SelectionSet[len(qd.SelectionSet)-1].Field.Name
	for _, each := range qd.SelectionSet {
		if each.Field.Name == plural[lastQT] {
			return plural[lastQT], nil
		}
	}

	return lastQT, nil
}
