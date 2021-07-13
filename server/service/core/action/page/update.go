package page

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/test"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"gorm.io/gorm"
)

// update - Update page by id
// @Summary Update a page by id
// @Description Update page by ID
// @Tags Page
// @ID update-page-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param page_id path string true "Page ID"
// @Param Page body page false "Page"
// @Success 200 {object} pageData
// @Router /core/pages/{page_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	pageID := chi.URLParam(r, "page_id")
	id, err := strconv.Atoi(pageID)
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

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	page := &page{}

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
	result.ID = uint(id)
	result.Tags = make([]model.Tag, 0)
	result.Categories = make([]model.Category, 0)
	result.Authors = make([]model.Author, 0)

	// check record exists or not
	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
		IsPage:  true,
	}).First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// fetch all authors
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	page.SpaceID = result.SpaceID

	var pageSlug string
	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Post{})
	tableName := stmt.Schema.Table

	if result.Slug == page.Slug {
		pageSlug = result.Slug
	} else if page.Slug != "" && slugx.Check(page.Slug) {
		pageSlug = slugx.Approve(&config.DB, page.Slug, sID, tableName)
	} else {
		pageSlug = slugx.Approve(&config.DB, slugx.Make(page.Title), sID, tableName)
	}

	// Store HTML description
	var description string
	if len(page.Description.RawMessage) > 0 && !reflect.DeepEqual(page.Description, test.NilJsonb()) {
		description, err = util.HTMLDescription(page.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse page description", http.StatusUnprocessableEntity)))
			return
		}
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	newTags := make([]model.Tag, 0)
	if len(page.TagIDs) > 0 {
		config.DB.Model(&model.Tag{}).Where(page.TagIDs).Find(&newTags)
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
	if len(page.CategoryIDs) > 0 {
		config.DB.Model(&model.Category{}).Where(page.CategoryIDs).Find(&newCategories)
		if err = tx.Model(&result.Post).Association("Categories").Replace(&newCategories); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = config.DB.Model(&result.Post).Association("Categories").Clear()
	}

	featuredMediumID := &page.FeaturedMediumID
	result.Post.FeaturedMediumID = &page.FeaturedMediumID
	if page.FeaturedMediumID == 0 {
		err = tx.Model(&result.Post).Omit("Tags", "Categories").Updates(map[string]interface{}{"featured_medium_id": nil}).Error
		featuredMediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	updatedPage := model.Post{
		Base:             config.Base{UpdatedByID: uint(uID)},
		Title:            page.Title,
		Slug:             pageSlug,
		Subtitle:         page.Subtitle,
		Status:           page.Status,
		PublishedDate:    page.PublishedDate,
		Excerpt:          page.Excerpt,
		Description:      page.Description,
		HTMLDescription:  description,
		IsHighlighted:    page.IsHighlighted,
		IsSticky:         page.IsSticky,
		FormatID:         page.FormatID,
		FeaturedMediumID: featuredMediumID,
	}

	tx.Model(&result.Post).Select("IsFeatured", "IsSticky", "IsHighlighted").Omit("Tags", "Categories").Updates(model.Post{
		IsFeatured:    page.IsFeatured,
		IsSticky:      page.IsSticky,
		IsHighlighted: page.IsHighlighted,
	})
	err = tx.Model(&result.Post).Omit("Tags", "Categories").Updates(updatedPage).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	pageAuthors := []model.PostAuthor{}
	// fetch existing post authors
	tx.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&pageAuthors)

	prevAuthorIDs := make([]uint, 0)
	mapperPostAuthor := map[uint]model.PostAuthor{}
	postAuthorIDs := make([]uint, 0)

	for _, postAuthor := range pageAuthors {
		mapperPostAuthor[postAuthor.AuthorID] = postAuthor
		prevAuthorIDs = append(prevAuthorIDs, postAuthor.AuthorID)
	}

	toCreateIDs, toDeleteIDs := arrays.Difference(prevAuthorIDs, page.AuthorIDs)

	// map post author ids
	for _, id := range toDeleteIDs {
		postAuthorIDs = append(postAuthorIDs, mapperPostAuthor[id].ID)
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
		if id != 0 {
			postAuthor := &model.PostAuthor{}
			postAuthor.AuthorID = uint(id)
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
		PostID: uint(id),
	}).Find(&updatedPostAuthors)

	// appending previous post authors to result
	for _, postAuthor := range updatedPostAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)

		if author, found := authors[aID]; found {
			result.Authors = append(result.Authors, author)
		}
	}

	// Update into meili index
	var meiliPublishDate int64
	if result.Post.PublishedDate != nil {
		meiliPublishDate = result.Post.PublishedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             result.ID,
		"kind":           "page",
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
		"tag_ids":        page.TagIDs,
		"category_ids":   page.CategoryIDs,
		"author_ids":     page.AuthorIDs,
	}

	_ = meilisearchx.UpdateDocument("dega", meiliObj)
	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("page.updated", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
