package medium

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// create - Create medium
// @Summary Create medium
// @Description Create medium
// @Tags Medium
// @ID add-medium
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Medium body medium true "Medium Object"
// @Success 201 {object} model.Medium
// @Router /core/media [post]
func create(w http.ResponseWriter, r *http.Request) {

	req := &model.Medium{}

	json.NewDecoder(r.Body).Decode(&req)

	err := config.DB.Model(&model.Medium{}).Create(&req).Error

	if err != nil {
		return
	}

	json.NewEncoder(w).Encode(req)
}
