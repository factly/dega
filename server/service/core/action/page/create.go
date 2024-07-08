package page

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
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

// create - Create page
// @Summary Create page
// @Description Create page
// @Tags Page
// @ID add-page
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Page body page true "Page Object"
// @Success 201 {object} pageData
// @Router /core/pages [post]
func create(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	page := page{}
	err = json.NewDecoder(r.Body).Decode(&page)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(page)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &pageData{}
	result.Authors = make([]model.Author, 0)

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Post{})
	tableName := stmt.Schema.Table

	var postSlug string
	if page.Slug != "" && util.CheckSlug(page.Slug) {
		postSlug = page.Slug
	} else {
		postSlug = util.MakeSlug(page.Title)
	}

	featuredMediumID := &page.FeaturedMediumID
	if page.FeaturedMediumID == uuid.Nil {
		featuredMediumID = nil
	}

	// Store HTML description
	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(page.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(page.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(page.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	result.Post = model.Post{
		Base: config.Base{
			CreatedAt: page.CreatedAt,
			UpdatedAt: page.UpdatedAt,
		},
		Title:            page.Title,
		Slug:             util.ApproveSlug(postSlug, authCtx.SpaceID, tableName),
		Status:           page.Status,
		IsPage:           true,
		Subtitle:         page.Subtitle,
		Excerpt:          page.Excerpt,
		Description:      jsonDescription,
		DescriptionHTML:  descriptionHTML,
		IsHighlighted:    page.IsHighlighted,
		IsSticky:         page.IsSticky,
		FeaturedMediumID: featuredMediumID,
		FormatID:         page.FormatID,
		Meta:             page.Meta,
		MetaFields:       page.MetaFields,
		HeaderCode:       page.HeaderCode,
		FooterCode:       page.FooterCode,
		SpaceID:          authCtx.SpaceID,
		DescriptionAMP:   page.DescriptionAMP,
		MigratedHTML:     page.MigratedHTML,
	}

	if page.MigrationID != nil {
		result.Post.MigrationID = *page.MigrationID
	}

	if len(page.TagIDs) > 0 {
		config.DB.Model(&model.Tag{}).Where(page.TagIDs).Find(&result.Post.Tags)
	}
	if len(page.CategoryIDs) > 0 {
		config.DB.Model(&model.Category{}).Where(page.CategoryIDs).Find(&result.Post.Categories)
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, authCtx.UserID)).Begin()
	err = tx.Model(&model.Post{}).Create(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post)

	// fetch all authors
	authors, err := util.GetAuthors(authCtx.OrganisationID, page.AuthorIDs)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	for _, id := range page.AuthorIDs {
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

	// Insert into meili index
	var meiliPublishDate int64
	if result.Post.PublishedDate != nil {
		meiliPublishDate = result.Post.PublishedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             result.ID.String(),
		"title":          result.Title,
		"subtitle":       result.Subtitle,
		"slug":           result.Slug,
		"status":         result.Status,
		"is_page":        result.IsPage,
		"excerpt":        result.Excerpt,
		"description":    result.Description,
		"is_featured":    result.IsFeatured,
		"is_sticky":      result.IsSticky,
		"is_highlighted": result.IsHighlighted,
		"format_id":      result.FormatID,
		"published_date": meiliPublishDate,
		"space_id":       result.SpaceID,
		"tag_ids":        page.TagIDs,
		"category_ids":   page.CategoryIDs,
		"author_ids":     page.AuthorIDs,
		"meta":           result.Meta,
		"meta_fields":    result.MetaFields,
		"header_code":    result.HeaderCode,
		"footer_code":    result.FooterCode,
	}

	if config.SearchEnabled() {
		_ = meilisearch.AddDocument(meiliIndex, meiliObj)
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("page.created", authCtx.SpaceID.String(), r) {
			if err = util.NC.Publish("page.created", result); err != nil {
				errorx.Render(w, errorx.Parser(errorx.GetMessage("not able to publish event", http.StatusInternalServerError)))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusCreated, result)
}
