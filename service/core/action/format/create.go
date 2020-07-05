package format

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

// create - Create format
// @Summary Create format
// @Description Create format
// @Tags Format
// @ID add-format
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Format body format true "Format Object"
// @Success 201 {object} model.Format
// @Failure 400 {array} string
// @Router /core/formats [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, errors.InternalServerError, 500)
		return
	}

	format := &format{}

	json.NewDecoder(r.Body).Decode(&format)

	validationError := validationx.Check(format)

	if validationError != nil {
		errors.Validator(w, validationError)
		return
	}

	var formatSlug string
	if format.Slug != "" && slug.Check(format.Slug) {
		formatSlug = format.Slug
	} else {
		formatSlug = slug.Make(format.Name)
	}

	result := &model.Format{
		Name:        format.Name,
		Description: format.Description,
		Slug:        slug.Approve(formatSlug, sID, config.DB.NewScope(&model.Format{}).TableName()),
		SpaceID:     uint(sID),
	}

	err = config.DB.Model(&model.Format{}).Create(&result).Error

	if err != nil {
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
