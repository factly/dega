package factcheck

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all factchecks
// @Summary Show all factchecks
// @Description Get all factchecks
// @Tags Factcheck
// @ID get-all-factchecks
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} factcheckList
// @Router /factcheck/factchecks [get]
func list(w http.ResponseWriter, r *http.Request) {

	result := []factcheckList{}
	factchecks := []model.Factcheck{}

	err := config.DB.Model(&model.Factcheck{}).Preload("Medium").Find(&factchecks).Error

	if err != nil {
		return
	}

	for _, factcheck := range factchecks {
		factcheckList := &factcheckList{}
		categories := []model.FactcheckCategory{}
		tags := []model.FactcheckTag{}

		factcheckList.Factcheck = factcheck

		// fetch all categories
		config.DB.Model(&model.FactcheckCategory{}).Where(&model.FactcheckCategory{
			FactcheckID: factcheck.ID,
		}).Preload("Category").Find(&categories)

		// fetch all tags
		config.DB.Model(&model.FactcheckTag{}).Where(&model.FactcheckTag{
			FactcheckID: factcheck.ID,
		}).Preload("Tag").Find(&tags)

		for _, c := range categories {
			factcheckList.Categories = append(factcheckList.Categories, c.Category)
		}

		for _, t := range tags {
			factcheckList.Tags = append(factcheckList.Tags, t.Tag)
		}

		result = append(result, *factcheckList)
	}

	render.JSON(w, http.StatusOK, result)
}
