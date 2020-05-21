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
// @Tags Category
// @ID add-category
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Category body category true "Category Object"
// @Success 201 {object} model.Category
// @Router /core/categories [post]
func create(w http.ResponseWriter, r *http.Request) {

	category := &category{}

	json.NewDecoder(r.Body).Decode(&category)

	result := &model.Category{
		Name:        category.Name,
		Description: category.Description,
		Slug:        category.Slug,
		ParentID:    category.ParentID,
		MediumID:    category.MediumID,
		SpaceID:     category.SpaceID,
	}

	err := config.DB.Model(&model.Category{}).Create(&result).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Category{}).Preload("Medium").First(&result)

	render.JSON(w, http.StatusCreated, result)
}
