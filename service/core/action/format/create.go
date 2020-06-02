package format

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

// create - Create format
// @Summary Create format
// @Description Create format
// @Tags Format
// @ID add-format
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param Format body format true "Format Object"
// @Success 201 {object} model.Format
// @Failure 400 {array} string
// @Router /{space_id}/core/formats [post]
func create(w http.ResponseWriter, r *http.Request) {

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	format := &format{}

	json.NewDecoder(r.Body).Decode(&format)

	validate := validator.New()

	err = validate.Struct(format)

	if err != nil {
		msg := err.Error()
		validation.ValidErrors(w, r, msg)
		return
	}

	result := &model.Format{
		Name:        format.Name,
		Description: format.Description,
		Slug:        format.Slug,
		SpaceID:     uint(sid),
	}

	err = config.DB.Model(&model.Format{}).Create(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusCreated, result)
}
