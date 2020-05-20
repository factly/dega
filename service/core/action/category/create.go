package category

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// create - Create category
// @Summary Create category
// @Description Create category
// @Tags category
// @ID add-category
// @Consume json
// @Produce json
// @Param Category body category true "Category Object"
// @Success 201 {object} model.Category
// @Failure 400 {array} string
// @Router /categories [post]
func create(w http.ResponseWriter, r *http.Request) {

	category := &model.Category{}

	json.NewDecoder(r.Body).Decode(&category)

	err := config.DB.Model(&model.Category{}).Create(&category).Error

	if err != nil {
		return
	}

	/*config.DB.Model(&category).Association("Medium").Find(&category.Medium)*/

	render.JSON(w, http.StatusCreated, category)
}
