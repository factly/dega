package rating

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
)

// create - Create rating
// @Summary Create rating
// @Description Create rating
// @Tags Rating
// @ID add-rating
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Rating body rating true "Rating Object"
// @Success 201 {object} model.Rating
// @Router /factcheck/ratings [post]
func create(w http.ResponseWriter, r *http.Request) {

	req := &model.Rating{}

	json.NewDecoder(r.Body).Decode(&req)

	err := config.DB.Model(&model.Rating{}).Create(&req).Error

	if err != nil {
		return
	}

	config.DB.Model(&req).Preload("Medium").First(&req)

	json.NewEncoder(w).Encode(req)
}
