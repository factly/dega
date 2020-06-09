package factcheck

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int             `json:"total"`
	Nodes []factcheckData `json:"nodes"`
}

// list - Get all factchecks
// @Summary Show all factchecks
// @Description Get all factchecks
// @Tags Factcheck
// @ID get-all-factchecks
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /factcheck/factchecks [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		return
	}

	result := paging{}

	offset, limit := util.Paging(r.URL.Query())

	factchecks := []model.Factcheck{}

	err = config.DB.Model(&model.Factcheck{}).Preload("Medium").Where(&model.Factcheck{
		SpaceID: uint(sID),
	}).Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&factchecks).Error

	if err != nil {
		return
	}

	for _, factcheck := range factchecks {
		factcheckList := &factcheckData{}
		categories := []model.FactcheckCategory{}
		tags := []model.FactcheckTag{}
		claims := []model.FactcheckClaim{}

		factcheckList.Factcheck = factcheck

		// fetch all categories
		config.DB.Model(&model.FactcheckCategory{}).Where(&model.FactcheckCategory{
			FactcheckID: factcheck.ID,
		}).Preload("Category").Preload("Category.Medium").Find(&categories)

		// fetch all tags
		config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
			FactcheckID: factcheck.ID,
		}).Preload("Tag").Find(&tags)

		// fetch all claims
		config.DB.Model(&model.FactcheckClaim{}).Where(&model.FactcheckClaim{
			FactcheckID: factcheck.ID,
		}).Preload("Claim").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Find(&claims)

		for _, c := range categories {
			factcheckList.Categories = append(factcheckList.Categories, c.Category)
		}

		for _, t := range tags {
			factcheckList.Tags = append(factcheckList.Tags, t.Tag)
		}

		for _, c := range claims {
			factcheckList.Claims = append(factcheckList.Claims, c.Claim)
		}

		result.Nodes = append(result.Nodes, *factcheckList)
	}

	renderx.JSON(w, http.StatusOK, result)
}
