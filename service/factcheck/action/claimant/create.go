package claimant

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create claimant
// @Summary Create claimant
// @Description Create claimant
// @Tags Claimant
// @ID add-claimant
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Claimant body claimant true "Claimant Object"
// @Success 201 {object} model.Claimant
// @Failure 400 {array} string
// @Router /factcheck/claimants [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		return
	}

	claimant := &claimant{}

	json.NewDecoder(r.Body).Decode(&claimant)

	validationError := validationx.Check(claimant)

	if validationError != nil {
		renderx.JSON(w, http.StatusBadRequest, validationError)
		return
	}

	result := &model.Claimant{
		Name:        claimant.Name,
		Slug:        claimant.Slug,
		Description: claimant.Description,
		MediumID:    claimant.MediumID,
		SpaceID:     uint(sID),
		TagLine:     claimant.TagLine,
	}

	err = config.DB.Model(&model.Claimant{}).Create(&result).Error

	if err != nil {
		return
	}

	config.DB.Model(&model.Claimant{}).Preload("Medium").First(&result)

	renderx.JSON(w, http.StatusCreated, result)
}
