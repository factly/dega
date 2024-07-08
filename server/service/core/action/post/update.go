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
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/dega-server/util/meilisearch"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// update - Update post by id
// @Summary Update a post by id
// @Description Update post by ID
// @Tags Post
// @ID update-post-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param post_id path string true "Post ID"
// @Param Post body post false "Post"
// @Success 200 {object} postData
// @Router /core/posts/{post_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	postID := chi.URLParam(r, "post_id")
	id, err := uuid.Parse(postID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgRole := authCtx.OrgRole

	post := &post{}
	postAuthors := []model.PostAuthor{}
	postClaims := []factCheckModel.PostClaim{}

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

	result := &postData{}
	result.ID = id
	result.Tags = make([]model.Tag, 0)
	result.Categories = make([]model.Category, 0)
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

	// fetch all authors
	authors, err := util.GetAuthors(authCtx.OrganisationID, post.AuthorIDs)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// check record exists or not
	err = config.DB.Where(&model.Post{
		Base: config.Base{
			ID: id,
		},
		SpaceID: authCtx.SpaceID,
	}).Where("is_page = ?", false).First(&result.Post).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	post.SpaceID = result.SpaceID

	var postSlug string
	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Post{})
	tableName := stmt.Schema.Table

	if result.Slug == post.Slug {
		postSlug = result.Slug
	} else if post.Slug != "" && util.CheckSlug(post.Slug) {
		postSlug = util.ApproveSlug(post.Slug, authCtx.SpaceID, tableName)
	} else {
		postSlug = util.ApproveSlug(util.MakeSlug(post.Title), authCtx.SpaceID, tableName)
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(post.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(post.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(post.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, authCtx.UserID)).Begin()

	newTags := make([]model.Tag, 0)
	if len(post.TagIDs) > 0 {
		config.DB.Model(&model.Tag{}).Where(post.TagIDs).Find(&newTags)
		if err = tx.Model(&result.Post).Association("Tags").Replace(&newTags); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = config.DB.Model(&result.Post).Association("Tags").Clear()
	}

	newCategories := make([]model.Category, 0)
	if len(post.CategoryIDs) > 0 {
		config.DB.Model(&model.Category{}).Where(post.CategoryIDs).Find(&newCategories)
		if err = tx.Model(&result.Post).Association("Categories").Replace(&newCategories); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = config.DB.Model(&result.Post).Association("Categories").Clear()
	}

	updateMap := map[string]interface{}{
		"created_at":         post.CreatedAt,
		"updated_at":         post.UpdatedAt,
		"updated_by_id":      authCtx.UserID,
		"title":              post.Title,
		"slug":               postSlug,
		"subtitle":           post.Subtitle,
		"excerpt":            post.Excerpt,
		"description":        jsonDescription,
		"description_html":   descriptionHTML,
		"is_highlighted":     post.IsHighlighted,
		"is_sticky":          post.IsSticky,
		"is_featured":        post.IsFeatured,
		"format_id":          post.FormatID,
		"featured_medium_id": post.FeaturedMediumID,
		"meta":               post.Meta,
		"header_code":        post.HeaderCode,
		"footer_code":        post.FooterCode,
		"meta_fields":        post.MetaFields,
		"description_amp":    post.DescriptionAMP,
		"migrated_html":      post.MigratedHTML,
		"language":           post.Language,
	}

	if post.MigrationID != nil {
		updateMap["migration_id"] = *post.MigrationID
	}

	result.Post.FeaturedMediumID = &post.FeaturedMediumID
	if post.FeaturedMediumID == uuid.Nil {
		updateMap["featured_medium_id"] = nil
	}

	if post.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if post.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	oldStatus := result.Post.Status
	// Check if post status is changed back to draft or ready from published
	if oldStatus == "publish" && (post.Status == "draft" || post.Status == "ready") {
		isAllowed, e := util.CheckSpaceEntityPermission(authCtx.SpaceID, authCtx.UserID, "posts", "publish", orgRole)
		if !isAllowed {
			tx.Rollback()
			errorx.Render(w, errorx.Parser(e))
			return
		}

		updateMap["status"] = post.Status
		updateMap["published_date"] = nil

	} else if post.Status == "publish" {
		// Check if authors are not added while publishing post
		if len(post.AuthorIDs) == 0 {
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot publish post without author", http.StatusUnprocessableEntity)))
			return
		}

		isAllowed, e := util.CheckSpaceEntityPermission(authCtx.SpaceID, authCtx.UserID, "posts", "publish", orgRole)
		if !isAllowed {
			tx.Rollback()
			errorx.Render(w, errorx.Parser(e))
			return
		}
	} else if post.Status == "ready" {
		updateMap["status"] = "ready"
	} else if oldStatus == "ready" && post.Status == "draft" {
		updateMap["status"] = "draft"
	}

	err = tx.Model(&result.Post).Updates(&updateMap).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var toCreateIDs []string
	var toDeleteIDs []string

	if result.Post.Format.Slug == "fact-check" {
		// fetch existing post claims
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: id,
		}).Find(&postClaims)

		if len(postClaims) > 0 {
			err = tx.Model(&factCheckModel.PostClaim{}).Delete(&postClaims).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}

		toCreatePostClaims := make([]factCheckModel.PostClaim, 0)
		for i, id := range post.ClaimIDs {
			postClaim := factCheckModel.PostClaim{}
			postClaim.ClaimID = id
			postClaim.PostID = result.ID
			postClaim.Position = i + 1
			toCreatePostClaims = append(toCreatePostClaims, postClaim)
		}

		if len(toCreatePostClaims) > 0 {
			err = tx.Model(&factCheckModel.PostClaim{}).Create(&toCreatePostClaims).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}

		// fetch updated post claims
		updatedPostClaims := []factCheckModel.PostClaim{}
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: id,
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&updatedPostClaims)

		result.ClaimOrder = make([]uuid.UUID, len(updatedPostClaims))
		// appending previous post claims to result
		for _, postClaim := range updatedPostClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
			result.ClaimOrder[int(postClaim.Position-1)] = postClaim.ClaimID
		}

	}

	// fetch existing post authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: id,
	}).Find(&postAuthors)

	prevAuthorIDs := make([]string, 0)
	mapperPostAuthor := map[string]model.PostAuthor{}
	postAuthorIDs := make([]string, 0)

	for _, postAuthor := range postAuthors {
		mapperPostAuthor[postAuthor.AuthorID] = postAuthor
		prevAuthorIDs = append(prevAuthorIDs, postAuthor.AuthorID)
	}

	toCreateIDs, toDeleteIDs = arrays.Difference(prevAuthorIDs, post.AuthorIDs)

	// map post author ids
	for _, id := range toDeleteIDs {
		postAuthorIDs = append(postAuthorIDs, mapperPostAuthor[id].ID.String())
	}

	// delete post authors
	if len(postAuthorIDs) > 0 {
		err = tx.Where(&postAuthorIDs).Delete(&model.PostAuthor{}).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// creating new post authors
	for _, id := range toCreateIDs {
		if id != "" {
			postAuthor := &model.PostAuthor{}
			postAuthor.AuthorID = id
			postAuthor.PostID = result.ID

			err = tx.Model(&model.PostAuthor{}).Create(&postAuthor).Error

			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}
	}

	// fetch existing post authors
	updatedPostAuthors := []model.PostAuthor{}
	tx.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: id,
	}).Find(&updatedPostAuthors)

	// appending previous post authors to result
	for _, postAuthor := range updatedPostAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)

		if author, found := authors[aID]; found {
			result.Authors = append(result.Authors, author)
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
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	tx.Model(&result.Post).Select("Schemas").Updates(&model.Post{
		Schemas: postgres.Jsonb{RawMessage: byteArr},
	})

	result.Post.Schemas = postgres.Jsonb{RawMessage: byteArr}

	// Update into meili index
	var meiliPublishDate int64
	if result.Post.Status == "publish" {
		meiliPublishDate = result.Post.PublishedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             result.ID,
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
		_ = meilisearch.UpdateDocument(meiliIndex, meiliObj)
	}
	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("post.updated", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("post.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

		if result.Post.Status == "publish" {
			if util.CheckWebhookEvent("post.published", authCtx.SpaceID.String(), r) {
				if err = util.NC.Publish("post.published", result); err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
		if oldStatus == "publish" && (result.Post.Status == "draft" || result.Post.Status == "ready") {
			if util.CheckWebhookEvent("post.unpublished", authCtx.SpaceID.String(), r) {
				if err = util.NC.Publish("post.unpublished", result); err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
		if (oldStatus == "publish" || oldStatus == "draft") && result.Post.Status == "ready" {
			if util.CheckWebhookEvent("post.ready", authCtx.SpaceID.String(), r) {
				if err = util.NC.Publish("post.ready", result); err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
