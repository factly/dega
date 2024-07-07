package post

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/google/uuid"
)

type templateData struct {
	PostID uuid.UUID `json:"post_id" validate:"required"`
}

// create - create template
// @Summary create template
// @Description Create template
// @Tags Post
// @ID create-template
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param TemplateData body templateData false "TemplateData"
// @Success 200 {object} model.Post
// @Router /core/posts/templates [post]
func createTemplate(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	templateReq := &templateData{}

	err = json.NewDecoder(r.Body).Decode(&templateReq)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(templateReq)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := postData{}
	result.Post.ID = templateReq.PostID

	// check of post exist
	err = config.DB.Where(&model.Post{
		SpaceID: authCtx.SpaceID,
	}).Preload("Tags").Preload("Categories").First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	template := postData{}
	template.Post = result.Post

	template.Post.Status = "template"
	template.Post.PublishedDate = nil
	template.Post.Base = config.Base{}
	postClaims := make([]factCheckModel.PostClaim, 0)

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, authCtx.UserID)).Begin()
	err = tx.Model(&model.Post{}).Create(&template.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&template.Post)

	if template.Post.Format.Slug == "fact-check" {

		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: templateReq.PostID,
		}).Find(&postClaims)

		// create post claim
		for _, claim := range postClaims {
			postClaim := &factCheckModel.PostClaim{}
			postClaim.ClaimID = claim.ClaimID
			postClaim.PostID = template.Post.ID
			// postClaim.Position = uint(i + 1)

			err = tx.Model(&factCheckModel.PostClaim{}).Create(&postClaim).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				return
			}
		}

		// fetch all post claims
		postClaims := []factCheckModel.PostClaim{}
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: template.Post.ID,
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

		template.ClaimOrder = make([]uuid.UUID, len(postClaims))
		// appending all post claims
		for _, postClaim := range postClaims {
			template.Claims = append(template.Claims, postClaim.Claim)
			// template.ClaimOrder[int(postClaim.Position-1)] = postClaim.ClaimID
		}
	}

	tagIDs := make([]uuid.UUID, 0)
	categoryIDs := make([]uuid.UUID, 0)

	for _, tag := range template.Tags {
		tagIDs = append(tagIDs, tag.ID)
	}

	for _, category := range template.Categories {
		categoryIDs = append(categoryIDs, category.ID)
	}

	var meiliPublishDate int64
	if template.PublishedDate != nil {
		meiliPublishDate = template.PublishedDate.Unix()
	}
	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":             template.ID.String(),
		"kind":           "post",
		"title":          template.Title,
		"subtitle":       template.Subtitle,
		"slug":           template.Slug,
		"status":         template.Status,
		"excerpt":        template.Excerpt,
		"description":    template.Description,
		"is_featured":    template.IsFeatured,
		"is_sticky":      template.IsSticky,
		"is_highlighted": template.IsHighlighted,
		"format_id":      template.FormatID,
		"published_date": meiliPublishDate,
		"space_id":       template.SpaceID,
		"tag_ids":        tagIDs,
		"category_ids":   categoryIDs,
	}

	if config.SearchEnabled() {
		_ = meilisearch.AddDocument("dega", meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("post.template.created", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("post.template.created", template); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, template)
}
