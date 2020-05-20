package claimant

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {
	claimantID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		return
	}

	req := &model.Claimant{}

	req.ID = uint(id)

	err = config.DB.Model(&model.Claimant{}).Preload("Medium").First(&req).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, req)
}
