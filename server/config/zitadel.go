package config

import (
	"context"
	"log"

	"github.com/spf13/viper"
	"github.com/zitadel/zitadel-go/v3/pkg/authorization"
	"github.com/zitadel/zitadel-go/v3/pkg/authorization/oauth"
	"github.com/zitadel/zitadel-go/v3/pkg/http/middleware"
	"github.com/zitadel/zitadel-go/v3/pkg/zitadel"
)

var ZitadelInterceptor *middleware.Interceptor[*oauth.IntrospectionContext]

func SetupZitadelInterceptor() {
	ctx := context.Background()

	authZ, err := authorization.New(ctx, zitadel.New(viper.GetString("ZITADEL_DOMAIN")), oauth.DefaultAuthorization("./zitadel_key.json"))
	if err != nil {
		log.Fatal("zitadel sdk could not initialize", "error", err)
	}

	ZitadelInterceptor = middleware.New(authZ)
}
