package author

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-vito/config"
	"github.com/factly/dega-vito/model"
	"github.com/factly/dega-vito/service/post"
	"github.com/factly/dega-vito/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/paginationx"
	"github.com/go-chi/chi"
)

func postList(w http.ResponseWriter, r *http.Request) {
	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	aID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(aID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	formatSlug := chi.URLParam(r, "format_slug")
	if formatSlug == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("Invalid Format Slug", http.StatusBadRequest)))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	postAuthor := model.PostAuthor{}
	// get user id for kavach
	if err = config.DB.Model(&model.PostAuthor{}).Joins("INNER JOIN de_posts ON de_posts.id = de_post_authors.post_id").Where("de_posts.space_id = ?", sID).First(&postAuthor).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	authors, err := util.AllAuthors(r.Context(), uint(sID), postAuthor.AuthorID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var totalPosts int64
	postList := make([]model.Post, 0)
	result := make([]post.PostData, 0)
	// get posts
	err = config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Joins("INNER JOIN de_formats ON de_formats.id = de_posts.format_id").Joins("INNER JOIN de_post_authors ON de_posts.id = de_post_authors.post_id").Where(&model.Post{
		SpaceID: uint(sID),
	}).Where("is_page = ?", false).Where("author_id = ?", id).Where("de_formats.slug = ?", formatSlug).Count(&totalPosts).Order("created_at").Offset(offset).Limit(limit).Find(&postList).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var postIDs []uint
	for _, p := range postList {
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
	if len(postAuthors) > 0 {
		for _, po := range postAuthors {
			if _, found := postAuthorMap[po.PostID]; !found {
				postAuthorMap[po.PostID] = make([]uint, 0)
			}
			postAuthorMap[po.PostID] = append(postAuthorMap[po.PostID], po.AuthorID)
		}
	}

	for _, p := range postList {
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
		result = append(result, *postList)
	}

	nextURL, prevURL := util.GetNextPrevURL(*r.URL, limit)
	if totalPosts <= int64(limit+offset) {
		nextURL = ""
	}

	if offset == 0 {
		prevURL = ""
	}

	err = util.Template.ExecuteTemplate(w, "postlist.gohtml", map[string]interface{}{
		"postList":    result,
		"author":      authors[fmt.Sprint(id)],
		"from_author": true,
		"nextURL":     nextURL,
		"prevURL":     prevURL,
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
