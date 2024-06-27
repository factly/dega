package util

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/google/uuid"
	"github.com/zitadel/zitadel-go/v3/pkg/authorization/oauth"
	zitadelMiddleware "github.com/zitadel/zitadel-go/v3/pkg/http/middleware"
)

type ctxKeyUserID string
type ctxKeySpaceID struct{}
type ctxKeyOrganisationID string
type ctxKeyOrgRole string

// UserIDKey is the key that holds the unique user ID in a request context.
var UserIDKey ctxKeyUserID

// SpaceIDKey is the key that holds the unique space ID in a request context.
var SpaceIDKey ctxKeySpaceID

// OrganisationIDKey is the key that holds the unique organisation ID in a request context.
var OrganisationIDKey ctxKeyOrganisationID

// OrgRoleKey is the key that holds the unique org role in a request context.
const OrgRoleKey ctxKeyOrgRole = ""

// CheckUser check X-User in header
func CheckUser(zitadelInterceptor *zitadelMiddleware.Interceptor[*oauth.IntrospectionContext]) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			authCtx := zitadelInterceptor.Context(ctx)

			if authCtx == nil {
				loggerx.Error(errors.New("auth context not found"))
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			// set user id in context
			ctx = context.WithValue(ctx, UserIDKey, authCtx.UserID())

			tokens := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

			space := model.Space{}

			if !(tokens[1] == "spaces" && len(tokens) == 2 && (r.Method == http.MethodPost || r.Method == http.MethodGet)) {
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
				ctx = context.WithValue(ctx, SpaceIDKey, sId)
				ctx = context.WithValue(ctx, OrganisationIDKey, space.OrganisationID)
				userOrgRole := GetOrgRole(authCtx.Claims, space.OrganisationID)

				if userOrgRole == "" {
					errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
					return
				}

				ctx = context.WithValue(ctx, OrgRoleKey, userOrgRole)

			}

			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUser returns user ID as uuid.UUID
func GetUser(ctx context.Context) (string, error) {
	if ctx == nil {
		return "", errors.New("context not found")
	}
	userID := ctx.Value(UserIDKey)

	if userID != nil {
		return "", nil
	}
	return "", errors.New("something went wrong")
}

// GetSpace returns space ID as uuid.UUID
func GetSpace(ctx context.Context) (uuid.UUID, error) {
	if ctx == nil {
		return uuid.Nil, errors.New("context not found")
	}
	spaceID := ctx.Value(SpaceIDKey)

	if spaceID, ok := spaceID.(uuid.UUID); ok {

		return spaceID, nil
	}
	return uuid.Nil, errors.New("space ID not found or is not a string")
}

// GetSpace return space ID
func GetOrganisation(ctx context.Context) (string, error) {
	if ctx == nil {
		return "", errors.New("context not found")
	}
	orgID := ctx.Value(OrganisationIDKey)
	if orgID != nil {
		return orgID.(string), nil
	}
	return "", errors.New("something went wrong")
}

func GetOrgRoleFromContext(ctx context.Context) (string, error) {
	if ctx == nil {
		return "", errors.New("context not found")
	}
	orgRole := ctx.Value(OrgRoleKey)
	if orgRole != nil {
		return orgRole.(string), nil
	}
	return "", errors.New("something went wrong")
}

func GetOrgRole(claims map[string]any, organisatonID string) string {
	orgRole := ""
	if claims["urn:zitadel:iam:org:project:268579264306114801:roles"] != nil {
		roles := claims["urn:zitadel:iam:org:project:268579264306114801:roles"].(map[string]interface{})

		if roles["member"] != nil {
			memberRoles := roles["member"].(map[string]interface{})
			for key := range memberRoles {
				if organisatonID == key {
					orgRole = "member"
					break
				}
			}
		}

		if roles["admin"] != nil {
			adminRoles := roles["admin"].(map[string]interface{})

			for key := range adminRoles {
				if organisatonID == key {
					orgRole = "admin"
					break
				}
			}
		}

	}

	return orgRole
}
