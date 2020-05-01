package category

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(categoryID)

	if err != nil {
		return
	}

	req := &model.Category{}

	req.ID = uint(id)

	err = config.DB.Model(&model.Category{}).Preload("Medium").First(&req).Error

	if err != nil {
		return
	}

	fmt.Print(req.ParentID)

	config.DB.Model(&model.Category{}).Where(&model.Category{ParentID: req.ID}).Preload("Medium").Find(&req.Children)

	json.NewEncoder(w).Encode(req)
}
