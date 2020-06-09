package medium

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/validation"
	"github.com/factly/x/renderx"
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
// @Param X-Space header string true "Space ID"
// @Param Medium body medium true "Medium Object"
// @Success 201 {object} model.Medium
// @Failure 400 {array} string
// @Router /core/media [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		return
	}

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
		SpaceID:     uint(sID),
	}

	err = config.DB.Model(&model.Medium{}).Create(&result).Error

	if err != nil {
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
