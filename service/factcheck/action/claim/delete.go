package claim

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// delete - Delete claim by id
func delete(w http.ResponseWriter, r *http.Request) {

	claimID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(claimID)

	result := &model.Claim{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&result).Error

	if err != nil {
		return
	}

	config.DB.Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
