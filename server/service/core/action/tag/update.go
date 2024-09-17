package tag

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// update - Update tag by id
// @Summary Update a tag by id
// @Description Update tag by ID
// @Tags Tag
// @ID update-tag-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param tag_id path string true "Tag ID"
// @Param X-Space header string true "Space ID"
// @Param Tag body tag false "Tag"
// @Success 200 {object} model.Tag
// @Router /core/tags/{tag_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	tagID := chi.URLParam(r, "tag_id")
	id, err := uuid.Parse(tagID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	tagService := service.GetTagService()

	// check record exists or not
	t, err := tagService.GetById(authCtx.SpaceID, id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tag := &service.Tag{}
	err = json.NewDecoder(r.Body).Decode(&tag)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result, serviceErr := tagService.Update(authCtx.SpaceID, id, authCtx.UserID, t, tag)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":                result.ID,
		"name":              result.Name,
		"slug":              result.Slug,
		"description":       result.Description,
		"background_colour": result.BackgroundColour,
		"space_id":          result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearch.UpdateDocument(meiliIndex, meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("tag.updated", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("tag.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
