package tag

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// details - Get tag by id
// @Summary Show a tag by id
// @Description Get tag by ID
// @Tags Tag
// @ID get-tag-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param tag_id path string true "Tag ID"
// @Success 200 {object} model.Tag
// @Router /core/tags/{tag_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	tagID := chi.URLParam(r, "tag_id")
	id, err := strconv.Atoi(tagID)

	if err != nil {
		return
	}

	result := &model.Tag{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Tag{}).First(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
