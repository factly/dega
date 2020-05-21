package category

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all categories
// @Summary Show all categories
// @Description Get all categories
// @Tags Category
// @ID get-all-categories
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} model.Category
// @Router /core/categories [get]
func list(w http.ResponseWriter, r *http.Request) {

	result := []model.Category{}

	err := config.DB.Model(&model.Category{}).Preload("Medium").Find(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
