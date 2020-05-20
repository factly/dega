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
func delete(w http.ResponseWriter, r *http.Request) {

	tagID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(tagID)

	tag := &model.Tag{}

	tag.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&tag).Error

	if err != nil {
		return
	}

	config.DB.Delete(&tag)

	render.JSON(w, http.StatusOK, nil)
}
