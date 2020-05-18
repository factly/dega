package tag

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	tagID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(tagID)

	if err != nil {
		return
	}

	tag := &model.Tag{}

	tag.ID = uint(id)

	err = config.DB.Model(&model.Tag{}).First(&tag).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, tag)
}
