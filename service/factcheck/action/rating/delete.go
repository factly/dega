package rating

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {

	ratingID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(ratingID)

	rating := &model.Rating{}

	rating.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&rating).Error

	if err != nil {
		return
	}

	config.DB.Delete(&rating)

	render.JSON(w, http.StatusOK, nil)
}
