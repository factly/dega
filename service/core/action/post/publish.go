package post

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

type publishData struct {
	PublishedDate time.Time `json:"published_date" validate:"required"`
}

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
// @Param PublishPost body publishData false "PublishPost"
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

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	publish := &publishData{}

	err = json.NewDecoder(r.Body).Decode(&publish)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(publish)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
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

	var totAuthors int
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Count(&totAuthors)

	if totAuthors == 0 {
		loggerx.Error(errors.New("cannot publish post without authors"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	tx := config.DB.Begin()

	err = tx.Model(&result.Post).Set("gorm:association_autoupdate", false).Updates(model.Post{
		Status:        "published",
		PublishedDate: publish.PublishedDate,
	}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post).Error

	postClaims := []factCheckModel.PostClaim{}
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
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
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

	err = meili.UpdateDocument(meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
