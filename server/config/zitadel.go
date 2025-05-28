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

func GetZitadelDomain() string {
	if viper.GetString("mode") == "development" {
		return viper.GetString("ZITADEL_DOMAIN") + ":" + viper.GetString("ZITADEL_INSECURE_PORT")
	}
	return viper.GetString("ZITADEL_DOMAIN")
}

func SetupZitadelInterceptor() {
	ctx := context.Background()

	zt := zitadel.New(viper.GetString("ZITADEL_DOMAIN"))

	if viper.GetString("mode") == "development" {
		zt = zitadel.New(viper.GetString("ZITADEL_DOMAIN"), zitadel.WithInsecure(viper.GetString("ZITADEL_INSECURE_PORT")))
	}

	authZ, err := authorization.New(ctx, zt, oauth.DefaultAuthorization("./zitadel_key.json"))
	if err != nil {
		log.Fatal("zitadel sdk could not initialize", "error", err)
	}

	ZitadelInterceptor = middleware.New(authZ)
}
