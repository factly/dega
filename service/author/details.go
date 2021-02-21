package author

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-templates/config"
	"github.com/factly/dega-templates/model"
	"github.com/factly/dega-templates/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	authorID := chi.URLParam(r, "author_id")
	id, err := strconv.Atoi(authorID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	posts := make([]model.Post, 0)
	err = config.DB.Where(&model.Post{
		SpaceID: uint(sID),
	}).Find(&posts).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var postIDs []uint
	for _, p := range posts {
		postIDs = append(postIDs, p.ID)
	}

	// fetch all authors related to posts
	postAuthors := []model.PostAuthor{}
	config.DB.Model(&model.PostAuthor{}).Where("post_id in (?)", postIDs).Find(&postAuthors)

	authors := make(map[string]model.Author)
	if len(postAuthors) > 0 {
		authors, err = util.AllAuthors(r.Context(), uint(sID), postAuthors[0].AuthorID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	if _, found := authors[fmt.Sprint(id)]; found {
		err = util.Template.ExecuteTemplate(w, "author.gohtml", authors[fmt.Sprint(id)])
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	} else {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
}
