package post

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"strconv"

	"github.com/factly/dega-templates/config"
	"github.com/factly/dega-templates/model"
	"github.com/factly/dega-templates/util"
	"github.com/factly/x/editorx"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

func page(w http.ResponseWriter, r *http.Request) {

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	postID := chi.URLParam(r, "post_id")
	id, err := strconv.Atoi(postID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &postData{}
	result.Claims = make([]model.Claim, 0)

	postAuthors := []model.PostAuthor{}
	postClaims := []model.PostClaim{}
	result.ID = uint(id)

	err = config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Where(&model.Post{
		SpaceID: uint(sID),
	}).First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if result.Format.Slug == "fact-check" {
		config.DB.Model(&model.PostClaim{}).Where(&model.PostClaim{
			PostID: uint(id),
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

		// appending all post claims
		for _, postClaim := range postClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
		}
	}

	// fetch all authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&postAuthors)

	if len(postAuthors) != 0 {
		// Adding author
		authors, err := util.AllAuthors(r.Context(), uint(sID), postAuthors[0].AuthorID)
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
	}

	var editorjsBlocks map[string]interface{}
	err = json.Unmarshal(result.Post.Description.RawMessage, &editorjsBlocks)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	html, err := editorx.EditorjsToHTML(editorjsBlocks)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = util.Template.ExecuteTemplate(w, "post.gohtml", map[string]interface{}{
		"post":     result,
		"HTMLDesc": template.HTML(html),
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

}
