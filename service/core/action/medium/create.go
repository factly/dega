package medium

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
	"github.com/go-playground/validator/v10"
)

// create - Create medium
// @Summary Create medium
// @Description Create medium
// @Tags Medium
// @ID add-medium
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param Medium body medium true "Medium Object"
// @Success 201 {object} model.Medium
// @Failure 400 {array} string
// @Router /{space_id}/core/media [post]
func create(w http.ResponseWriter, r *http.Request) {

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	medium := &medium{}

	json.NewDecoder(r.Body).Decode(&medium)

	validate := validator.New()

	err = validate.Struct(medium)

	if err != nil {
		msg := err.Error()
		validation.ValidErrors(w, r, msg)
		return
	}

	result := &model.Medium{
		Name:        medium.Name,
		Slug:        medium.Slug,
		Title:       medium.Title,
		Type:        medium.Type,
		Description: medium.Description,
		Caption:     medium.Caption,
		AltText:     medium.AltText,
		FileSize:    medium.FileSize,
		URL:         medium.URL,
		Dimensions:  medium.Dimensions,
		SpaceID:     uint(sid),
	}

	err = config.DB.Model(&model.Medium{}).Create(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
