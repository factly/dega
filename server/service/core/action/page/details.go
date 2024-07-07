package page

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

// details - Get page by id
// @Summary Show a page by id
// @Description Get page by ID
// @Tags Page
// @ID get-page-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param page_id path string true "Page ID"
// @Success 200 {object} pageData
// @Router /core/pages/{page_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	authCtx, err := util.GetAuthCtx(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	pageID := chi.URLParam(r, "page_id")
	id, err := uuid.Parse(pageID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &pageData{}
	result.Authors = make([]model.Author, 0)

	postAuthors := []model.PostAuthor{}
	result.ID = id

	err = config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Where(&model.Post{
		SpaceID: authCtx.SpaceID,
		IsPage:  true,
	}).First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// fetch all authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: id,
	}).Find(&postAuthors)

	authorIds := make([]string, 0)

	for _, postAuthor := range postAuthors {
		authorIds = append(authorIds, fmt.Sprint(postAuthor.AuthorID))
	}

	// Adding author
	authors, err := util.GetAuthors(authCtx.OrganisationID, authorIds)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	for _, postAuthor := range postAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)
		if author, found := authors[aID]; found {
			result.Authors = append(result.Authors, author)
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}
