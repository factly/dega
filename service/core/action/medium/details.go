package medium

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	mediumID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(mediumID)

	if err != nil {
		return
	}

	req := &model.Medium{}

	req.ID = uint(id)

	err = config.DB.Model(&model.Medium{}).First(&req).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, req)
}
