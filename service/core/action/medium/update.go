package medium

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// update - Update medium by id
// @Summary Update a medium by id
// @Description Update medium by ID
// @Tags Medium
// @ID update-medium-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param Medium body medium false "Medium"
// @Success 200 {object} model.Medium
// @Router /core/media/{medium_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		return
	}

	req := &model.Medium{}
	json.NewDecoder(r.Body).Decode(&req)

	claimant := &model.Medium{}
	claimant.ID = uint(id)

	config.DB.Model(&model.Medium{}).Updates(model.Medium{
		Name: req.Name,
		Slug: req.Slug,
	}).Preload("Medium").First(&claimant)

	render.JSON(w, http.StatusOK, claimant)
}
