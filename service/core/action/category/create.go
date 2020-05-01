package category

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

func create(w http.ResponseWriter, r *http.Request) {

	req := &model.Category{}

	json.NewDecoder(r.Body).Decode(&req)

	err := config.DB.Model(&model.Category{}).Create(&req).Error

	if err != nil {
		log.Fatal(err)
	}

	config.DB.Model(&req).Association("Medium").Find(&req.Medium)

	json.NewEncoder(w).Encode(req)
}
