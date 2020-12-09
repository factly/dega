package rating

import (
	"context"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
)

// list response
type paging struct {
	Total int64          `json:"total"`
	Nodes []model.Rating `json:"nodes"`
}

// list - Get all ratings
// @Summary Show all ratings
// @Description Get all ratings
// @Tags Rating
// @ID get-all-ratings
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param all query string false "all"
// @Success 200 {object} paging
// @Router /fact-check/ratings [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.Rating, 0)

	all := r.URL.Query().Get("all")
	offset, limit := paginationx.Parse(r.URL.Query())

	ctx, _ := context.WithTimeout(context.Background(), 200*time.Millisecond)

	stmt := config.DB.Session(&gorm.Session{Context: ctx}).Model(&model.Rating{}).Preload("Medium").Where(&model.Rating{
		SpaceID: uint(sID),
	}).Count(&result.Total).Order("id desc")

	if all == "true" {
		err = stmt.Find(&result.Nodes).Error
	} else {
		err = stmt.Offset(offset).Limit(limit).Find(&result.Nodes).Error
	}

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
