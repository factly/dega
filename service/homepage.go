package service

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-vito/config"
	"github.com/factly/dega-vito/model"
	"github.com/factly/dega-vito/service/post"
	"github.com/factly/dega-vito/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
)

func home(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	var totalPosts int64
	posts := make([]model.Post, 0)
	// get posts
	err = config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Where(&model.Post{
		SpaceID: uint(sID),
	}).Where("is_page = ?", false).Count(&totalPosts).Order("created_at").Find(&posts).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var postIDs []uint
	for _, p := range posts {
		postIDs = append(postIDs, p.ID)
	}

	// fetch all claims related to posts
	postClaims := []model.PostClaim{}
	config.DB.Model(&model.PostClaim{}).Where("post_id in (?)", postIDs).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

	postClaimMap := make(map[uint][]model.Claim)
	for _, pc := range postClaims {
		if _, found := postClaimMap[pc.PostID]; !found {
			postClaimMap[pc.PostID] = make([]model.Claim, 0)
		}
		postClaimMap[pc.PostID] = append(postClaimMap[pc.PostID], pc.Claim)
	}

	// fetch all authors related to posts
	postAuthors := []model.PostAuthor{}
	config.DB.Model(&model.PostAuthor{}).Where("post_id in (?)", postIDs).Find(&postAuthors)

	postAuthorMap := make(map[uint][]uint)
	authors := make(map[string]model.Author)
	if len(postAuthors) > 0 {
		authors, err = util.AllAuthors(r.Context(), uint(sID), postAuthors[0].AuthorID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		for _, po := range postAuthors {
			if _, found := postAuthorMap[po.PostID]; !found {
				postAuthorMap[po.PostID] = make([]uint, 0)
			}
			postAuthorMap[po.PostID] = append(postAuthorMap[po.PostID], po.AuthorID)
		}
	}

	resultArticles := make([]post.PostData, 0)
	resultFactchecks := make([]post.PostData, 0)
	for _, p := range posts {
		postList := &post.PostData{}
		postList.Claims = make([]model.Claim, 0)
		postList.Authors = make([]model.Author, 0)
		if len(postClaimMap[p.ID]) > 0 {
			postList.Claims = postClaimMap[p.ID]
		}
		postList.Post = p

		postAuths, hasEle := postAuthorMap[p.ID]

		if hasEle {
			for _, postAuthor := range postAuths {
				aID := fmt.Sprint(postAuthor)
				if author, found := authors[aID]; found {
					postList.Authors = append(postList.Authors, author)
				}
			}
		}
		if p.Format.Slug == "fact-check" {
			resultFactchecks = append(resultFactchecks, *postList)
		} else {
			resultArticles = append(resultArticles, *postList)
		}
	}

	categories := make([]model.Category, 0)
	err = config.DB.Model(&model.Category{}).Find(&categories).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = util.Template.ExecuteTemplate(w, "homepage.gohtml", map[string]interface{}{
		"factchecks": resultFactchecks,
		"articles":   resultArticles,
		"categories": categories,
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

}
