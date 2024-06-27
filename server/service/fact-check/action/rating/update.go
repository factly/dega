package rating

import (
	"encoding/json"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// update - Update rating by id
// @Summary Update a rating by id
// @Description Update rating by ID
// @Tags Rating
// @ID update-rating-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Param Rating body rating false "Rating"
// @Success 200 {object} model.Rating
// @Router /fact-check/ratings/{rating_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

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

	ratingID := chi.URLParam(r, "rating_id")
	id, err := uuid.Parse(ratingID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	ratingService := service.GetRatingService()

	_, err = ratingService.GetById(sID, id)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	rating := &service.Rating{}
	err = json.NewDecoder(r.Body).Decode(&rating)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result, serviceErr := ratingService.Update(sID, id, uID, rating)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	meiliObj := map[string]interface{}{
		"id":                result.ID,
		"kind":              "rating",
		"name":              result.Name,
		"slug":              result.Slug,
		"background_colour": rating.BackgroundColour,
		"text_colour":       rating.TextColour,
		"description":       result.Description,
		"numeric_value":     result.NumericValue,
		"space_id":          result.SpaceID,
	}

	if config.SearchEnabled() {
		_ = meilisearch.UpdateDocument("dega", meiliObj)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("rating.updated", sID.String(), r) {
			if err = util.NC.Publish("rating.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
