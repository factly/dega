package cache

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

type CacheResponseWriter struct {
	http.ResponseWriter
	buf *bytes.Buffer
}

// Here we are implementing a Write() function from ResponseWriter with our custom instructions.
func (myrw *CacheResponseWriter) Write(p []byte) (int, error) {
	return myrw.buf.Write(p)
}

func (myrw *CacheResponseWriter) WriteHeader(header int) {
	myrw.ResponseWriter.WriteHeader(header)
}

func RespMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(" RespMiddleware entry")
		// Create a response writer:
		crw := &CacheResponseWriter{
			ResponseWriter: w,
			buf:            &bytes.Buffer{},
		}

		body := requestBody{}
		bodyBytes, _ := ioutil.ReadAll(r.Body)
		err := json.Unmarshal(bodyBytes, &body)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		r.Body.Close()
		r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

		next.ServeHTTP(crw, r)

		queryString := body.Query
		queryStr := strings.ReplaceAll(queryString, "\n", "")
		queryStr = strings.ReplaceAll(queryStr, " ", "")

		varBytes, _ := json.Marshal(body.Variables)
		varString := string(varBytes)

		var data interface{}
		saveBytes := crw.buf.Bytes()

		_ = json.Unmarshal(saveBytes, &data)

		err = SaveToCache(r.Context(), fmt.Sprint(queryStr, varString), data)
		if err != nil {
			log.Println(err.Error())
		}

		if _, err = io.Copy(w, crw.buf); err != nil {
			log.Printf("Failed to send out response: %v", err)
		}

		log.Println(" RespMiddleware exit")
	})
}
