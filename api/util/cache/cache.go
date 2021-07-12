package cache

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"time"

	"github.com/go-redis/redis"
	"github.com/spf13/viper"
)

// GlobalCache: global cache
var GlobalCache *Cache

type Cache struct {
	client redis.UniversalClient
	ttl    time.Duration
}

const AppPrefix = "dega:"

func SetupCache(redisAddress string, password string, ttl time.Duration, db int) {
	client := redis.NewClient(&redis.Options{
		Addr:     redisAddress,
		Password: password,
		DB:       db,
	})

	GlobalCache = &Cache{client: client, ttl: ttl}
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

func IsEnabled() bool {
	return viper.IsSet("enable_cache") && viper.GetBool("enable_cache")
}
