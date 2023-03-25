package actions

import (
	"net/http"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func remove(w http.ResponseWriter, r *http.Request) {
	objectID := r.URL.Query().Get("object_id")

	err := algolia.Delete(objectID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "successfully deleted the object",
	})
}
