package util

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factcheckModel "github.com/factly/dega-server/service/fact-check/model"
)

// LoadObjects loads object from db
func LoadObjects(objIDMap map[string][]uint) map[string]interface{} {

	returnMap := make(map[string]interface{})

	for kind, ids := range objIDMap {
		switch kind {
		case "post":
			postlist := make([]model.Post, 0)
			config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Where(ids).Find(&postlist)
			returnMap[kind] = postlist
			break
		case "category":
			catlist := make([]model.Category, 0)
			config.DB.Model(&model.Category{}).Preload("Medium").Where(ids).Find(&catlist)
			returnMap[kind] = catlist
			break
		case "format":
			formatlist := make([]model.Format, 0)
			config.DB.Model(&model.Format{}).Where(ids).Find(&formatlist)
			returnMap[kind] = formatlist
			break
		case "medium":
			mediumlist := make([]model.Medium, 0)
			config.DB.Model(&model.Medium{}).Where(ids).Find(&mediumlist)
			returnMap[kind] = mediumlist
			break
		case "tag":
			taglist := make([]model.Tag, 0)
			config.DB.Model(&model.Tag{}).Where(ids).Find(&taglist)
			returnMap[kind] = taglist
			break
		case "rating":
			ratinglist := make([]factcheckModel.Rating, 0)
			config.DB.Model(&factcheckModel.Rating{}).Preload("Medium").Where(ids).Find(&ratinglist)
			returnMap[kind] = ratinglist
			break
		case "claimant":
			claimantlist := make([]factcheckModel.Claimant, 0)
			config.DB.Model(&factcheckModel.Claimant{}).Preload("Medium").Where(ids).Find(&claimantlist)
			returnMap[kind] = claimantlist
			break
		case "claim":
			claimlist := make([]factcheckModel.Claim, 0)
			config.DB.Model(&factcheckModel.Claim{}).Preload("Rating").Preload("Rating.Medium").Preload("Claimant").Preload("Claimant.Medium").Where(ids).Find(&claimlist)
			returnMap[kind] = claimlist
			break
		}
	}

	return returnMap
}
