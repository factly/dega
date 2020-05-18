package tag

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {
	tagID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(tagID)

	if err != nil {
		return
	}

	req := &model.Tag{}
	json.NewDecoder(r.Body).Decode(&req)
	tag := &model.Tag{}
	tag.ID = uint(id)

	config.DB.Model(&tag).Updates(model.Tag{
		Name:           req.Name,
		Slug:           req.Slug,
		Description:    req.Description,
		ProfileImageID: req.ProfileImageID,
		SpaceID:        req.SpaceID,
	})

	config.DB.First(&tag)

	json.NewEncoder(w).Encode(tag)
}
