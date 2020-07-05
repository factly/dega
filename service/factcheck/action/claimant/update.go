package claimant

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// update - Update claimant by id
// @Summary Update a claimant by id
// @Description Update claimant by ID
// @Tags Claimant
// @ID update-claimant-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Param Claimant body claimant false "Claimant"
// @Success 200 {object} model.Claimant
// @Router /factcheck/claimants/{claimant_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	claimant := &model.Claimant{}
	json.NewDecoder(r.Body).Decode(&claimant)

	result := &model.Claimant{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Claimant{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var claimantSlug string

	if result.Slug == claimant.Slug {
		claimantSlug = result.Slug
	} else if claimant.Slug != "" && slug.Check(claimant.Slug) {
		claimantSlug = slug.Approve(claimant.Slug, sID, config.DB.NewScope(&model.Claimant{}).TableName())
	} else {
		claimantSlug = slug.Approve(slug.Make(claimant.Name), sID, config.DB.NewScope(&model.Claimant{}).TableName())
	}

	config.DB.Model(&result).Updates(model.Claimant{
		Name:        claimant.Name,
		Slug:        claimantSlug,
		MediumID:    claimant.MediumID,
		TagLine:     claimant.TagLine,
		Description: claimant.Description,
	}).Preload("Medium").First(&result)

	renderx.JSON(w, http.StatusOK, result)
}
