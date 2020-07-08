package factcheck

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// update - Update factcheck by id
// @Summary Update a factcheck by id
// @Description Update factcheck by ID
// @Tags Factcheck
// @ID update-factcheck-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param factcheck_id path string true "Factcheck ID"
// @Param Factcheck body factcheck false "Factcheck"
// @Success 200 {object} factcheckData
// @Router /factcheck/factchecks/{factcheck_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

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

	factcheck := &factcheck{}
	factcheckCategories := []model.FactcheckCategory{}
	factcheckTags := []model.FactcheckTag{}
	factcheckClaims := []model.FactcheckClaim{}
	factcheckAuthors := []model.FactcheckAuthor{}

	err = json.NewDecoder(r.Body).Decode(&factcheck)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result := &factcheckData{}
	result.ID = uint(id)
	result.Categories = make([]coreModel.Category, 0)
	result.Tags = make([]coreModel.Tag, 0)
	result.Claims = make([]model.Claim, 0)
	result.Authors = make([]coreModel.Author, 0)

	// fetch all authors
	authors, err := author.All(r.Context())

	// check record exists or not
	err = config.DB.Where(&model.Factcheck{
		SpaceID: uint(sID),
	}).First(&result.Factcheck).Error

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	factcheck.SpaceID = result.SpaceID

	err = factcheck.CheckSpace(config.DB)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var factcheckSlug string

	if result.Slug == factcheck.Slug {
		factcheckSlug = result.Slug
	} else if factcheck.Slug != "" && slug.Check(factcheck.Slug) {
		factcheckSlug = slug.Approve(factcheck.Slug, sID, config.DB.NewScope(&model.Factcheck{}).TableName())
	} else {
		factcheckSlug = slug.Approve(slug.Make(factcheck.Title), sID, config.DB.NewScope(&model.Factcheck{}).TableName())
	}

	config.DB.Model(&result.Factcheck).Updates(model.Factcheck{
		Title:            factcheck.Title,
		Slug:             factcheckSlug,
		Status:           factcheck.Status,
		Subtitle:         factcheck.Subtitle,
		Excerpt:          factcheck.Excerpt,
		Updates:          factcheck.Updates,
		Description:      factcheck.Description,
		IsFeatured:       factcheck.IsFeatured,
		IsHighlighted:    factcheck.IsHighlighted,
		IsSticky:         factcheck.IsSticky,
		FeaturedMediumID: factcheck.FeaturedMediumID,
		PublishedDate:    factcheck.PublishedDate,
	})

	config.DB.Model(&model.Factcheck{}).Preload("Medium").First(&result.Factcheck)

	// fetch existing factcheck categories
	config.DB.Model(&model.FactcheckCategory{}).Where(&model.FactcheckCategory{
		FactcheckID: uint(id),
	}).Preload("Category").Find(&factcheckCategories)

	// fetch existing factcheck tags
	config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
		FactcheckID: uint(id),
	}).Preload("Tag").Find(&factcheckTags)

	// fetch existing factcheck claims
	config.DB.Model(&model.FactcheckClaim{}).Where(&model.FactcheckClaim{
		FactcheckID: uint(id),
	}).Preload("Claim").Find(&factcheckClaims)

	// fetch existing factcheck authors
	config.DB.Model(&model.FactcheckAuthor{}).Where(&model.FactcheckAuthor{
		FactcheckID: uint(id),
	}).Find(&factcheckAuthors)

	prevTagIDs := make([]uint, 0)
	factcheckTagIDs := make([]uint, 0)
	mapperFactcheckTag := map[uint]model.FactcheckTag{}

	for _, factcheckTag := range factcheckTags {
		mapperFactcheckTag[factcheckTag.TagID] = factcheckTag
		prevTagIDs = append(prevTagIDs, factcheckTag.TagID)
	}

	toCreateIDs, toDeleteIDs := arrays.Difference(prevTagIDs, factcheck.TagIDs)

	// map factcheck tag ids
	for _, id := range toDeleteIDs {
		factcheckTagIDs = append(factcheckTagIDs, mapperFactcheckTag[id].ID)
	}

	// delete factcheck tags
	if len(factcheckTagIDs) > 0 {
		config.DB.Where(factcheckTagIDs).Delete(model.FactcheckTag{})
	}

	// create new factcheck tags
	for _, id := range toCreateIDs {
		factcheckTag := &model.FactcheckTag{}
		factcheckTag.TagID = uint(id)
		factcheckTag.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckTag{}).Create(&factcheckTag).Error
		if err != nil {
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// fetch updated factcheck tags
	updatedFactcheckTags := []model.FactcheckTag{}
	config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
		FactcheckID: uint(id),
	}).Preload("Tag").Find(&updatedFactcheckTags)

	// appending factcheck tags to result
	for _, factcheckTag := range updatedFactcheckTags {
		result.Tags = append(result.Tags, factcheckTag.Tag)
	}

	prevCategoryIDs := make([]uint, 0)
	mapperFactcheckCategory := map[uint]model.FactcheckCategory{}
	factcheckCategoryIDs := make([]uint, 0)

	for _, factcheckCategory := range factcheckCategories {
		mapperFactcheckCategory[factcheckCategory.CategoryID] = factcheckCategory
		prevCategoryIDs = append(prevCategoryIDs, factcheckCategory.CategoryID)
	}

	toCreateIDs, toDeleteIDs = arrays.Difference(prevCategoryIDs, factcheck.CategoryIDs)

	// map factcheck category ids
	for _, id := range toDeleteIDs {
		factcheckCategoryIDs = append(factcheckCategoryIDs, mapperFactcheckCategory[id].ID)
	}

	// delete factcheck categories
	if len(factcheckCategoryIDs) > 0 {
		config.DB.Where(factcheckCategoryIDs).Delete(model.FactcheckCategory{})
	}

	// creating new categories
	for _, id := range toCreateIDs {
		factcheckCategory := &model.FactcheckCategory{}
		factcheckCategory.CategoryID = uint(id)
		factcheckCategory.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckCategory{}).Create(&factcheckCategory).Error
		if err != nil {
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// fetch updated factcheck categories
	updatedFactcheckCategories := []model.FactcheckCategory{}
	config.DB.Model(&model.FactcheckCategory{}).Where(&model.FactcheckCategory{
		FactcheckID: uint(id),
	}).Preload("Category").Preload("Category.Medium").Find(&updatedFactcheckCategories)

	// appending factcheck categories to result
	for _, factcheckCategory := range updatedFactcheckCategories {
		result.Categories = append(result.Categories, factcheckCategory.Category)
	}

	prevAuthorIDs := make([]uint, 0)
	mapperFactcheckAuthor := map[uint]model.FactcheckAuthor{}
	factcheckAuthorIDs := make([]uint, 0)

	for _, factcheckAuthor := range factcheckAuthors {
		mapperFactcheckAuthor[factcheckAuthor.AuthorID] = factcheckAuthor
		prevAuthorIDs = append(prevAuthorIDs, factcheckAuthor.AuthorID)
	}

	toCreateIDs, toDeleteIDs = arrays.Difference(prevAuthorIDs, factcheck.AuthorIDs)

	// map factcheck author ids
	for _, id := range toDeleteIDs {
		factcheckAuthorIDs = append(factcheckAuthorIDs, mapperFactcheckAuthor[id].ID)
	}

	// delete factcheck authors
	if len(factcheckAuthorIDs) > 0 {
		config.DB.Where(factcheckAuthorIDs).Delete(model.FactcheckAuthor{})
	}

	// creating new factcheck authors
	for _, id := range factcheck.AuthorIDs {
		factcheckAuthor := &model.FactcheckAuthor{}
		factcheckAuthor.AuthorID = uint(id)
		factcheckAuthor.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckAuthor{}).Create(&factcheckAuthor).Error

		if err != nil {
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// fetch existing factcheck authors
	updatedFactcheckAuthors := []model.FactcheckAuthor{}
	config.DB.Model(&model.FactcheckAuthor{}).Where(&model.FactcheckAuthor{
		FactcheckID: uint(id),
	}).Find(&updatedFactcheckAuthors)

	// appending factcheck authors to result
	for _, factcheckAuthor := range updatedFactcheckAuthors {
		aID := fmt.Sprint(factcheckAuthor.AuthorID)
		if authors[aID].Email != "" {
			result.Authors = append(result.Authors, authors[aID])
		}
	}

	prevClaimIDs := make([]uint, 0)
	mapperFactcheckClaim := map[uint]model.FactcheckClaim{}
	factcheckClaimIDs := make([]uint, 0)

	for _, factcheckClaim := range factcheckClaims {
		mapperFactcheckClaim[factcheckClaim.ClaimID] = factcheckClaim
		prevClaimIDs = append(prevClaimIDs, factcheckClaim.ClaimID)
	}

	toCreateIDs, toDeleteIDs = arrays.Difference(prevClaimIDs, factcheck.ClaimIDs)

	// map factcheck claim ids
	for _, id := range toDeleteIDs {
		factcheckClaimIDs = append(factcheckClaimIDs, mapperFactcheckClaim[id].ID)
	}

	// delete factcheck cliams
	if len(factcheckClaimIDs) > 0 {
		config.DB.Where(factcheckClaimIDs).Delete(model.FactcheckClaim{})
	}

	for _, id := range factcheck.ClaimIDs {
		factcheckClaim := &model.FactcheckClaim{}
		factcheckClaim.ClaimID = uint(id)
		factcheckClaim.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckClaim{}).Create(&factcheckClaim).Error
		if err != nil {
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// fetch existing factcheck claims
	updatedFactcheckClaims := []model.FactcheckClaim{}
	config.DB.Model(&model.FactcheckClaim{}).Where(&model.FactcheckClaim{
		FactcheckID: uint(id),
	}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Find(&updatedFactcheckClaims)

	for _, factcheckClaim := range updatedFactcheckClaims {
		result.Claims = append(result.Claims, factcheckClaim.Claim)
	}

	renderx.JSON(w, http.StatusOK, result)
}
