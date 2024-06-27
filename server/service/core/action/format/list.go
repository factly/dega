package format

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

// list response
type paging struct {
	Total int64          `json:"total"`
	Nodes []model.Format `json:"nodes"`
}

// list - Get all formats
// @Summary Show all formats
// @Description Get all formats
// @Tags Format
// @ID get-all-formats
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /core/formats [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.Format, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	err = config.DB.Model(&model.Format{}).Where(&model.Format{
		SpaceID: sID,
	}).Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
