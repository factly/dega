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

	config.DB.Model(&category).Updates(model.Category{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		ParentID:    req.ParentID,
		MediumID:    req.MediumID,
	})

	config.DB.First(&category)
	config.DB.Model(&category).Association("Medium").Find(&category.Medium)

	json.NewEncoder(w).Encode(category)
}
