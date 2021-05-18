package cache

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/go-redis/redis"
)

// GlobalCache: global cache
var GlobalCache *Cache

type Cache struct {
	client redis.UniversalClient
	ttl    time.Duration
}

const AppPrefix = "dega:"

func SetupCache(redisAddress string, password string, ttl time.Duration, db int) error {
	client := redis.NewClient(&redis.Options{
		Addr:     redisAddress,
		Password: password,
		DB:       db,
	})

	err := client.Ping().Err()
	if err != nil {
		return fmt.Errorf("could not create cache: %w", err)
	}

	GlobalCache = &Cache{client: client, ttl: ttl}
	return nil
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

func SaveToCache(ctx context.Context, data interface{}) error {
	// get query string
	opCtx := graphql.GetOperationContext(ctx)
	queryStr := strings.ReplaceAll(opCtx.RawQuery, "\n", "")
	queryStr = strings.ReplaceAll(queryStr, " ", "")

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
