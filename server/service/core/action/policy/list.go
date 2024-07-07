package policy

import (
	"errors"
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
	Total int64          `json:"total"`
	Nodes []model.Policy `json:"nodes"`
}

// list - Get all policies
// @Summary Get all policies
// @Description Get all policies
// @Tags Policy
// @ID get-all-policy
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} paging
// @Router /core/policies [get]
func list(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole := authCtx.OrgRole

	if orgRole != "admin" {
		loggerx.Error(errors.New("user is not an admin"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	result := paging{}
	result.Nodes = make([]model.Policy, 0)

	err = config.DB.Model(&model.Policy{}).Where(&model.Policy{
		SpaceID: authCtx.SpaceID,
	}).Count(&result.Total).Limit(limit).Offset(offset).Find(&result.Nodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
