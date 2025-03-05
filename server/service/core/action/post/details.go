package post

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// details - Get post by id
// @Summary Show a post by id
// @Description Get post by ID
// @Tags Post
// @ID get-post-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param post_id path string true "Post ID"
// @Success 200 {object} postData
// @Router /core/posts/{post_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	postID := chi.URLParam(r, "post_id")
	id, err := uuid.Parse(postID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &postData{}
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

	postAuthors := []model.PostAuthor{}
	postClaims := []factCheckModel.PostClaim{}
	result.ID = id

	err = config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Where(&model.Post{
		SpaceID: authCtx.SpaceID,
	}).Where("is_page = ?", false).First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if result.Format.Slug == "fact-check" {
		config.DB.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: id,
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

		result.ClaimOrder = make([]uuid.UUID, len(postClaims))

		// appending all post claims
		for _, postClaim := range postClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
			result.ClaimOrder[int(postClaim.Position-1)] = postClaim.ClaimID
		}
	}

	// fetch all authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: id,
	}).Find(&postAuthors)

	authorIDs := make([]string, 0)

	for _, postAuthor := range postAuthors {
		authorIDs = append(authorIDs, postAuthor.AuthorID)
	}

	// Adding author
	authors, err := util.GetAuthors(r.Header.Get("Authorization"), authCtx.OrganisationID, authorIDs, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
	}
	for _, postAuthor := range postAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)
		if author, found := authors[aID]; found {
			result.Authors = append(result.Authors, author)
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}

func publicDetails(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	postIDOrSlug := chi.URLParam(r, "post_id")
	id, _ := uuid.Parse(postIDOrSlug)

	result := postData{}

	err = config.DB.Model(&model.Post{}).
		Where("status = ? AND de_post.space_id = ?", "publish", authCtx.SpaceID).
		Where("de_post.id = ? OR de_post.slug = ?", id, postIDOrSlug).
		Preload("Categories").
		Preload("Tags").
		Preload("Medium").
		First(&result.Post).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Fetch author IDs for all posts
	postAuthors := make([]model.PostAuthor, 0)

	err = config.DB.
		Where("post_id = ?", result.ID).
		Find(&postAuthors).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	authorIDs := make([]string, 0)
	for _, pa := range postAuthors {
		authorIDs = append(authorIDs, pa.AuthorID)
	}

	// Fetch author details from external service
	authors := make(map[string]model.Author)
	if len(authorIDs) > 0 {
		authors, err = util.GetAuthors("", "", authorIDs, nil)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	// Add authors to post

	for _, authorID := range authorIDs {
		if author, ok := authors[authorID]; ok {
			result.Authors = append(result.Authors, author)
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
