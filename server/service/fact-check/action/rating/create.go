package rating

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

// create - Create rating
// @Summary Create rating
// @Description Create rating
// @Tags Rating
// @ID add-rating
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Rating body rating true "Rating Object"
// @Success 201 {object} model.Rating
// @Failure 400 {array} string
// @Router /fact-check/ratings [post]
func create(w http.ResponseWriter, r *http.Request) {

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

	rating := &service.Rating{}
	err = json.NewDecoder(r.Body).Decode(&rating)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	ratingService := service.GetRatingService()
	result, serviceErr := ratingService.Create(r.Context(), sID, uID, rating)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	// TODO: HANDLE ERROR
	if config.SearchEnabled() {
		_ = insertIntoMeili(result)
	}

	if util.CheckNats() {
		if util.CheckWebhookEvent("rating.created", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("rating.created", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}

func insertIntoMeili(rating model.Rating) error {
	meiliObj := map[string]interface{}{
		"id":                rating.ID,
		"kind":              "rating",
		"name":              rating.Name,
		"background_colour": rating.BackgroundColour,
		"text_colour":       rating.TextColour,
		"slug":              rating.Slug,
		"description":       rating.Description,
		"numeric_value":     rating.NumericValue,
		"space_id":          rating.SpaceID,
	}

	return meilisearchx.AddDocument("dega", meiliObj)
}
