package service

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/factly/dega-templates/config"
	"github.com/factly/dega-templates/service/author"
	"github.com/factly/dega-templates/service/post"
	"github.com/factly/x/healthx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

// RegisterRoutes registers routes
func RegisterRoutes() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(loggerx.Init())
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

	sqlDB, _ := config.DB.DB()

	healthx.RegisterRoutes(r, healthx.ReadyCheckers{
		"database": sqlDB.Ping,
	})

	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "web/assets"))

	FileServer(r, "/", filesDir)

	r.With(middlewarex.CheckSpace(0)).Group(func(r chi.Router) {
		r.Mount("/posts", post.Router())
		r.Mount("/authors", author.Router())
	})

	return r
}

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
