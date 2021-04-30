package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/go-redis/redis"
)

type Cache struct {
	client redis.UniversalClient
	ttl    time.Duration
}

const AppPrefix = "dega:"

func NewCache(redisAddress string, password string, ttl time.Duration, db int) (*Cache, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     redisAddress,
		Password: password,
		DB:       db,
	})

	err := client.Ping().Err()
	if err != nil {
		return nil, fmt.Errorf("could not create cache: %w", err)
	}

	return &Cache{client: client, ttl: ttl}, nil
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
