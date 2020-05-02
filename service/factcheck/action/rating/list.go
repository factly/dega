package rating

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
)

func list(w http.ResponseWriter, r *http.Request) {

	var ratings []model.Rating

	err := config.DB.Model(&model.Rating{}).Preload("Medium").Find(&ratings).Error

	if err != nil {
		return
	}

	json.NewEncoder(w).Encode(ratings)
}
