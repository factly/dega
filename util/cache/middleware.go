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

			queryStr := strings.ReplaceAll(queryString, "\n", "")
			queryStr = strings.ReplaceAll(queryStr, " ", "")

			queryType := GetField(queryStr)
			if queryType == "" {
				errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid query field", http.StatusUnprocessableEntity)))
				return
			}

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

func GetField(queryStr string) string {
	toks := strings.Split(queryStr, "{")
	if len(toks) == 0 {
		return ""
	}
	queryTok := strings.ReplaceAll(strings.Split(toks[1], "(")[0], " ", "")

	validToks := []string{"space", "menu", "categories", "category", "tags", "tag", "formats", "posts", "post", "page", "pages", "users", "user", "ratings", "claimants", "claims", "sitemap"}

	isValidQuery := false
	for _, each := range validToks {
		if queryTok == each {
			isValidQuery = true
			break
		}
	}
	if isValidQuery {
		return queryTok
	}
	return ""
}
