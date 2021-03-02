package tag

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete tag by id
// @Summary Delete a tag
// @Description Delete tag by ID
// @Tags Tag
// @ID delete-tag-by-id
// @Param X-User header string true "User ID"
// @Param tag_id path string true "Tag ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Failure 400 {array} string
// @Router  /core/tags/{tag_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	tagID := chi.URLParam(r, "tag_id")
	id, err := strconv.Atoi(tagID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := &model.Tag{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Tag{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check if tag is associated with posts
	tag := new(model.Tag)
	tag.ID = uint(id)
	totAssociated := config.DB.Model(tag).Association("Posts").Count()

	if totAssociated != 0 {
		loggerx.Error(errors.New("tag is associated with post"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("tag", "post")))
		return
	}

	tx := config.DB.Begin()
	tx.Delete(&result)

	err = meilisearchx.DeleteDocument("dega", result.ID, "tag")
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
