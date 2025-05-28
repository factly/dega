package util

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/google/uuid"
	"github.com/spf13/viper"
	"github.com/zitadel/zitadel-go/v3/pkg/authorization/oauth"
	zitadelMiddleware "github.com/zitadel/zitadel-go/v3/pkg/http/middleware"
)

type CtxData struct {
	UserID         string
	SpaceID        uuid.UUID
	OrganisationID string
	OrgRole        string
	OrgsRole       map[string]string
}

type key string

const ctxKey key = "authCtx"

// CheckUser check X-User in header
func CheckUser(zitadelInterceptor *zitadelMiddleware.Interceptor[*oauth.IntrospectionContext]) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			authCtx := zitadelInterceptor.Context(ctx)

			if authCtx == nil {
				loggerx.Error(errors.New("auth context not found"))
				errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
				return
			}

			ctxData := CtxData{
				UserID:   authCtx.UserID(),
				OrgsRole: getOrgsRole(authCtx.Claims),
			}

			tokens := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

			space := model.Space{}

			if !((r.Method == http.MethodPost && tokens[1] == "spaces" && len(tokens) == 2) || (r.Method == http.MethodGet && tokens[1] == "spaces" && tokens[2] == "my")) {
				spaceId := r.Header.Get("X-Space")
				if spaceId == "" {
					loggerx.Error(errors.New("space id not found"))
					errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
					return
				}

				sId, err := uuid.Parse(spaceId)
				if err != nil || sId == uuid.Nil {
					loggerx.Error(errors.New("invalid space id not found"))
					errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
					return
				}

				space.ID = sId

				err = config.DB.Model(&model.Space{}).First(&space).Error

				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}

				// set space id and organisation id in context
				ctxData.SpaceID = space.ID
				ctxData.OrganisationID = space.OrganisationID
				ctxData.OrgRole = ctxData.OrgsRole[space.OrganisationID]
			}

			ctx = context.WithValue(ctx, ctxKey, ctxData)

			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// CheckAPIAcess check public api access
func CheckAPIAcess(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// check x-space and X-Dega-API-Key
		spaceID := r.Header.Get("X-Space")
		apiKey := r.Header.Get("X-Dega-API-Key")

		if spaceID == "" || apiKey == "" {
			loggerx.Error(errors.New("space id or api key not found"))
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}

		ctxData := CtxData{}

		space := model.Space{}

		sId, err := uuid.Parse(spaceID)
		if err != nil || sId == uuid.Nil {
			loggerx.Error(errors.New("invalid space id not found"))
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}

		space.ID = sId

		err = config.DB.Model(&model.Space{}).First(&space).Error

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		// check api key
		spaceToken := model.SpaceToken{}
		err = config.DB.Model(&model.SpaceToken{}).Where(&model.SpaceToken{
			SpaceID: space.ID,
			Token:   apiKey,
		}).First(&spaceToken).Error

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}

		// set space id and organisation id in context
		ctxData.SpaceID = space.ID

		ctx = context.WithValue(ctx, ctxKey, ctxData)

		h.ServeHTTP(w, r.WithContext(ctx))

	})
}

func GetAuthCtx(ctx context.Context) (CtxData, error) {
	if ctx == nil {
		return CtxData{}, errors.New("context not found")
	}

	if ctxData, ok := ctx.Value(ctxKey).(CtxData); ok {
		return ctxData, nil
	}
	return CtxData{}, errors.New("something went wrong")
}

func getOrgsRole(claims map[string]any) map[string]string {
	orgsRole := make(map[string]string)
	claimScope := fmt.Sprintf("urn:zitadel:iam:org:project:%s:roles", viper.GetString("zitadel_project_id"))
	if claimValue, ok := claims[claimScope].(map[string]interface{}); ok {
		for role, orgs := range claimValue {
			if orgsMap, ok := orgs.(map[string]interface{}); ok {
				for key := range orgsMap {
					// Assuming admin roles should overwrite member roles if both are present
					if orgsRole[key] == "" || orgsRole[key] == "member" {
						orgsRole[key] = role
					}
				}
			}
		}
	}

	return orgsRole
}
