package search

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	meilisearch "github.com/meilisearch/meilisearch-go"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// search - Search Entities
// @Summary Global search for all entities
// @Description Global search for all entities
// @Tags Search
// @ID search-entities
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Search body searchQuery false "Search"
// @Success 200
// @Router /core/search [post]
func list(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	searchQuery := &searchQuery{}
	err = json.NewDecoder(r.Body).Decode(&searchQuery)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(searchQuery)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	filters := []string{}
	filters = append(filters, fmt.Sprint("space_id=", authCtx.SpaceID))

	result, err := config.MeilisearchClient.MultiSearch(&meilisearch.MultiSearchRequest{
		Queries: []meilisearch.SearchRequest{
			{
				Filter: filters,
				Query:  searchQuery.Query,
			},
		},
	})

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result.Results[0].Hits)
}
