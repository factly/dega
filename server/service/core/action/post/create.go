package post

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

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
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// create - Create post
// @Summary Create post
// @Description Create post
// @Tags Post
// @ID add-post
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Post body post true "Post Object"
// @Success 201 {object} postData
// @Router /core/posts [post]
func create(w http.ResponseWriter, r *http.Request) {

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole := authCtx.OrgRole

	post := post{}

	err = json.NewDecoder(r.Body).Decode(&post)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(post)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var status string = "draft"

	if post.Status == "publish" {

		if len(post.AuthorIDs) == 0 {
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot publish post without author", http.StatusUnprocessableEntity)))
			return
		}

		isAllowed, e := util.CheckSpaceEntityPermission(authCtx.SpaceID, authCtx.UserID, "posts", "publish", orgRole)
		if !isAllowed {

			errorx.Render(w, errorx.Parser(e))
			return
		}

		if isAllowed {
			status = "publish"
		}
	}

	if post.Status == "ready" {
		status = "ready"
	}

	if post.Status == "future" {
		status = "future"
	}

	post.SpaceID = authCtx.SpaceID

	result, errMessage := createPost(r.Context(), post, status, r)

	if errMessage.Code != 0 {
		errorx.Render(w, errorx.Parser(errMessage))
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}

func createPost(ctx context.Context, post post, status string, r *http.Request) (*postData, errorx.Message) {
	result := &postData{}
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.Unauthorized()
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Post{})
	tableName := stmt.Schema.Table

	var postSlug string
	if post.Slug != "" && util.CheckSlug(post.Slug) {
		postSlug = post.Slug
	} else {
		postSlug = util.MakeSlug(post.Title)
	}

	featuredMediumID := &post.FeaturedMediumID

	if post.FeaturedMediumID == uuid.Nil {
		featuredMediumID = nil
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(post.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(post.Description)
		if err != nil {
			loggerx.Error(err)
			return nil, errorx.GetMessage("could not get html description", 422)
		}

		jsonDescription, err = util.GetJSONDescription(post.Description)
		if err != nil {
			loggerx.Error(err)
			return nil, errorx.GetMessage("could not get json description", 422)
		}
	}

	result.Post = model.Post{
		Base: config.Base{
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
		},
		Title:            post.Title,
		Slug:             util.ApproveSlug(postSlug, authCtx.SpaceID, tableName),
		Status:           status,
		IsPage:           post.IsPage,
		Subtitle:         post.Subtitle,
		Excerpt:          post.Excerpt,
		Description:      jsonDescription,
		DescriptionHTML:  descriptionHTML,
		IsHighlighted:    post.IsHighlighted,
		IsSticky:         post.IsSticky,
		FeaturedMediumID: featuredMediumID,
		FormatID:         post.FormatID,
		Meta:             post.Meta,
		HeaderCode:       post.HeaderCode,
		FooterCode:       post.FooterCode,
		MetaFields:       post.MetaFields,
		SpaceID:          authCtx.SpaceID,
		DescriptionAMP:   post.DescriptionAMP,
		MigratedHTML:     post.MigratedHTML,
		Language:         post.Language,
		CustomFormat:     post.CustomFormat,
	}

	if post.MigrationID != nil {
		result.Post.MigrationID = *post.MigrationID
	}

	if status == "publish" {
		if post.PublishedDate == nil {
			currTime := time.Now()
			result.Post.PublishedDate = &currTime
		} else {
			result.Post.PublishedDate = post.PublishedDate
		}
	} else {
		result.Post.PublishedDate = nil
	}

	if len(post.TagIDs) > 0 {
		config.DB.Model(&model.Tag{}).Where(post.TagIDs).Find(&result.Post.Tags)
	}
	if len(post.CategoryIDs) > 0 {
		config.DB.Model(&model.Category{}).Where(post.CategoryIDs).Find(&result.Post.Categories)
	}

	tx := config.DB.WithContext(context.WithValue(ctx, config.UserContext, authCtx.UserID)).Begin()

	err = tx.Model(&model.Post{}).Create(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return nil, errorx.DBError()
	}
	tx.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post)

	if result.Format.Slug == "fact-check" {
		// create post claim
		for i, id := range post.ClaimIDs {
			postClaim := &factCheckModel.PostClaim{}
			postClaim.ClaimID = id
			postClaim.PostID = result.ID
			postClaim.Position = i + 1

			err = tx.Model(&factCheckModel.PostClaim{}).Create(&postClaim).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				return nil, errorx.DBError()
			}
		}

		// fetch all post claims
		postClaims := []factCheckModel.PostClaim{}
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: result.ID,
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

		result.ClaimOrder = make([]uuid.UUID, len(postClaims))
		// appending all post claims
		for _, postClaim := range postClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
			result.ClaimOrder[int(postClaim.Position-1)] = postClaim.ClaimID
		}
	}

	authors, err := util.GetAuthors(r.Header.Get("Authorization"), authCtx.OrganisationID, post.AuthorIDs)
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.InternalServerError()
	}

	for _, id := range post.AuthorIDs {
		aID := fmt.Sprint(id)
		if _, found := authors[aID]; found && id != "" {
			author := model.PostAuthor{
				AuthorID: id,
				PostID:   result.Post.ID,
			}
			err := tx.Model(&model.PostAuthor{}).Create(&author).Error
			if err == nil {
				result.Authors = append(result.Authors, authors[aID])
			}
		}
	}

	space := model.Space{}

	ratings := make([]factCheckModel.Rating, 0)
	config.DB.Model(&factCheckModel.Rating{}).Where(factCheckModel.Rating{
		SpaceID: authCtx.SpaceID,
	}).Order("numeric_value asc").Find(&ratings)

	postData := PostData{
		Post: Post{
			Title:         result.Post.Title,
			Slug:          result.Post.Slug,
			PublishedDate: result.Post.PublishedDate,
			CreatedAt:     result.Post.CreatedAt,
		},
	}

	schemaAuthors := make([]PostAuthor, 0)
	for _, author := range result.Authors {
		schemaAuthor := PostAuthor{
			ID:          author.ID,
			DisplayName: author.DisplayName,
		}

		schemaAuthors = append(schemaAuthors, schemaAuthor)
	}

	postData.Authors = schemaAuthors

	schemaClaims := make([]Claim, 0)
	for _, claim := range result.Claims {
		schemaClaim := Claim{
			Claim:       claim.Claim,
			Slug:        claim.Slug,
			CheckedDate: claim.CheckedDate,
			Claimant:    claim.Claimant,
			Fact:        claim.Fact,
			Rating:      claim.Rating,
		}

		schemaClaims = append(schemaClaims, schemaClaim)
	}

	schemas := GetSchemas(postData, space)

	byteArr, err := json.Marshal(schemas)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return nil, errorx.InternalServerError()
	}
	tx.Model(&result.Post).Select("Schemas").Updates(&model.Post{
		Schemas: postgres.Jsonb{RawMessage: byteArr},
	})

	result.Post.Schemas = postgres.Jsonb{RawMessage: byteArr}

	// Insert into meili index
	var meiliPublishDate int64
	if result.Post.Status == "publish" {
		meiliPublishDate = result.Post.PublishedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             result.ID.String(),
		"title":          result.Title,
		"subtitle":       result.Subtitle,
		"slug":           result.Slug,
		"status":         result.Status,
		"excerpt":        result.Excerpt,
		"description":    result.Description,
		"is_featured":    result.IsFeatured,
		"is_sticky":      result.IsSticky,
		"is_highlighted": result.IsHighlighted,
		"is_page":        result.IsPage,
		"format_id":      result.FormatID,
		"published_date": meiliPublishDate,
		"space_id":       result.SpaceID,
		"tag_ids":        post.TagIDs,
		"category_ids":   post.CategoryIDs,
		"author_ids":     post.AuthorIDs,
		"language":       result.Language,
	}

	if result.Format.Slug == "fact-check" {
		meiliObj["claim_ids"] = post.ClaimIDs
	}

	if config.SearchEnabled() {
		_ = meilisearch.AddDocument(meiliIndex, meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("post.created", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("post.created", result); err != nil {
				return nil, errorx.GetMessage("not able to publish event", http.StatusInternalServerError)
			}

		}

		if result.Post.Status == "publish" {
			if util.CheckWebhookEvent("post.published", authCtx.SpaceID.String(), r) {
				if err = util.NC.Publish("post.published", result); err != nil {
					return nil, errorx.GetMessage("not able to publish event", http.StatusInternalServerError)
				}
			}

		}
	}

	return result, errorx.Message{}
}
