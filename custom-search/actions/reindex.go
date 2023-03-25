package actions

import (
	"encoding/json"
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func reindex(w http.ResponseWriter, r *http.Request) {
	var objects []map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&objects)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	err = algolia.Reindex(objects)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "index reindexed successfully",
	})
}
