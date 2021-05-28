package category

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

	slug := chi.URLParam(r, "slug")
	if slug == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("Invalid Slug", http.StatusBadRequest)))
		return
	}

	formatSlug := chi.URLParam(r, "format_slug")
	if formatSlug == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("Invalid Format Slug", http.StatusBadRequest)))
		return
	}

	offset, limit := paginationx.Parse(r.URL.Query())

	category := model.Category{}
	// get category
	if err = config.DB.Model(&model.Category{}).Where(&model.Category{
		Slug:    slug,
		SpaceID: uint(sID),
	}).Find(&category).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	postList := make([]model.Post, 0)
	result := make([]post.PostData, 0)
	// get posts
	err = config.DB.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").Joins("INNER JOIN formats ON formats.id = posts.format_id").Joins("INNER JOIN post_categories ON posts.id = post_categories.post_id").Where(&model.Post{
		SpaceID: uint(sID),
	}).Where("is_page = ?", false).Where("category_id = ?", category.ID).Where("formats.slug = ?", formatSlug).Order("created_at").Offset(offset).Limit(limit).Find(&postList).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
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

	err = util.Template.ExecuteTemplate(w, "postlist.gohtml", map[string]interface{}{
		"postList": result,
	})
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
}
