package podcast

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/podcast/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// create - Create podcast
// @Summary Create podcast
// @Description Create podcast
// @Tags Podcast
// @ID add-podcast
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Podcast body podcast true "Podcast Object"
// @Success 201 {object} model.Podcast
// @Failure 400 {array} string
// @Router /podcast [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
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

	podcast := &service.Podcast{}

	err = json.NewDecoder(r.Body).Decode(&podcast)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	podcastService := service.GetPodcastService()
	result, serviceErr := podcastService.Create(r.Context(), sID, uID, podcast)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}
	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":                  result.ID.String(),
		"kind":                "podcast",
		"title":               result.Title,
		"slug":                result.Slug,
		"description":         result.Description,
		"language":            result.Language,
		"category_ids":        podcast.CategoryIDs,
		"space_id":            result.SpaceID,
		"primary_category_id": result.PrimaryCategoryID,
		"medium_id":           result.MediumID,
	}

	if config.SearchEnabled() {
		_ = meilisearch.AddDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("podcast.created", sID.String(), r) {
			if err = util.NC.Publish("podcast.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}
	renderx.JSON(w, http.StatusCreated, result)
}
