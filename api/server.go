package main

import (
	"log"
	"net/http"
	"time"

	"github.com/factly/x/healthx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/viper"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/resolvers"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
	"github.com/factly/dega-api/util/cache"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
)

func main() {
	router := chi.NewRouter()

	cors := cors.New(cors.Options{
		// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "space"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})

	router.Use(cors.Handler)

	router.Use(middleware.RequestID)
	router.Use(loggerx.Init())
	router.Use(middleware.RealIP)

	config.SetupVars()
	config.SetupDB()

	sqlDB, _ := config.DB.DB()
	healthx.RegisterRoutes(router, healthx.ReadyCheckers{
		"database": sqlDB.Ping,
		"kavach":   util.KavachChecker,
	})

	go func() {
		promRouter := chi.NewRouter()
		promRouter.Mount("/metrics", promhttp.Handler())
		log.Fatal(http.ListenAndServe(":8001", promRouter))
	}()

	if cache.IsEnabled() {
		cacheExpiration := 30
		if viper.IsSet("redis_cache_expiration") {
			cacheExpiration = viper.GetInt("redis_cache_expiration")
		}

		cache.SetupCache(viper.GetString("redis_url"), viper.GetString("redis_password"), time.Duration(cacheExpiration)*time.Second, 0)
	}

	if config.SearchEnabled() {
		err := meilisearchx.SetupMeiliSearch("dega", []string{"name", "slug", "description", "title", "subtitle", "excerpt", "claim", "fact", "site_title", "site_address", "tag_line", "review", "review_tag_line"})
		if err != nil {
			log.Println(err)
		}
	}

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolvers.Resolver{}}))

	r := router.With(validator.CheckSpace(), validator.CheckOrganisation(), middlewarex.ValidateAPIToken("X-Dega-API-Key", "dega", validator.GetOrganisation))

	if cache.IsEnabled() {
		r = r.With(cache.CachingMiddleware(), cache.RespMiddleware)
	}

	r.Handle("/query", loaders.DataloaderMiddleware(srv))

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", "8000")
	log.Fatal(http.ListenAndServe(":8000", router))
}
