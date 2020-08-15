package test

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

// Test is added primarily for testing my.go in the core/action/space packahe. My.go returns lists in a different format compared to the other functions,
// and this helper function, assists in returning the data in the format that helps testing.
func RequestList(t *testing.T, ts *httptest.Server, method, path string, body io.Reader, header map[string]string) (*http.Response, interface{}, int) {

	req, err := http.NewRequest(method, ts.URL+path, body)
	if err != nil {
		t.Fatal(err)
		return nil, nil, http.StatusServiceUnavailable
	}

	req.Header = map[string][]string{
		"X-User":  {header["user"]},
		"X-Space": {header["space"]},
		"Cookie":  {header["cookie"]},
	}

	// req.Header = header

	req.Close = true

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
		return nil, nil, http.StatusServiceUnavailable
	}

	var respBody interface{}

	json.NewDecoder(resp.Body).Decode(&respBody)
	defer resp.Body.Close()

	return resp, respBody, resp.StatusCode
}
