package medium

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
)

// create - Create medium
// @Summary Create medium
// @Description Create medium
// @Tags Medium
// @ID add-medium
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Medium body []medium true "Medium Object"
// @Success 201 {object} []model.Medium
// @Failure 400 {array} string
// @Router /core/media [post]
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

	var mediumList []service.Medium

	err = json.NewDecoder(r.Body).Decode(&mediumList)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	mediumService := service.GetMediumService()
	result, serviceErr := mediumService.Create(r.Context(), sID, uID, mediumList)

	if err != nil {
		errorx.Render(w, serviceErr)
		return
	}

	for i := range result.Nodes {

		// Insert into meili index
		meiliObj := map[string]interface{}{
			"id":          result.Nodes[i].ID.String(),
			"kind":        "medium",
			"name":        result.Nodes[i].Name,
			"slug":        result.Nodes[i].Slug,
			"title":       result.Nodes[i].Title,
			"type":        result.Nodes[i].Type,
			"description": result.Nodes[i].Description,
			"space_id":    result.Nodes[i].SpaceID,
		}

		if config.SearchEnabled() {
			_ = meilisearch.AddDocument("dega", meiliObj)
		}
	}

	result.Total = int64(len(result.Nodes))

	if util.CheckNats() {
		if util.CheckWebhookEvent("media.created", sID.String(), r) {
			if err = util.NC.Publish("media.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}
