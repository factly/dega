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

// delete - Delete space
// @Summary Delete space
// @Description Delete space
// @Tags Space
// @ID delete-space
// @Consume json
// @Produce json
// @Param org_id header string true "Organisation ID"
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Success 200
// @Router /core/spaces/{space_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Space{}

	result.ID = sID

	// check record exists or not
	err = config.DB.First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("space.deleted", result.ID.String(), r) {
			if err = util.NC.Publish("space.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
