package factcheck

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get factcheck by id
// @Summary Show a factcheck by id
// @Description Get factcheck by ID
// @Tags Factcheck
// @ID get-factcheck-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param factcheck_id path string true "Factcheck ID"
// @Success 200 {object} factcheckData
// @Router /factcheck/factchecks/{factcheck_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	factcheckID := chi.URLParam(r, "factcheck_id")
	id, err := strconv.Atoi(factcheckID)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &factcheckData{}
	result.Categories = make([]coreModel.Category, 0)
	result.Tags = make([]coreModel.Tag, 0)
	result.Claims = make([]model.Claim, 0)
	result.Authors = make([]coreModel.Author, 0)

	categories := []model.FactcheckCategory{}
	tags := []model.FactcheckTag{}
	claims := []model.FactcheckClaim{}
	factCheckAuthors := []model.FactcheckAuthor{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Factcheck{}).Preload("Medium").Where(&model.Factcheck{
		SpaceID: uint(sID),
	}).First(&result.Factcheck).Error

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// fetch all categories
	config.DB.Model(&model.FactcheckCategory{}).Where(&model.FactcheckCategory{
		FactcheckID: uint(id),
	}).Preload("Category").Preload("Category.Medium").Find(&categories)

	// fetch all tags
	config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
		FactcheckID: uint(id),
	}).Preload("Tag").Find(&tags)

	// fetch all claims
	config.DB.Model(&model.FactcheckClaim{}).Where(&model.FactcheckClaim{
		FactcheckID: uint(id),
	}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Find(&claims)

	// fetch all authors
	config.DB.Model(&model.FactcheckAuthor{}).Where(&model.FactcheckAuthor{
		FactcheckID: uint(id),
	}).Find(&factCheckAuthors)

	for _, c := range categories {
		result.Categories = append(result.Categories, c.Category)
	}

	for _, t := range tags {
		result.Tags = append(result.Tags, t.Tag)
	}

	for _, c := range claims {
		result.Claims = append(result.Claims, c.Claim)
	}

	// Adding author
	authors, err := author.All(r.Context())
	for _, postAuthor := range factCheckAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)
		if authors[aID].Email != "" {
			result.Authors = append(result.Authors, authors[aID])
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
