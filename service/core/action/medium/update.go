package medium

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {

	claimantID := chi.URLParam(r, "id")
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
	})

	config.DB.First(&claimant)

	json.NewEncoder(w).Encode(claimant)
}
