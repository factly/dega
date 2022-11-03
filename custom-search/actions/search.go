package actions

import (
	"encoding/json"
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type searchOptions struct {
	Query   string `json:"query"`
	Limit   int    `json:"limit"`
	Offset  int    `json:"offset"`
	Filters string `json:"filters"`
}

func search(w http.ResponseWriter, r *http.Request) {
	reqBody := new(searchOptions)
	err := json.NewDecoder(r.Body).Decode(reqBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	if reqBody.Limit == 0 {
		reqBody.Limit = 20
	}

	if reqBody.Limit > 1000 {
		reqBody.Limit = 1000
	}

	searchResults, err := algolia.Search(reqBody.Query, reqBody.Limit, reqBody.Offset, reqBody.Filters)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	for index := range searchResults {
		searchResults[index]["object_id"] = searchResults[index]["objectID"]
		delete(searchResults[index], "objectID")
	}

	renderx.JSON(w, http.StatusOK, searchResults)
}
