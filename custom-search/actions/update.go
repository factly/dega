package actions

import (
	"encoding/json"
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func update(w http.ResponseWriter, r *http.Request) {
	requestBody := make(map[string]interface{})
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	requestBody["objectID"] = requestBody["object_id"]
	delete(requestBody, "object_id")

	if err = algolia.Update(requestBody); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "object updated successfully",
	})
}
