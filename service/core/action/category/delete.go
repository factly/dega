package category

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete category by id
// @Summary Delete a category
// @Description Delete category by ID
// @Tags Category
// @ID delete-category-by-id
// @Param X-User header string true "User ID"
// @Param category_id path string true "Category ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Failure 400 {array} string
// @Router /core/categories/{category_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	categoryID := chi.URLParam(r, "category_id")
	id, err := strconv.Atoi(categoryID)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := &model.Category{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Category{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	err = config.DB.Where(&model.PostCategory{
		CategoryID: uint(id),
	}).First(&model.PostCategory{}).Error

	if err == nil {
		errorx.Render(w, errorx.Parser(util.CannotDeleteError()))
		return
	}

	tx := config.DB.Begin()
	// Updates all children categories
	err = tx.Model(model.Category{}).Where(&model.Category{
		SpaceID:  uint(sID),
		ParentID: result.ID,
	}).Updates(map[string]interface{}{"parent_id": nil}).Error

	if err != nil {
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = tx.Delete(&result).Error
	if err != nil {
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
