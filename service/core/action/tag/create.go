package tag

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// create - Create tag
// @Summary Create tag
// @Description Create tag
// @Tags Tag
// @ID add-tag
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Tag body tag true "Tag Object"
// @Success 201 {object} model.Tag
// @Router /core/tags [post]
func create(w http.ResponseWriter, r *http.Request) {

	tag := &tag{}

	json.NewDecoder(r.Body).Decode(&tag)

	result := &model.Tag{
		Name:        tag.Name,
		Slug:        tag.Slug,
		Description: tag.Description,
		SpaceID:     tag.SpaceID,
	}

	err := config.DB.Model(&model.Tag{}).Create(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusCreated, result)
}
