package claimant

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

// create - Create claimant
// @Summary Create claimant
// @Description Create claimant
// @Tags Claimant
// @ID add-claimant
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Claimant body claimant true "Claimant Object"
// @Success 201 {object} model.Claimant
// @Router /factcheck/claimants [post]
func create(w http.ResponseWriter, r *http.Request) {

	claimant := &claimant{}

	json.NewDecoder(r.Body).Decode(&claimant)

	result := &model.Claimant{
		Name:        claimant.Name,
		Slug:        claimant.Slug,
		Description: claimant.Description,
		MediumID:    claimant.MediumID,
		SpaceID:     claimant.SpaceID,
		TagLine:     claimant.TagLine,
	}

	err := config.DB.Model(&model.Claimant{}).Create(&result).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Claimant{}).Preload("Medium").First(&result)

	render.JSON(w, http.StatusCreated, result)
}
