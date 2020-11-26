package post

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

type templateData struct {
	PostID uint `json:"post_id" validate:"required"`
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
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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

	result := model.Post{}
	result.ID = uint(templateReq.PostID)

	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
	}).Preload("Tags").Preload("Categories").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	template := result

	template.Status = "template"
	template.PublishedDate = time.Time{}
	template.Base = config.Base{}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Post{}).Create(&template).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&template)

	tagIDs := make([]uint, 0)
	categoryIDs := make([]uint, 0)

	for _, tag := range template.Tags {
		tagIDs = append(tagIDs, tag.ID)
	}

	for _, category := range template.Categories {
		categoryIDs = append(categoryIDs, category.ID)
	}

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":             template.ID,
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
		"published_date": template.PublishedDate.Unix(),
		"space_id":       template.SpaceID,
		"tag_ids":        tagIDs,
		"category_ids":   categoryIDs,
	}

	err = meili.AddDocument(meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, template)
}
