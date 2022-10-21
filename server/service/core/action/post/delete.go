package post

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factcheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	searchService "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
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

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	postID := chi.URLParam(r, "post_id")
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
	}).Where("is_page", false).Preload("Tags").Preload("Categories").First(&result).Error

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

	tx.Model(&factcheckModel.PostClaim{}).Where(&factcheckModel.PostClaim{
		PostID: uint(id),
	}).Delete(&factcheckModel.PostClaim{})

	tx.Model(&model.Post{}).Delete(&result)

	if config.SearchEnabled() {
		err = searchService.GetSearchService().Delete("post", result.ID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("post.deleted", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("post.deleted", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	renderx.JSON(w, http.StatusOK, nil)
}
