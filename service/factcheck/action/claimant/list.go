package claimant

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
)

func list(w http.ResponseWriter, r *http.Request) {

	var claimants []model.Claimant

	err := config.DB.Model(&model.Claimant{}).Preload("Medium").Find(&claimants).Error

	if err != nil {
		return
	}

	json.NewEncoder(w).Encode(claimants)
}
