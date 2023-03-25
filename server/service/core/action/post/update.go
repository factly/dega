package post

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/arrays"
	searchService "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/schemax"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// update - Update post by id
// @Summary Update a post by id
// @Description Update post by ID
// @Tags Post
// @ID update-post-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param post_id path string true "Post ID"
// @Param Post body post false "Post"
// @Success 200 {object} postData
// @Router /core/posts/{post_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	postID := chi.URLParam(r, "post_id")
	id, err := strconv.Atoi(postID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID, err := middlewarex.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	post := &post{}
	postAuthors := []model.PostAuthor{}
	postClaims := []factCheckModel.PostClaim{}

	err = json.NewDecoder(r.Body).Decode(&post)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(post)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &postData{}
	result.ID = uint(id)
	result.Tags = make([]model.Tag, 0)
	result.Categories = make([]model.Category, 0)
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

	// fetch all authors
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// check record exists or not
	err = config.DB.Where(&model.Post{
		Base: config.Base{
			ID: uint(id),
		},
		SpaceID: uint(sID),
	}).Where("is_page = ?", false).First(&result.Post).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	post.SpaceID = result.SpaceID

	var postSlug string
	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Post{})
	tableName := stmt.Schema.Table

	if result.Slug == post.Slug {
		postSlug = result.Slug
	} else if post.Slug != "" && slugx.Check(post.Slug) {
		postSlug = slugx.Approve(&config.DB, post.Slug, sID, tableName)
	} else {
		postSlug = slugx.Approve(&config.DB, slugx.Make(post.Title), sID, tableName)
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(post.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(post.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		jsonDescription, err = util.GetJSONDescription(post.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	newTags := make([]model.Tag, 0)
	if len(post.TagIDs) > 0 {
		config.DB.Model(&model.Tag{}).Where(post.TagIDs).Find(&newTags)
		if err = tx.Model(&result.Post).Association("Tags").Replace(&newTags); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = config.DB.Model(&result.Post).Association("Tags").Clear()
	}

	newCategories := make([]model.Category, 0)
	if len(post.CategoryIDs) > 0 {
		config.DB.Model(&model.Category{}).Where(post.CategoryIDs).Find(&newCategories)
		if err = tx.Model(&result.Post).Association("Categories").Replace(&newCategories); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = config.DB.Model(&result.Post).Association("Categories").Clear()
	}

	updateMap := map[string]interface{}{
		"created_at":         post.CreatedAt,
		"updated_at":         post.UpdatedAt,
		"updated_by_id":      uint(uID),
		"title":              post.Title,
		"slug":               postSlug,
		"subtitle":           post.Subtitle,
		"excerpt":            post.Excerpt,
		"description":        jsonDescription,
		"description_html":   descriptionHTML,
		"is_highlighted":     post.IsHighlighted,
		"is_sticky":          post.IsSticky,
		"is_featured":        post.IsFeatured,
		"format_id":          post.FormatID,
		"featured_medium_id": post.FeaturedMediumID,
		"meta":               post.Meta,
		"header_code":        post.HeaderCode,
		"footer_code":        post.FooterCode,
		"meta_fields":        post.MetaFields,
		"description_amp":    post.DescriptionAMP,
		"migrated_html":      post.MigratedHTML,
	}

	if post.MigrationID != nil {
		updateMap["migration_id"] = *post.MigrationID
	}

	result.Post.FeaturedMediumID = &post.FeaturedMediumID
	if post.FeaturedMediumID == 0 {
		updateMap["featured_medium_id"] = nil
	}

	if post.CreatedAt.IsZero() {
		updateMap["created_at"] = result.CreatedAt
	}

	if post.UpdatedAt.IsZero() {
		updateMap["updated_at"] = time.Now()
	}

	oldStatus := result.Post.Status
	// Check if post status is changed back to draft or ready from published
	if oldStatus == "publish" && (post.Status == "draft" || post.Status == "ready") {
		status, err := getPublishPermissions(oID, sID, uID)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}

		if status != http.StatusOK {
			tx.Rollback()
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		updateMap["status"] = post.Status
		updateMap["published_date"] = nil

	} else if post.Status == "publish" {
		// Check if authors are not added while publishing post
		if len(post.AuthorIDs) == 0 {
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot publish post without author", http.StatusUnprocessableEntity)))
			return
		}

		status, err := getPublishPermissions(oID, sID, uID)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}
		if status == http.StatusOK {
			updateMap["status"] = "publish"
			if post.PublishedDate == nil {
				currTime := time.Now()
				updateMap["published_date"] = &currTime
			} else {
				updateMap["published_date"] = post.PublishedDate
			}
		} else {
			tx.Rollback()
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
	} else if post.Status == "ready" {
		updateMap["status"] = "ready"
	} else if oldStatus == "ready" && post.Status == "draft" {
		updateMap["status"] = "draft"
	}

	err = tx.Model(&result.Post).Updates(&updateMap).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var toCreateIDs []uint
	var toDeleteIDs []uint

	if result.Post.Format.Slug == "fact-check" {
		// fetch existing post claims
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: uint(id),
		}).Find(&postClaims)

		if len(postClaims) > 0 {
			err = tx.Model(&factCheckModel.PostClaim{}).Delete(&postClaims).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}

		toCreatePostClaims := make([]factCheckModel.PostClaim, 0)
		for i, id := range post.ClaimIDs {
			postClaim := factCheckModel.PostClaim{}
			postClaim.ClaimID = uint(id)
			postClaim.PostID = result.ID
			postClaim.Position = uint(i + 1)
			toCreatePostClaims = append(toCreatePostClaims, postClaim)
		}

		if len(toCreatePostClaims) > 0 {
			err = tx.Model(&factCheckModel.PostClaim{}).Create(&toCreatePostClaims).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}

		// fetch updated post claims
		updatedPostClaims := []factCheckModel.PostClaim{}
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: uint(id),
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&updatedPostClaims)

		result.ClaimOrder = make([]uint, len(updatedPostClaims))
		// appending previous post claims to result
		for _, postClaim := range updatedPostClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
			result.ClaimOrder[int(postClaim.Position-1)] = postClaim.ClaimID
		}

	}

	// fetch existing post authors
	config.DB.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&postAuthors)

	prevAuthorIDs := make([]uint, 0)
	mapperPostAuthor := map[uint]model.PostAuthor{}
	postAuthorIDs := make([]uint, 0)

	for _, postAuthor := range postAuthors {
		mapperPostAuthor[postAuthor.AuthorID] = postAuthor
		prevAuthorIDs = append(prevAuthorIDs, postAuthor.AuthorID)
	}

	toCreateIDs, toDeleteIDs = arrays.Difference(prevAuthorIDs, post.AuthorIDs)

	// map post author ids
	for _, id := range toDeleteIDs {
		postAuthorIDs = append(postAuthorIDs, mapperPostAuthor[id].ID)
	}

	// delete post authors
	if len(postAuthorIDs) > 0 {
		err = tx.Where(&postAuthorIDs).Delete(&model.PostAuthor{}).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// creating new post authors
	for _, id := range toCreateIDs {
		if id != 0 {
			postAuthor := &model.PostAuthor{}
			postAuthor.AuthorID = uint(id)
			postAuthor.PostID = result.ID

			err = tx.Model(&model.PostAuthor{}).Create(&postAuthor).Error

			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}
	}

	// fetch existing post authors
	updatedPostAuthors := []model.PostAuthor{}
	tx.Model(&model.PostAuthor{}).Where(&model.PostAuthor{
		PostID: uint(id),
	}).Find(&updatedPostAuthors)

	// appending previous post authors to result
	for _, postAuthor := range updatedPostAuthors {
		aID := fmt.Sprint(postAuthor.AuthorID)

		if author, found := authors[aID]; found {
			result.Authors = append(result.Authors, author)
		}
	}

	spaceObjectforDega, err := util.GetSpacefromKavach(uint(uID), uint(oID), uint(sID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	ratings := make([]factCheckModel.Rating, 0)
	config.DB.Model(&factCheckModel.Rating{}).Where(factCheckModel.Rating{
		SpaceID: uint(sID),
	}).Order("numeric_value asc").Find(&ratings)

	schemaxPost := schemax.Post{
		Base:            schemax.Base(result.Post.Base),
		Title:           result.Title,
		Subtitle:        result.Subtitle,
		Slug:            result.Slug,
		Status:          result.Status,
		IsPage:          result.IsPage,
		Excerpt:         result.Excerpt,
		Description:     result.Description,
		DescriptionHTML: result.DescriptionHTML,
		IsFeatured:      result.IsFeatured,
		IsSticky:        result.IsSticky,
		IsHighlighted:   result.IsHighlighted,
		FormatID:        result.FormatID,
		PublishedDate:   result.PublishedDate,
		SpaceID:         result.SpaceID,
		Schemas:         result.Schemas,
		Meta:            result.Meta,
		HeaderCode:      result.HeaderCode,
		FooterCode:      result.FooterCode,
		MetaFields:      result.MetaFields,
	}

	if result.FeaturedMediumID != nil {
		schemaxPost.FeaturedMediumID = result.FeaturedMediumID
		schemaxPost.Medium = &schemax.Medium{
			Base:        schemax.Base(result.Medium.Base),
			Name:        result.Medium.Name,
			Slug:        result.Medium.Slug,
			Type:        result.Medium.Type,
			Title:       result.Medium.Title,
			Description: result.Medium.Description,
			Caption:     result.Medium.Caption,
			AltText:     result.Medium.AltText,
			FileSize:    result.Medium.FileSize,
			URL:         result.Medium.URL,
			Dimensions:  result.Medium.Dimensions,
			MetaFields:  result.Medium.MetaFields,
			SpaceID:     result.Medium.SpaceID,
		}
	}

	schemaxAuthors := make([]schemax.PostAuthor, 0)
	for _, author := range result.Authors {
		schemaxAuthor := schemax.PostAuthor{
			Base:            schemax.Base(author.Base),
			Email:           author.Email,
			KID:             author.KID,
			FirstName:       author.FirstName,
			LastName:        author.LastName,
			Slug:            author.Slug,
			DisplayName:     author.DisplayName,
			BirthDate:       author.BirthDate,
			Gender:          author.Gender,
			SocialMediaURLs: author.SocialMediaURLs,
		}

		if author.FeaturedMediumID != nil {
			schemaxAuthor.FeaturedMediumID = author.FeaturedMediumID
			schemaxAuthor.Medium = &schemax.Medium{
				Base:        schemax.Base(author.Medium.Base),
				Name:        author.Medium.Name,
				Slug:        author.Medium.Slug,
				Type:        author.Medium.Type,
				Title:       author.Medium.Title,
				Description: author.Medium.Description,
				Caption:     author.Medium.Caption,
				AltText:     author.Medium.AltText,
				FileSize:    author.Medium.FileSize,
				URL:         author.Medium.URL,
				Dimensions:  author.Medium.Dimensions,
				MetaFields:  author.Medium.MetaFields,
				SpaceID:     author.Medium.SpaceID,
			}
		}
		schemaxAuthors = append(schemaxAuthors, schemaxAuthor)
	}

	schemaxClaims := make([]schemax.Claim, 0)
	for _, claim := range result.Claims {
		schemaxClaim := schemax.Claim{
			Base:            schemax.Base(claim.Base),
			Claim:           claim.Claim,
			Slug:            claim.Slug,
			ClaimDate:       claim.ClaimDate,
			CheckedDate:     claim.CheckedDate,
			ClaimSources:    claim.ClaimSources,
			Description:     claim.Description,
			DescriptionHTML: claim.DescriptionHTML,
			ClaimantID:      claim.ClaimantID,
			Claimant: schemax.Claimant{
				Base:            schemax.Base(claim.Claimant.Base),
				Name:            claim.Claimant.Name,
				Slug:            claim.Claimant.Slug,
				Description:     claim.Claimant.Description,
				DescriptionHTML: claim.Claimant.DescriptionHTML,
				IsFeatured:      claim.Claimant.IsFeatured,
				TagLine:         claim.Claimant.TagLine,
				MetaFields:      claim.Claimant.MetaFields,
				SpaceID:         claim.Claimant.SpaceID,
				Meta:            claim.Claimant.Meta,
				HeaderCode:      claim.Claimant.HeaderCode,
				FooterCode:      claim.Claimant.FooterCode,
			},
			RatingID:      claim.RatingID,
			Fact:          claim.Fact,
			ReviewSources: claim.ReviewSources,
			MetaFields:    claim.MetaFields,
			SpaceID:       claim.SpaceID,
			VideoID:       claim.VideoID,
			EndTime:       claim.EndTime,
			StartTime:     claim.StartTime,
			Meta:          claim.Meta,
			HeaderCode:    claim.HeaderCode,
			FooterCode:    claim.FooterCode,
		}

		if claim.MediumID != nil {
			schemaxClaim.MediumID = claim.MediumID
		}
		if claim.Claimant.MediumID != nil {
			schemaxClaim.Claimant.MediumID = claim.Claimant.MediumID
		}

		schemaxClaims = append(schemaxClaims, schemaxClaim)
	}

	schemaxRatings := make([]schemax.Rating, 0)
	for _, rating := range ratings {
		schemaxRating := schemax.Rating{
			Base:             schemax.Base(rating.Base),
			Name:             rating.Name,
			Slug:             rating.Slug,
			BackgroundColour: rating.BackgroundColour,
			TextColour:       rating.TextColour,
			Description:      rating.Description,
			DescriptionHTML:  rating.DescriptionHTML,
			NumericValue:     rating.NumericValue,
			MetaFields:       rating.MetaFields,
			SpaceID:          rating.SpaceID,
			Meta:             rating.Meta,
			HeaderCode:       rating.HeaderCode,
			FooterCode:       rating.FooterCode,
		}
		if rating.MediumID != nil {
			schemaxRating.MediumID = rating.MediumID
		}
		schemaxRatings = append(schemaxRatings, schemaxRating)
	}

	schemaxSpace := schemax.Space{
		Base: schemax.Base{
			ID:          spaceObjectforDega.ID,
			CreatedAt:   spaceObjectforDega.CreatedAt,
			UpdatedAt:   spaceObjectforDega.UpdatedAt,
			DeletedAt:   spaceObjectforDega.DeletedAt,
			CreatedByID: spaceObjectforDega.CreatedByID,
			UpdatedByID: spaceObjectforDega.UpdatedByID,
		},
		Name:        spaceObjectforDega.Name,
		Slug:        spaceObjectforDega.Slug,
		Description: spaceObjectforDega.Description,
		MetaFields:  spaceObjectforDega.MetaFields,
		SpaceSettings: &schemax.SpaceSettings{
			SiteTitle:         spaceObjectforDega.SiteTitle,
			SiteAddress:       spaceObjectforDega.SiteAddress,
			VerificationCodes: spaceObjectforDega.VerificationCodes,
			SocialMediaURLs:   spaceObjectforDega.SocialMediaURLs,
			ContactInfo:       spaceObjectforDega.ContactInfo,
			Analytics:         spaceObjectforDega.Analytics,
			HeaderCode:        spaceObjectforDega.HeaderCode,
			FooterCode:        spaceObjectforDega.FooterCode,
		},
	}

	if spaceObjectforDega.LogoID != nil {
		schemaxSpace.SpaceSettings.LogoID = spaceObjectforDega.LogoID
	}

	if spaceObjectforDega.LogoMobileID != nil {
		schemaxSpace.SpaceSettings.LogoMobileID = spaceObjectforDega.LogoMobileID
	}

	if spaceObjectforDega.FavIconID != nil {
		schemaxSpace.SpaceSettings.FavIconID = spaceObjectforDega.FavIconID
	}

	if spaceObjectforDega.MobileIconID != nil {
		schemaxSpace.SpaceSettings.MobileIconID = spaceObjectforDega.MobileIconID
	}

	schemas := schemax.GetSchemas(schemax.PostData{
		Post:    schemaxPost,
		Authors: schemaxAuthors,
		Claims:  schemaxClaims,
	}, schemaxSpace, schemaxRatings)

	byteArr, err := json.Marshal(schemas)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	tx.Model(&result.Post).Select("Schemas").Updates(&model.Post{
		Schemas: postgres.Jsonb{RawMessage: byteArr},
	})

	result.Post.Schemas = postgres.Jsonb{RawMessage: byteArr}

	// Update into meili index
	var meiliPublishDate int64
	if result.Post.Status == "publish" {
		meiliPublishDate = result.Post.PublishedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             result.ID,
		"kind":           "post",
		"title":          result.Title,
		"subtitle":       result.Subtitle,
		"slug":           result.Slug,
		"status":         result.Status,
		"excerpt":        result.Excerpt,
		"description":    result.Description,
		"is_featured":    result.IsFeatured,
		"is_sticky":      result.IsSticky,
		"is_highlighted": result.IsHighlighted,
		"is_page":        result.IsPage,
		"format_id":      result.FormatID,
		"published_date": meiliPublishDate,
		"space_id":       result.SpaceID,
		"tag_ids":        post.TagIDs,
		"category_ids":   post.CategoryIDs,
		"author_ids":     post.AuthorIDs,
	}

	if result.Format.Slug == "fact-check" {
		meiliObj["claim_ids"] = post.ClaimIDs
	}

	if config.SearchEnabled() {
		err = searchService.GetSearchService().Update(meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}
	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("post.updated", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("post.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

		if result.Post.Status == "publish" {
			if util.CheckWebhookEvent("post.published", strconv.Itoa(sID), r) {
				if err = util.NC.Publish("post.published", result); err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
		if oldStatus == "publish" && (result.Post.Status == "draft" || result.Post.Status == "ready") {
			if util.CheckWebhookEvent("post.unpublished", strconv.Itoa(sID), r) {
				if err = util.NC.Publish("post.unpublished", result); err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
		if (oldStatus == "publish" || oldStatus == "draft") && result.Post.Status == "ready" {
			if util.CheckWebhookEvent("post.ready", strconv.Itoa(sID), r) {
				if err = util.NC.Publish("post.ready", result); err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
	}

	renderx.JSON(w, http.StatusOK, result)
}

func getPublishPermissions(oID, sID, uID int) (int, error) {

	resStatus, err := util.IsAllowed("posts", "publish", uint(oID), uint(sID), uint(uID))
	if err != nil {
		return 0, err
	}

	return resStatus, nil
}
