package rating

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all ratings
// @Summary Show all ratings
// @Description Get all ratings
// @Tags Rating
// @ID get-all-ratings
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} model.Rating
// @Router /factcheck/ratings [get]
func list(w http.ResponseWriter, r *http.Request) {

	var ratings []model.Rating

	err := config.DB.Model(&model.Rating{}).Preload("Medium").Find(&ratings).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, ratings)
}
