package batch

import (
	"encoding/json"
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func add(w http.ResponseWriter, r *http.Request) {
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

	err = algolia.BatchSave(objects)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusCreated, map[string]interface{}{
		"message": "batch of objects added successfully",
	})
}
