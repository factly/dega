package medium

import (
	"net/http"

	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// delete - Delete medium by id
// @Summary Delete a medium
// @Description Delete medium by ID
// @Tags Medium
// @ID delete-medium-by-id
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Router /core/media/{medium_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	mediumID := chi.URLParam(r, "medium_id")
	id, err := uuid.Parse(mediumID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	mediumService := service.GetMediumService()
	result, err := mediumService.GetById(sID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	serviceErr := mediumService.Delete(id, sID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, serviceErr)
		return
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("media.deleted", sID.String(), r) {
			if err = util.NC.Publish("media.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, nil)
}
