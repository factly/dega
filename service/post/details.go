package post

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-vito/config"
	"github.com/factly/dega-vito/model"
	"github.com/factly/dega-vito/util"
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

	slug := chi.URLParam(r, "post_slug")
	if slug == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("Invalid Slug", http.StatusBadRequest)))
		return
	}

	result := &postData{}
	result.Claims = make([]model.Claim, 0)

	postAuthors := []model.PostAuthor{}
	postClaims := []model.PostClaim{}

	err = config.DB.Model(&model.Post{}).Where(&model.Post{
		Slug: slug,
	}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Where(&model.Post{
		SpaceID: uint(sID),
	}).First(&result.Post).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if result.Format.Slug == "fact-check" {
		config.DB.Model(&model.PostClaim{}).Where(&model.PostClaim{
			PostID: uint(result.Post.ID),
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

		// appending all post claims
		for _, postClaim := range postClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
		}
	}

	// fetch all authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(result.Post.ID),
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

	err = util.Template.ExecuteTemplate(w, "post.gohtml", map[string]interface{}{
		"post": result,
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

}
