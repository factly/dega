package claim

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
)

// list response
type paging struct {
	Total int           `json:"total"`
	Nodes []model.Claim `json:"nodes"`
}

// list - Get all claims
// @Summary Show all claims
// @Description Get all claims
// @Tags Claim
// @ID get-all-claims
// @Produce  json
// @Param X-User header string true "User ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {Object} paging
// @Router /factcheck/claims [get]
func list(w http.ResponseWriter, r *http.Request) {

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	err := config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").Count(&result.Total).Order("id asc").Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
