package rating

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/service/fact-check/service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
)

// DataFile default json data file
var DataFile = "./data/ratings.json"

// createDefaults - Create Default Ratings
// @Summary Create Default Ratings
// @Description Create Default Ratings
// @Tags Rating
// @ID add-default-ratings
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 201 {object} paging
// @Failure 400 {array} string
// @Router /fact-check/ratings/default [post]
func createDefaults(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	jsonFile, err := os.Open(DataFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer jsonFile.Close()

	ratings := make([]model.Rating, 0)

	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &ratings)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	ratingService := service.GetRatingService()
	result, serviceErr := ratingService.Default(r.Context(), sID, uID, ratings)
	if serviceErr != nil {
		errorx.Render(w, serviceErr)
		return
	}

	if config.SearchEnabled() {
		for i := range result.Nodes {
			_ = insertIntoMeili(ratings[i])
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}
