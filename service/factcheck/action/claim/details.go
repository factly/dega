package claim

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	claimID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(claimID)

	if err != nil {
		return
	}

	result := &model.Claim{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Claim{}).Preload("Rating").Preload("Claimant").Preload("Rating.Medium").Preload("Claimant.Medium").First(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
