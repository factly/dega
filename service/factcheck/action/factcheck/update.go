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

	// fetch all factcheck categories
	config.DB.Model(&model.FactcheckCategory{}).Where(&model.FactcheckCategory{
		FactcheckID: uint(id),
	}).Preload("Category").Preload("Category.Medium").Find(&factcheckCategories)

	// fetch all factcheck Tags
	config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
		FactcheckID: uint(id),
	}).Preload("Tag").Find(&factcheckTags)

	// fetch all factcheckClaims
	config.DB.Model(&model.FactcheckClaim{}).Where(&model.FactcheckClaim{
		FactcheckID: uint(id),
	}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Find(&factcheckClaims)

	// fetch all authors
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

	common, toCreateIDs, toDeleteIDs := arrays.Difference(prevTagIDs, factcheck.TagIDS)

	// map factcheck tag ids
	for _, id := range toDeleteIDs {
		factcheckTagIDs = append(factcheckTagIDs, mapperFactcheckTag[id].ID)
	}

	// delete factcheck tags
	if len(factcheck.TagIDS) == 0 {
		config.DB.Where(&model.FactcheckTag{
			FactcheckID: uint(id),
		}).Delete(model.FactcheckTag{})
	} else {
		config.DB.Where(factcheckTagIDs).Delete(model.FactcheckTag{})
	}

	// create new factcheck tags
	for _, id := range toCreateIDs {
		factcheckTag := &model.FactcheckTag{}
		factcheckTag.TagID = uint(id)
		factcheckTag.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckTag{}).Create(&factcheckTag).Error

		if err != nil {
			return
		}
		config.DB.Model(&model.FactcheckTag{}).Preload("Tag").First(&factcheckTag)
		result.Tags = append(result.Tags, factcheckTag.Tag)
	}

	// appending previous factcheck tags to result
	for _, id := range common {
		factcheckTag := mapperFactcheckTag[id]
		result.Tags = append(result.Tags, factcheckTag.Tag)
	}

	prevCategoryIDs := make([]uint, 0)
	mapperFactcheckCategory := map[uint]model.FactcheckCategory{}
	factcheckCategoryIDs := make([]uint, 0)

	for _, factcheckCategory := range factcheckCategories {
		mapperFactcheckCategory[factcheckCategory.CategoryID] = factcheckCategory
		prevCategoryIDs = append(prevCategoryIDs, factcheckCategory.CategoryID)
	}

	common, toCreateIDs, toDeleteIDs = arrays.Difference(prevCategoryIDs, factcheck.CategoryIDS)

	// map factcheck category ids
	for _, id := range toDeleteIDs {
		factcheckCategoryIDs = append(factcheckCategoryIDs, mapperFactcheckCategory[id].ID)
	}

	// delete factcheck categories
	if len(factcheck.CategoryIDS) == 0 {
		config.DB.Where(&model.FactcheckCategory{
			FactcheckID: uint(id),
		}).Delete(model.FactcheckCategory{})
	} else {
		config.DB.Where(factcheckCategoryIDs).Delete(model.FactcheckCategory{})
	}

	// creating new categories
	for _, id := range toCreateIDs {
		factcheckCategory := &model.FactcheckCategory{}
		factcheckCategory.CategoryID = uint(id)
		factcheckCategory.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckCategory{}).Create(&factcheckCategory).Error

		if err != nil {
			return
		}

		config.DB.Model(&model.FactcheckCategory{}).Preload("Category").Preload("Category.Medium").First(&factcheckCategory)
		result.Categories = append(result.Categories, factcheckCategory.Category)

	}

	// appending previous factcheck categories to result
	for _, id := range common {
		factcheckCategory := mapperFactcheckCategory[id]
		result.Categories = append(result.Categories, factcheckCategory.Category)

	}

	prevAuthorIDs := make([]uint, 0)
	mapperFactcheckAuthor := map[uint]model.FactcheckAuthor{}
	factcheckAuthorIDs := make([]uint, 0)

	for _, factcheckAuthor := range factcheckAuthors {
		mapperFactcheckAuthor[factcheckAuthor.AuthorID] = factcheckAuthor
		prevAuthorIDs = append(prevAuthorIDs, factcheckAuthor.AuthorID)
	}

	common, toCreateIDs, toDeleteIDs = arrays.Difference(prevAuthorIDs, factcheck.AuthorIDS)

	// map factcheck tag ids
	for _, id := range toDeleteIDs {
		factcheckAuthorIDs = append(factcheckAuthorIDs, mapperFactcheckTag[id].ID)
	}

	// delete factcheck authors
	if len(factcheck.AuthorIDS) == 0 {
		config.DB.Where(&model.FactcheckAuthor{
			FactcheckID: uint(id),
		}).Delete(model.FactcheckAuthor{})
	} else {
		config.DB.Where(factcheckAuthorIDs).Delete(model.FactcheckTag{})
	}

	// creating new factcheck authors
	for _, id := range factcheck.AuthorIDS {

		factcheckAuthor := &model.FactcheckAuthor{}
		factcheckAuthor.AuthorID = uint(id)
		factcheckAuthor.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckAuthor{}).Create(&factcheckAuthor).Error

		if err != nil {
			return
		}
		aID := fmt.Sprint(factcheckAuthor.AuthorID)

		if authors[aID].Email != "" {
			result.Authors = append(result.Authors, authors[aID])
		}

	}

	// appending previous factcheck authors to result
	for _, id := range common {
		factcheckAuthor := mapperFactcheckAuthor[id]
		if factcheckAuthor.AuthorID == id {
			aID := fmt.Sprint(factcheckAuthor.AuthorID)

			if authors[aID].Email != "" {
				result.Authors = append(result.Authors, authors[aID])
			}
		}
	}

	prevClaimIDs := make([]uint, 0)
	mapperFactcheckClaim := map[uint]model.FactcheckClaim{}
	factcheckClaimIDs := make([]uint, 0)

	for _, factcheckClaim := range factcheckClaims {
		mapperFactcheckClaim[factcheckClaim.ClaimID] = factcheckClaim
		prevClaimIDs = append(prevClaimIDs, factcheckClaim.ClaimID)
	}

	common, toCreateIDs, toDeleteIDs = arrays.Difference(prevClaimIDs, factcheck.ClaimIDS)

	// map factcheck claim ids
	for _, id := range toDeleteIDs {
		factcheckClaimIDs = append(factcheckClaimIDs, mapperFactcheckClaim[id].ID)
	}

	// delete factcheck cliams
	if len(factcheck.ClaimIDS) == 0 {
		config.DB.Where(&model.FactcheckClaim{
			FactcheckID: uint(id),
		}).Delete(model.FactcheckClaim{})
	} else {
		config.DB.Where(factcheckClaimIDs).Delete(model.FactcheckTag{})
	}

	for _, id := range factcheck.ClaimIDS {
		factcheckClaim := &model.FactcheckClaim{}
		factcheckClaim.ClaimID = uint(id)
		factcheckClaim.FactcheckID = result.ID

		err = config.DB.Model(&model.FactcheckClaim{}).Create(&factcheckClaim).Error

		if err != nil {
			return
		}

		config.DB.Model(&model.FactcheckClaim{}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Preload("Claim.Rating").Preload("Claim.Rating.Medium").First(&factcheckClaim)
		result.Claims = append(result.Claims, factcheckClaim.Claim)

	}
	for _, id := range common {
		factcheckClaim := mapperFactcheckClaim[id]
		result.Claims = append(result.Claims, factcheckClaim.Claim)

	}

	renderx.JSON(w, http.StatusOK, result)
}
