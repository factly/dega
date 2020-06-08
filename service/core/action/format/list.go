package format

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
)

// list response
type paging struct {
	Total int            `json:"total"`
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
		return
	}

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err = config.DB.Model(&model.Format{}).Where(&model.Format{
		SpaceID: uint(sID),
	}).Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	render.JSON(w, http.StatusOK, result)
}
