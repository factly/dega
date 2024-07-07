package util

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CheckEntityAccess returns middleware that checks the permissions of user from keto server
func CheckEntityAccess(entity, action string) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			authCtx, err := GetAuthCtx(ctx)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			orgRole := authCtx.OrgRole

			isAllowed, e := CheckSpaceEntityPermission(authCtx.SpaceID, authCtx.UserID, entity, action, orgRole)
			if !isAllowed {
				errorx.Render(w, []errorx.Message{e})
				return
			}

			h.ServeHTTP(w, r)
		})
	}
}

func CheckSpaceEntityPermission(sID uuid.UUID, uID, resource, action, orgRole string) (bool, errorx.Message) {
	// Check if user is part of the space or not
	spaceUser := model.SpaceUser{}
	err := config.DB.Model(&model.SpaceUser{}).Where(&model.SpaceUser{
		SpaceID: sID,
		UserID:  uID,
	}).First(&spaceUser).Error

	if err != nil {
		loggerx.Error(err)
		if err == gorm.ErrRecordNotFound {
			return false, errorx.Unauthorized()
		}

		return false, errorx.InternalServerError()
	}

	if orgRole != "admin" {
		permission := model.Permission{
			Resource: resource,
			Action:   action,
		}

		policies := make([]model.Policy, 0)
		err = config.DB.Model(&model.Policy{}).Where(&model.Policy{
			SpaceID: sID}).Find(&policies).Error

		if err != nil {
			loggerx.Error(err)
			return false, errorx.InternalServerError()
		}

		policyIds := make([]uuid.UUID, 0)
		for _, policy := range policies {
			policyIds = append(policyIds, policy.ID)
		}

		err = config.DB.Model(&model.Permission{}).Where("policy_id IN ? and action = ? and resource = ?", policyIds, action, resource).First(&permission).Error

		if err != nil {
			loggerx.Error(err)
			if err == gorm.ErrRecordNotFound {
				return false, errorx.Unauthorized()
			}
			loggerx.Error(err)
			return false, errorx.InternalServerError()
		}
	}

	return true, errorx.Message{}
}
