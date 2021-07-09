package author

import (
	"net/http"

	"github.com/factly/dega-vito/config"
	"github.com/factly/dega-vito/model"
	"github.com/factly/dega-vito/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
)

func list(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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

	authorList := make([]model.Author, 0)
	for _, v := range authors {
		authorList = append(authorList, v)
	}

	err = util.Template.ExecuteTemplate(w, "authorlist.gohtml", authorList)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
