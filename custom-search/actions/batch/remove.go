package batch

import (
	"net/http"
	"strings"

	"github.com/factly/custom-search/internal/algolia"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

func remove(w http.ResponseWriter, r *http.Request) {
	objectIDs := r.URL.Query().Get("object_ids")

	objects := strings.Split(objectIDs, ",")
	err := algolia.BatchDelete(objects)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "batch of objects deleted successfully",
	})
}
