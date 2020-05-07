package category

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

func create(w http.ResponseWriter, r *http.Request) {

	category := &model.Category{}

	json.NewDecoder(r.Body).Decode(&category)

	err := config.DB.Model(&model.Category{}).Create(&category).Error

	if err != nil {
		log.Fatal(err)
	}

	config.DB.Model(&category).Association("Medium").Find(&category.Medium)

	render.JSON(w, http.StatusCreated, category)
}
