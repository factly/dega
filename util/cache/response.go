package cache

import (
	"bytes"
	"io"
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql"
)

type CacheResponseWriter struct {
	http.ResponseWriter
	buf *bytes.Buffer
}

// Here we are implementing a Write() function from ResponseWriter with our custom instructions.
func (myrw *CacheResponseWriter) Write(p []byte) (int, error) {
	return myrw.buf.Write(p)
}

func RespMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Create a response writer:
		crw := &CacheResponseWriter{
			ResponseWriter: w,
			buf:            &bytes.Buffer{},
		}

		next.ServeHTTP(crw, r)

		bytes := crw.buf.Bytes()

		err := SaveToCache(graphql.WithOperationContext(r.Context(), &graphql.OperationContext{}), bytes)
		if err != nil {
			log.Println(err.Error())
		}

		if _, err = io.Copy(w, crw.buf); err != nil {
			log.Printf("Failed to send out response: %v", err)
		}
	})
}
