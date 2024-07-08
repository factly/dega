package format

import (
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// delete - Delete format by id
// @Summary Delete a format
// @Description Delete format by ID
// @Tags Format
// @ID delete-format-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param format_id path string true "Format ID"
// @Success 200
// @Router /core/formats/{format_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	formatID := chi.URLParam(r, "format_id")
	id, err := uuid.Parse(formatID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Format{}

	result.ID = id

	// check record exists or not
	err = config.DB.Where(&model.Format{
		SpaceID: authCtx.SpaceID,
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check if format is associated with posts
	var totAssociated int64
	config.DB.Model(&model.Post{}).Where(&model.Post{
		FormatID: id,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("format is associated with post"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("format", "post")))
		return
	}

	tx := config.DB.Begin()
	tx.Delete(&result)

	if config.SearchEnabled() {
		_ = meilisearch.DeleteDocument(meiliIndex, result.ID.String())
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("format.deleted", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("format.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, nil)
}
