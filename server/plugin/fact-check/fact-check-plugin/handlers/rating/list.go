package rating

import (
	"log"
	"net/http"
	"net/url"

	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/db"
	"github.com/factly/dega-server/plugin/fact-check/shared"
	"github.com/factly/dega-server/plugin/fact-check/shared/model"
	"github.com/factly/x/paginationx"
)

// list - Get all ratings
// @Summary Show all ratings
// @Description Get all ratings
// @Tags Rating
// @ID get-all-ratings
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Param all query string false "all"
// @Success 200 {object} paging
// @Router /fact-check/ratings [get]
func List(r shared.Request) (shared.Any, *shared.Error) {
	log.Println("REQUEST: ", r)
	result := model.RatingPaging{}
	result.Nodes = make([]model.Rating, 0)

	reqUrl, err := url.Parse(r.URL)
	if err != nil {
		log.Println(err)
		return nil, &shared.Error{Code: http.StatusInternalServerError, Message: "cannot parse url"}
	}

	all := reqUrl.Query().Get("all")
	offset, limit := paginationx.Parse(reqUrl.Query())

	stmt := db.DB.Model(&model.Rating{}).Preload("Medium").Where(&model.Rating{
		SpaceID: uint(r.Space),
	}).Count(&result.Total).Order("id desc")

	if all == "true" {
		err = stmt.Find(&result.Nodes).Error
	} else {
		err = stmt.Offset(offset).Limit(limit).Find(&result.Nodes).Error
	}

	if err != nil {
		log.Println(err)
		return nil, &shared.Error{Code: http.StatusInternalServerError, Message: "cannot fetch ratings"}
	}

	return result, nil
}
