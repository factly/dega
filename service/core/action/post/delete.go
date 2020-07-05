package post

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete post by id
// @Summary Delete a post
// @Description Delete post by ID
// @Tags Post
// @ID delete-post-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param post_id path string true "Post ID"
// @Success 200
// @Router /core/posts/{post_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Render(w, errors.Parser(errors.InternalServerError()), 500)
		return
	}

	postID := chi.URLParam(r, "post_id")
	id, err := strconv.Atoi(postID)

	if err != nil {
		errors.Render(w, errors.Parser(errors.InvalidID()), 404)
		return
	}

	result := &model.Post{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Render(w, errors.Parser(errors.RecordNotFound()), 404)
		return
	}

	// delete all tags related to post
	config.DB.Where(&model.PostTag{
		PostID: uint(id),
	}).Delete(model.PostTag{})

	// delete all categories related to post
	config.DB.Where(&model.PostCategory{
		PostID: uint(id),
	}).Delete(model.PostCategory{})

	config.DB.Model(&model.Post{}).Delete(&result)

	renderx.JSON(w, http.StatusOK, nil)
}
