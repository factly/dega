package medium

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

func create(w http.ResponseWriter, r *http.Request) {

	req := &model.Medium{}

	json.NewDecoder(r.Body).Decode(&req)

	err := config.DB.Model(&model.Medium{}).Create(&req).Error

	if err != nil {
		log.Fatal(err)
	}

	json.NewEncoder(w).Encode(req)
}
