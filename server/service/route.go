package service

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/healthx"

	_ "github.com/factly/dega-server/docs" // docs is generated by Swag CLI, you have to import it.
	"github.com/factly/dega-server/service/core"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/action/category"
	"github.com/factly/dega-server/service/core/action/format"
	"github.com/factly/dega-server/service/core/action/meta"
	"github.com/factly/dega-server/service/core/action/post"
	"github.com/factly/dega-server/service/core/action/tag"
	factCheck "github.com/factly/dega-server/service/fact-check"
	"github.com/factly/dega-server/service/podcast"
	podcastAction "github.com/factly/dega-server/service/podcast/action"
	"github.com/factly/dega-server/service/reindex"
	"github.com/factly/dega-server/service/user"

	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/spf13/viper"
	httpSwagger "github.com/swaggo/http-swagger"

	"github.com/zitadel/zitadel-go/v3/pkg/authorization"
	"github.com/zitadel/zitadel-go/v3/pkg/authorization/oauth"
	zitadelMiddleware "github.com/zitadel/zitadel-go/v3/pkg/http/middleware"
	"github.com/zitadel/zitadel-go/v3/pkg/zitadel"
)

func RegisterRoutes() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(loggerx.Init())
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

	if viper.IsSet("mode") && viper.GetString("mode") == "development" {
		r.Use(cors.Handler(cors.Options{
			AllowedOrigins:   []string{"http://localhost:3000"},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"*"},
			ExposedHeaders:   []string{"*"},
			AllowCredentials: true,
			MaxAge:           300, // Maximum value not ignored by any of major browsers
		}))
		r.Get("/swagger/*", httpSwagger.WrapHandler)
		fmt.Println("Swagger @ http://localhost:7789/swagger/index.html")
	}

	if viper.IsSet("iframely_url") {
		r.Mount("/meta", meta.Router())
	}

	sqlDB, _ := config.DB.DB()

	healthx.RegisterRoutes(r, healthx.ReadyCheckers{
		"database":    sqlDB.Ping,
		"keto":        util.KetoChecker,
		"kavach":      util.KavachChecker,
		"kratos":      util.KratosChecker,
		"meilisearch": util.MeiliChecker,
	})

	ctx := context.Background()

	authZ, err := authorization.New(ctx, zitadel.New(viper.GetString("ZITADEL_DOMAIN")), oauth.DefaultAuthorization("./zitadel_key.json"))
	if err != nil {
		log.Fatal("zitadel sdk could not initialize", "error", err)
	}

	ZitadelInterceptor := zitadelMiddleware.New(authZ)

	// After Latest kavach changes
	r.With(ZitadelInterceptor.RequireAuthorization(), util.CheckUser(ZitadelInterceptor), middlewarex.CheckSpace(1), util.GenerateOrganisation).Group(func(r chi.Router) {
		r.Mount("/core", core.Router())
		r.Mount("/fact-check", factCheck.Router())
		r.Mount("/podcast", podcast.Router())
		r.Mount("/reindex", reindex.Router())
	})

	r.With(ZitadelInterceptor.RequireAuthorization(), util.CheckUser(ZitadelInterceptor)).Group(func(r chi.Router) {
		r.Mount("/user", user.Router())
	})

	return r
}

func RegisterFeedsRoutes() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(loggerx.Init())
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

	r.Route("/spaces/{space_id}", func(r chi.Router) {
		r.Get("/posts/feed", post.Feeds)
		r.Get("/posts/feeds/rss2", post.Feeds)
		r.Get("/tags/{slugs}/feed", tag.Feeds)
		r.Get("/tags/{slugs}/feeds/rss2", tag.Feeds)
		r.Get("/categories/{slugs}/feed", category.Feeds)
		r.Get("/categories/{slugs}/feeds/rss2", category.Feeds)
		r.Get("/formats/{slugs}/feed", format.Feeds)
		r.Get("/formats/{slugs}/feeds/rss2", format.Feeds)
		r.Get("/authors/{slugs}/feed", author.Feeds)
		r.Get("/authors/{slugs}/feeds/rss2", author.Feeds)

		r.Get("/podcasts/{podcast_slug}/feed", podcastAction.Feeds)
		r.Get("/podcasts/{podcast_slug}/feeds/rss2", podcastAction.Feeds)
	})

	return r
}
