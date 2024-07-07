package space

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
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
func Details(w http.ResponseWriter, r *http.Request) {
	spaceID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := model.Space{}
	err = config.DB.Model(&model.Space{}).Where(&model.Space{
		Base: config.Base{
			ID: spaceID,
		},
	}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
