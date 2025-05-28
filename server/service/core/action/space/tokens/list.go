package tokens

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type paging struct {
	Total int64              `json:"total"`
	Nodes []model.SpaceToken `json:"nodes"`
}

func list(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole := authCtx.OrgRole

	if orgRole != "admin" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("user is not admin", http.StatusUnauthorized)))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	space := &model.Space{}
	err = config.DB.Model(&model.Space{}).Where(&model.Space{
		Base: config.Base{
			ID: authCtx.SpaceID,
		},
	}).Find(&space).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.SpaceToken, 0)

	err = config.DB.Model(&model.SpaceToken{}).Where(&model.SpaceToken{
		SpaceID: authCtx.SpaceID,
	}).Omit("token").Count(&result.Total).Offset(offset).Limit(limit).Order("created_at desc").Find(&result.Nodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
