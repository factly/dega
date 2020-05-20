package tag

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

// update - Update tag by id
// @Summary Update a tag by id
// @Description Update tag by ID
// @Tags Tag
// @ID update-tag-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param tag_id path string true "Tag ID"
// @Param Tag body tag false "Tag"
// @Success 200 {object} model.Tag
// @Router /core/tags/{tag_id} [put]
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
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
	})

	config.DB.First(&tag)

	json.NewEncoder(w).Encode(tag)
}
