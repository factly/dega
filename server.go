package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/middleware"
	"github.com/factly/dega-api/graph/mongo"
	"github.com/factly/dega-api/graph/resolvers"
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
)

const defaultPort = "8080"
const defaultMode = "prod"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	mode := os.Getenv("MODE")
	if mode == "" {
		mode = defaultMode
	}

	router := chi.NewRouter()

	cors := cors.New(cors.Options{
		// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "client"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})

	router.Use(cors.Handler)

	router.Use(middleware.Client())
	router.Use(middleware.Tracing())

	mongo.Setup()
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolvers.Resolver{}}))

	router.Handle("/query", loaders.DataloaderMiddleware(srv))

	if mode == "dev" {
		router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	}

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
