package claimant

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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
// @Router /fact-check/claimants [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	claimant := &claimant{}

	err = json.NewDecoder(r.Body).Decode(&claimant)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(claimant)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var claimantSlug string
	if claimant.Slug != "" && slug.Check(claimant.Slug) {
		claimantSlug = claimant.Slug
	} else {
		claimantSlug = slug.Make(claimant.Name)
	}

	result := &model.Claimant{
		Name:        claimant.Name,
		Slug:        slug.Approve(claimantSlug, sID, config.DB.NewScope(&model.Claimant{}).TableName()),
		Description: claimant.Description,
		MediumID:    claimant.MediumID,
		SpaceID:     uint(sID),
		TagLine:     claimant.TagLine,
	}

	err = config.DB.Model(&model.Claimant{}).Create(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	config.DB.Model(&model.Claimant{}).Preload("Medium").First(&result)

	renderx.JSON(w, http.StatusCreated, result)
}
