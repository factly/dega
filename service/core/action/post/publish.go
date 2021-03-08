package post

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// publish - Publish post by id
// @Summary Publish a post by id
// @Description Publish post by ID
// @Tags Post
// @ID publish-post-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param post_id path string true "Post ID"
// @Success 200 {object} postData
// @Router /core/posts/{post_id}/publish [put]
func publish(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "post_id")
	id, err := strconv.Atoi(postID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := &postData{}
	result.ID = uint(id)

	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
	}).First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var totAuthors int64
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Count(&totAuthors)

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	if totAuthors == 0 {
		author := model.PostAuthor{
			AuthorID: uint(uID),
			PostID:   uint(id),
		}
		tx.Model(&model.PostAuthor{}).Create(&author)
	}

	result.Tags = make([]model.Tag, 0)
	result.Categories = make([]model.Category, 0)

	err = tx.Model(&result.Post).Updates(model.Post{
		Base:          config.Base{UpdatedByID: uint(uID)},
		Status:        "publish",
		PublishedDate: time.Now(),
	}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	postClaims := []factCheckModel.PostClaim{}
	result.Claims = make([]factCheckModel.Claim, 0)
	config.DB.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
		PostID: uint(id),
	}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

	for _, postClaim := range postClaims {
		result.Claims = append(result.Claims, postClaim.Claim)
	}

	// fetch all authors
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	postAuthors := []model.PostAuthor{}
	result.Authors = make([]model.Author, 0)
	tx.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&postAuthors)

	for _, postAuthor := range postAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)
		if author, found := authors[aID]; found {
			result.Authors = append(result.Authors, author)
		}
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":             result.ID,
		"kind":           "post",
		"status":         result.Status,
		"published_date": result.PublishedDate.Unix(),
	}

	err = meilisearchx.UpdateDocument("dega", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("post.published", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
