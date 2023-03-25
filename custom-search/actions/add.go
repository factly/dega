package actions

import (
	"encoding/json"
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func add(w http.ResponseWriter, r *http.Request) {
	var requestBody map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	requestBody["objectID"] = requestBody["object_id"]
	delete(requestBody, "object_id")
	if err = algolia.Save(requestBody); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusCreated, map[string]interface{}{
		"message": "object added successfully",
	})
}
