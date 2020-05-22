package factcheck

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
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
// @Param factcheck_id path string true "Factcheck ID"
// @Param Factcheck body factcheck false "Factcheck"
// @Success 200 {object} factcheckData
// @Router /factcheck/factchecks/{factcheck_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
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

	config.DB.Model(&result.Factcheck).Updates(model.Factcheck{
		Title:            factcheck.Title,
		Slug:             factcheck.Slug,
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
	}).Preload("Category").Find(&categories)

	// fetch all tags
	config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
		FactcheckID: uint(id),
	}).Preload("Tag").Find(&tags)

	// fetch all claims
	config.DB.Model(&model.FactcheckClaim{}).Where(&model.FactcheckClaim{
		FactcheckID: uint(id),
	}).Preload("Claim").Find(&claims)

	// delete tags
	for _, t := range tags {
		present := false
		for _, id := range factcheck.TagIDS {
			if t.TagID == id {
				present = true
			}
		}
		if !present {
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
			if t.ID == id {
				present = true
				result.Tags = append(result.Tags, t.Tag)
			}
		}
		if !present {
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
		if !present {
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
			if c.ID == id {
				present = true
				result.Categories = append(result.Categories, c.Category)
			}
		}
		if !present {
			factcheckCategory := &model.FactcheckCategory{}
			factcheckCategory.CategoryID = uint(id)
			factcheckCategory.FactcheckID = result.ID

			err = config.DB.Model(&model.FactcheckCategory{}).Create(&factcheckCategory).Error

			if err != nil {
				return
			}

			config.DB.Model(&model.FactcheckCategory{}).Preload("Category").First(&factcheckCategory)
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
		if !present {
			config.DB.Where(&model.FactcheckClaim{
				ClaimID:     c.ClaimID,
				FactcheckID: uint(id),
			}).Delete(model.FactcheckClaim{})
		}
	}

	// creating new categories
	for _, id := range factcheck.ClaimIDS {
		present := false
		for _, c := range categories {
			if c.ID == id {
				present = true
				result.Categories = append(result.Categories, c.Category)
			}
		}
		if !present {
			factcheckClaim := &model.FactcheckClaim{}
			factcheckClaim.ClaimID = uint(id)
			factcheckClaim.FactcheckID = result.ID

			err = config.DB.Model(&model.FactcheckClaim{}).Create(&factcheckClaim).Error

			if err != nil {
				return
			}

			config.DB.Model(&model.FactcheckClaim{}).Preload("Claim").First(&factcheckClaim)
			result.Claims = append(result.Claims, factcheckClaim.Claim)
		}
	}

	render.JSON(w, http.StatusOK, result)
}
