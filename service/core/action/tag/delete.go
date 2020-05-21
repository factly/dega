package tag

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// delete - Delete tag by id
// @Summary Delete a tag
// @Description Delete tag by ID
// @Tags Tag
// @ID delete-tag-by-id
// @Param X-User header string true "User ID"
// @Param tag_id path string true "Tag ID"
// @Success 200
// @Failure 400 {array} string
// @Router /core/tags/{tag_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	tagID := chi.URLParam(r, "tag_id")
	id, err := strconv.Atoi(tagID)

	result := &model.Tag{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&result).Error

	if err != nil {
		return
	}

	config.DB.Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
