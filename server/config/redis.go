package config

import (
	"bytes"
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/factly/x/renderx"
	"github.com/go-redis/redis"
	"github.com/spf13/viper"
)

// GlobalCache: global cache
var GlobalCache *Cache

type Cache struct {
	client redis.UniversalClient
	ttl    time.Duration
}

var AppPrefix = "dega-public:"

func SetupCache() {

	client := redis.NewClient(&redis.Options{
		Addr:     viper.GetString("redis_url"),
		Password: viper.GetString("redis_password"),
		DB:       viper.GetInt("redis_db"),
	})

	GlobalCache = &Cache{client: client, ttl: time.Duration(viper.GetInt("redis_cache_duration")) * time.Second}

}

func (c *Cache) Set(ctx context.Context, key string, value interface{}) error {
	bytes, err := json.Marshal(value)
	if err != nil {
		return err
	}
	status := c.client.Set(AppPrefix+key, bytes, c.ttl)
	return status.Err()
}

func (c *Cache) Get(ctx context.Context, key string) ([]byte, error) {
	s := c.client.Get(AppPrefix + key)
	if s.Err() == redis.Nil {
		return nil, errors.New("entry not found in cache")
	} else {
		return s.Bytes()
	}
}

func SaveToCache(ctx context.Context, queryStr string, data interface{}) error {
	// hash query
	h := md5.New()
	_, _ = io.WriteString(h, queryStr)
	hash := hex.EncodeToString(h.Sum(nil))

	err := GlobalCache.Set(ctx, hash, data)
	if err != nil {
		return nil
	}
	return nil
}

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
		// Create a response writer:
		crw := &CacheResponseWriter{
			ResponseWriter: w,
			buf:            &bytes.Buffer{},
		}

		body := requestBody{}
		bodyBytes, _ := io.ReadAll(r.Body)
		spaceId := r.Header.Get("x-space")
		err := json.Unmarshal(bodyBytes, &body)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		r.Body.Close()
		r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		next.ServeHTTP(crw, r)

		queryString := body.Query
		queryStr := strings.ReplaceAll(queryString, "\n", "")
		queryStr = strings.ReplaceAll(queryStr, " ", "")

		varBytes, _ := json.Marshal(body.Variables)
		varString := string(varBytes)

		var data interface{}
		saveBytes := crw.buf.Bytes()

		_ = json.Unmarshal(saveBytes, &data)

		err = SaveToCache(r.Context(), fmt.Sprint(queryStr, varString, spaceId), data)
		if err != nil {
			log.Println(err.Error())
		}

		if _, err = io.Copy(w, crw.buf); err != nil {
			log.Printf("Failed to send out response: %v", err)
		}

	})
}

type requestBody struct {
	OperationName string      `json:"operationName"`
	Query         string      `json:"query"`
	Variables     interface{} `json:"variables"`
}

func CachingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		body := requestBody{}
		spaceId := r.Header.Get("x-space")
		bodyBytes, _ := io.ReadAll(r.Body)
		err := json.Unmarshal(bodyBytes, &body)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
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
		io.WriteString(h, fmt.Sprint(queryStr, varString, spaceId))
		hash := hex.EncodeToString(h.Sum(nil))

		respBodyBytes, err := GlobalCache.Get(r.Context(), hash)
		if err == nil {
			var data interface{}
			_ = json.Unmarshal(respBodyBytes, &data)
			renderx.JSON(w, http.StatusOK, data)
			return
		}

		r.Body.Close()
		r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		next.ServeHTTP(w, r)
	})
}
