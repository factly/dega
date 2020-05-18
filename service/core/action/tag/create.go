package tag

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// create - Create tag
func create(w http.ResponseWriter, r *http.Request) {

	tag := &model.Tag{}

	json.NewDecoder(r.Body).Decode(&tag)

	err := config.DB.Model(&model.Tag{}).Create(&tag).Error

	if err != nil {
		log.Fatal(err)
	}

	render.JSON(w, http.StatusCreated, tag)
}
