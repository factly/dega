package medium

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {

	mediumID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(mediumID)

	medium := &model.Medium{}

	medium.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&medium).Error

	if err != nil {
		return
	}

	config.DB.Delete(&medium)

	json.NewEncoder(w).Encode(medium)
}
