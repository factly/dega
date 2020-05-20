package tag

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

func list(w http.ResponseWriter, r *http.Request) {

	data := []model.Tag{}

	config.DB.Model(&model.Tag{}).Find(&data)

	render.JSON(w, http.StatusOK, data)
}
