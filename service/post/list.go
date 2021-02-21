package post

import (
	"fmt"
	"net/http"

	"github.com/factly/dega-templates/config"
	"github.com/factly/dega-templates/model"
	"github.com/factly/dega-templates/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
)

type paging struct {
	Total int64      `json:"total"`
	Nodes []postData `json:"nodes"`
}

func list(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := paging{}
	result.Nodes = make([]postData, 0)

	posts := make([]model.Post, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	err = config.DB.Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Model(&model.Post{}).Where(&model.Post{
		SpaceID: uint(sID),
	}).Order("created_at").Where("status != ?", "template").Count(&result.Total).Offset(offset).Limit(limit).Find(&posts).Error

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

	for _, post := range posts {
		postList := &postData{}
		postList.Claims = make([]model.Claim, 0)
		postList.Authors = make([]model.Author, 0)
		if len(postClaimMap[post.ID]) > 0 {
			postList.Claims = postClaimMap[post.ID]
		}
		postList.Post = post

		postAuths, hasEle := postAuthorMap[post.ID]

		if hasEle {
			for _, postAuthor := range postAuths {
				aID := fmt.Sprint(postAuthor)
				if author, found := authors[aID]; found {
					postList.Authors = append(postList.Authors, author)
				}
			}
		}
		result.Nodes = append(result.Nodes, *postList)
	}

	err = util.Template.ExecuteTemplate(w, "postlist.gohtml", map[string]interface{}{
		"postList": result.Nodes,
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
