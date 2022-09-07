package httpx

import (
	"net/http"
	"time"
)

const httpTimeout = 10

func CustomHttpClient() *http.Client {
	return &http.Client{Timeout: time.Minute * time.Duration(httpTimeout)}
}
