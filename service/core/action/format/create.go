package format

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// create - Create format
// @Summary Create format
// @Description Create format
// @Tags Format
// @ID add-format
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Format body format true "Format Object"
// @Success 201 {object} model.Format
// @Router /core/formats [post]
func create(w http.ResponseWriter, r *http.Request) {

	format := &format{}

	json.NewDecoder(r.Body).Decode(&format)

	result := &model.Format{
		Name:        format.Name,
		Description: format.Description,
		Slug:        format.Slug,
		SpaceID:     format.SpaceID,
	}

	err := config.DB.Model(&model.Format{}).Create(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusCreated, result)
}
