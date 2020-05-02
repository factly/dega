package rating

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {

	ratingID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		return
	}

	req := &model.Rating{}
	json.NewDecoder(r.Body).Decode(&req)

	rating := &model.Rating{}
	rating.ID = uint(id)

	config.DB.Model(&model.Rating{}).Updates(model.Rating{
		Name:        req.Name,
		Slug:        req.Slug,
		MediumID:    req.MediumID,
		Description: req.Description,
	})

	config.DB.First(&rating)

	json.NewEncoder(w).Encode(rating)
}
