package category

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(categoryID)

	if err != nil {
		return
	}

	req := &model.Category{}
	json.NewDecoder(r.Body).Decode(&req)

	category := &model.Category{}
	category.ID = uint(id)

	config.DB.Model(&model.Category{}).Updates(model.Category{
		Title: req.Title,
		Slug:  req.Slug,
	})

	config.DB.First(&category)

	json.NewEncoder(w).Encode(category)
}
