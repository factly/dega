package cache

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type requestBody struct {
	OperationName *string     `json:"operationName"`
	Query         *string     `json:"query"`
	Variables     interface{} `json:"variables"`
}

func CachingMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// opContext := graphql.GetOperationContext(r.Context())
			// print(opContext)
			body := requestBody{}
			err := json.NewDecoder(r.Body).Decode(&body)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			if body.OperationName != nil {
				next.ServeHTTP(w, r)
				return
			}

			queryString := *body.Query
			// queryStr := strings.ReplaceAll(queryString, "\n", "")
			// queryStr = strings.ReplaceAll(queryStr, " ", "")
			fmt.Println("QUERY:", queryString)
			next.ServeHTTP(w, r)
		})
	}
}
