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
	tagID := chi.URLParam(r, "tag_id")
	id, err := strconv.Atoi(tagID)

	if err != nil {
		return
	}

	tag := &tag{}
	json.NewDecoder(r.Body).Decode(&tag)
	result := &model.Tag{}
	result.ID = uint(id)

	config.DB.Model(&result).Updates(model.Tag{
		Name:        tag.Name,
		Slug:        tag.Slug,
		Description: tag.Description,
	})

	config.DB.First(&result)

	json.NewEncoder(w).Encode(result)
}
