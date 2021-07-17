package space

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get space by id
// @Summary Show a space by id
// @Description Get space by ID
// @Tags Space
// @ID get-space-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param space_id path string true "Space ID"
// @Success 200 {object} model.Space
// @Router /core/spaces/{space_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	spaceID := chi.URLParam(r, "space_id")
	id, err := strconv.Atoi(spaceID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Space{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Space{}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
