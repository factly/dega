package category

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

func list(w http.ResponseWriter, r *http.Request) {

	var categories []model.Category

	config.DB.Model(&model.Category{}).Preload("Medium").Find(&categories)

	json.NewEncoder(w).Encode(categories)
}
