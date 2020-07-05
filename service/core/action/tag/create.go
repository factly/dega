package tag

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create tag
// @Summary Create tag
// @Description Create tag
// @Tags Tag
// @ID add-tag
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Tag body tag true "Tag Object"
// @Success 201 {object} model.Tag
// @Failure 400 {array} string
// @Router /core/tags [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())

	if err != nil {
		errors.Parser(w, errors.InternalServerError, 500)
		return
	}

	tag := &tag{}

	json.NewDecoder(r.Body).Decode(&tag)

	validationError := validationx.Check(tag)

	if validationError != nil {
		errors.Validator(w, validationError)
		return
	}

	var tagSlug string
	if tag.Slug != "" && slug.Check(tag.Slug) {
		tagSlug = tag.Slug
	} else {
		tagSlug = slug.Make(tag.Name)
	}

	result := &model.Tag{
		Name:        tag.Name,
		Slug:        slug.Approve(tagSlug, sID, config.DB.NewScope(&model.Tag{}).TableName()),
		Description: tag.Description,
		SpaceID:     uint(sID),
	}

	err = config.DB.Model(&model.Tag{}).Create(&result).Error

	if err != nil {
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
