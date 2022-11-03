package batch

import (
	"encoding/json"
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func update(w http.ResponseWriter, r *http.Request) {
	var objects []map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&objects)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	for index := range objects {
		objects[index]["objectID"] = objects[index]["object_id"]
		delete(objects[index], "object_id")
	}

	err = algolia.BatchUpdate(objects)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "batch of objects updated successfully",
	})
}
