package users

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

var userContext config.ContextKey = "space_user"

func update(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole, err := util.GetOrgRoleFromContext(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	if orgRole != "admin" {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	req := &req{}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	users, err := zitadel.GetOrganisationUsers(r.Header.Get("authorization"), oID, req.IDs)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if len(users) != len(req.IDs) {
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	spaceUsers := make([]model.SpaceUser, 0)

	for _, user := range users {
		spaceUsers = append(spaceUsers, model.SpaceUser{
			SpaceID: sID,
			UserID:  user.ID,
		})
	}

	err = tx.Model(&model.SpaceUser{}).Create(&spaceUsers).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, spaceUsers)

}
