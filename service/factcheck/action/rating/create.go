package rating

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
)

func create(w http.ResponseWriter, r *http.Request) {

	req := &model.Rating{}

	json.NewDecoder(r.Body).Decode(&req)

	err := config.DB.Model(&model.Rating{}).Create(&req).Error

	if err != nil {
		return
	}

	config.DB.Model(&req).Association("Medium").Find(&req.Medium)

	json.NewEncoder(w).Encode(req)
}
