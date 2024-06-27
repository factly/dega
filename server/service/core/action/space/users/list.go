package users

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/zitadel"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64  `json:"total"`
	Nodes []user `json:"nodes"`
}

type user struct {
	ID          string `json:"id"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
}

func list(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
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

	// Get organisation ID
	spaceUsers := make([]model.SpaceUser, 0)

	result := paging{}

	err = config.DB.Model(&model.SpaceUser{}).Where(&model.SpaceUser{
		SpaceID: sID,
	}).Count(&result.Total).Find(&spaceUsers).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	uIDs := make([]string, 0)

	for _, user := range spaceUsers {
		uIDs = append(uIDs, user.UserID)
	}

	res, err := zitadel.GetOrganisationUsers(r.Header.Get("authorization"), oID, uIDs)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	users := make([]user, 0)

	for _, u := range res {
		users = append(users, user{
			ID:          u.ID,
			DisplayName: u.Human.Profile.DisplayName,
			Email:       u.Human.Email.Email,
		})
	}

	result.Nodes = users

	renderx.JSON(w, http.StatusOK, result)
}
