package medium

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// update - Update medium by id
// @Summary Update a medium by id
// @Description Update medium by ID
// @Tags Medium
// @ID update-medium-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param X-Space header string true "Space ID"
// @Param Medium body medium false "Medium"
// @Success 200 {object} model.Medium
// @Router /core/media/{medium_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	mediumID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(mediumID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	medium := &service.Medium{}
	err = json.NewDecoder(r.Body).Decode(&medium)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	mediumService := service.GetMediumService()
	_, err = mediumService.GetById(sID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	result, serviceErr := mediumService.Update(sID, uID, id, medium)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "medium",
		"name":        result.Name,
		"slug":        result.Slug,
		"title":       result.Title,
		"type":        result.Type,
		"description": result.Description,
		"space_id":    result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("media.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("media.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
