package tag

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

// create - Create tag
// @Summary Create tag
// @Description Create tag
// @Tags Tag
// @ID add-tag
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param Tag body tag true "Tag Object"
// @Success 201 {object} model.Tag
// @Failure 400 {array} string
// @Router /{space_id}/core/tags [post]
func create(w http.ResponseWriter, r *http.Request) {

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	tag := &tag{}

	json.NewDecoder(r.Body).Decode(&tag)

	validate := validator.New()

	err = validate.Struct(tag)

	if err != nil {
		msg := err.Error()
		validation.ValidErrors(w, r, msg)
		return
	}

	result := &model.Tag{
		Name:        tag.Name,
		Slug:        tag.Slug,
		Description: tag.Description,
		SpaceID:     uint(sid),
	}

	err = config.DB.Model(&model.Tag{}).Create(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusCreated, result)
}
