package page

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete page by id
// @Summary Delete a page
// @Description Delete page by ID
// @Tags Page
// @ID delete-page-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param page_id path string true "Page ID"
// @Success 200
// @Router /core/pages/{page_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	postID := chi.URLParam(r, "page_id")
	id, err := strconv.Atoi(postID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Post{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
		IsPage:  true,
	}).Preload("Tags").Preload("Categories").First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := config.DB.Begin()

	// delete all associations
	if len(result.Tags) > 0 {
		_ = tx.Model(&result).Association("Tags").Delete(result.Tags)
	}
	if len(result.Categories) > 0 {
		_ = tx.Model(&result).Association("Categories").Delete(result.Categories)
	}

	tx.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Delete(&model.PostAuthor{})

	tx.Model(&model.Post{}).Delete(&result)

	_ = meilisearchx.DeleteDocument("dega", result.ID, "page")

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("page.deleted", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
