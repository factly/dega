package claimant

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(claimantID)

	claimant := &model.Claimant{}

	claimant.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&claimant).Error

	if err != nil {
		return
	}

	config.DB.Delete(&claimant)

	json.NewEncoder(w).Encode(claimant)
}
