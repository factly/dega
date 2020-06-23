package factcheck

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/dega-server/validation"
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
		return
	}

	factcheckID := chi.URLParam(r, "factcheck_id")
	id, err := strconv.Atoi(factcheckID)

	if err != nil {
		return
	}

	factcheck := &factcheck{}
	categories := []model.FactcheckCategory{}
	tags := []model.FactcheckTag{}
	claims := []model.FactcheckClaim{}

	json.NewDecoder(r.Body).Decode(&factcheck)

	result := &factcheckData{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Factcheck{
		SpaceID: uint(sID),
	}).First(&result.Factcheck).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	factcheck.SpaceID = result.SpaceID

	err = factcheck.CheckSpace(config.DB)

	if err != nil {
		validation.Error(w, r, err.Error())
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

	// delete tags
	for _, t := range tags {
		present := false
		for _, id := range factcheck.TagIDS {
			if t.TagID == id {
				present = true
			}
		}
		if present == false {
			config.DB.Where(&model.FactcheckTag{
				TagID:       t.TagID,
				FactcheckID: uint(id),
			}).Delete(model.FactcheckTag{})
		}
	}

	// creating new tags
	for _, id := range factcheck.TagIDS {
		present := false
		for _, t := range tags {
			if t.TagID == id {
				present = true
				result.Tags = append(result.Tags, t.Tag)
			}
		}
		if present == false {
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
	}

	// delete categories
	for _, c := range categories {
		present := false
		for _, id := range factcheck.CategoryIDS {
			if c.CategoryID == id {
				present = true
			}
		}
		if present == false {
			config.DB.Where(&model.FactcheckCategory{
				CategoryID:  c.CategoryID,
				FactcheckID: uint(id),
			}).Delete(model.FactcheckCategory{})
		}
	}

	// creating new categories
	for _, id := range factcheck.CategoryIDS {
		present := false
		for _, c := range categories {
			if c.CategoryID == id {
				present = true
				result.Categories = append(result.Categories, c.Category)
			}
		}
		if present == false {
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
	}

	// delete claims
	for _, c := range claims {
		present := false
		for _, id := range factcheck.ClaimIDS {
			if c.ClaimID == id {
				present = true
			}
		}
		if present == false {
			config.DB.Where(&model.FactcheckClaim{
				ClaimID:     c.ClaimID,
				FactcheckID: uint(id),
			}).Delete(model.FactcheckClaim{})
		}
	}

	// creating new categories
	for _, id := range factcheck.ClaimIDS {
		present := false
		for _, c := range claims {
			if c.ClaimID == id {
				present = true
				result.Claims = append(result.Claims, c.Claim)
			}
		}

		if present == false {
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
	}

	renderx.JSON(w, http.StatusOK, result)
}
