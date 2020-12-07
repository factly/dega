package main

import (
	"log"
	"net/http"

	"github.com/factly/dega-api/util"
	"github.com/factly/x/loggerx"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/resolvers"
	"github.com/factly/dega-api/graph/validator"
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
	router.Use(validator.CheckSpace())
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(util.GormRequestID)

	config.SetupVars()
	config.SetupDB()
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolvers.Resolver{}}))

	router.Handle("/query", loaders.DataloaderMiddleware(srv))

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", "8000")
	log.Fatal(http.ListenAndServe(":8000", router))
}
