package cache

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type requestBody struct {
	OperationName *string     `json:"operationName"`
	Query         *string     `json:"query"`
	Variables     interface{} `json:"variables"`
}

func CachingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
		queryStr := strings.ReplaceAll(queryString, "\n", "")
		queryStr = strings.ReplaceAll(queryStr, " ", "")
		fmt.Println("QUERY:", queryStr)
		next.ServeHTTP(w, r)
	})
}
