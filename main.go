package main

import (
	"log"
	"net/http"
	"os"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core"
	"github.com/factly/dega-server/service/factcheck"
	"github.com/go-chi/chi/middleware"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("error loding .env file")
	}

	// db setup
	config.SetupDB()

	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "3000"
	}
	port = ":" + port

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Mount("/factcheck", factcheck.Router())
	r.Mount("/core", core.Router())

	http.ListenAndServe(port, r)
}
