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
	searchService "github.com/factly/dega-server/util/search-service"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/schemax"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

// create - Create post
// @Summary Create post
// @Description Create post
// @Tags Post
// @ID add-post
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Post body post true "Post Object"
// @Success 201 {object} postData
// @Router /core/posts [post]
func create(w http.ResponseWriter, r *http.Request) {

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

	post := post{}

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

	var status string = "draft"

	if post.Status == "publish" {

		if len(post.AuthorIDs) == 0 {
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot publish post without author", http.StatusUnprocessableEntity)))
			return
		}

		stat, err := getPublishPermissions(oID, sID, uID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}

		if stat == http.StatusOK {
			status = "publish"
		}
	}

	if post.Status == "ready" {
		status = "ready"
	}

	post.SpaceID = uint(sID)

	result, errMessage := createPost(r.Context(), post, status, r)

	if errMessage.Code != 0 {
		errorx.Render(w, errorx.Parser(errMessage))
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}

func createPost(ctx context.Context, post post, status string, r *http.Request) (*postData, errorx.Message) {
	result := &postData{}
	result.Authors = make([]model.Author, 0)
	result.Claims = make([]factCheckModel.Claim, 0)

	sID, err := middlewarex.GetSpace(ctx)
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.Unauthorized()
	}

	uID, err := middlewarex.GetUser(ctx)
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.Unauthorized()
	}

	orgID, err := util.GetOrganisation(ctx)
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.Unauthorized()
	}
	if viper.GetBool("create_super_organisation") {
		// Fetch space permissions
		permission := model.SpacePermission{}
		err = config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
			SpaceID: uint(sID),
		}).First(&permission).Error

		if err != nil {
			return nil, errorx.GetMessage("cannot create more posts", http.StatusUnprocessableEntity)
		}

		// Fetch total number of posts in space
		var totPosts int64
		config.DB.Model(&model.Post{}).Where(&model.Post{
			SpaceID: uint(sID),
		}).Where("status != 'template'").Count(&totPosts)

		if totPosts >= permission.Posts && permission.Posts > 0 {
			return nil, errorx.GetMessage("cannot create more posts", http.StatusUnprocessableEntity)
		}
	}

	// Get table name
	stmt := &gorm.Statement{DB: config.DB}
	_ = stmt.Parse(&model.Post{})
	tableName := stmt.Schema.Table

	var postSlug string
	if post.Slug != "" && slugx.Check(post.Slug) {
		postSlug = post.Slug
	} else {
		postSlug = slugx.Make(post.Title)
	}

	featuredMediumID := &post.FeaturedMediumID
	if post.FeaturedMediumID == 0 {
		featuredMediumID = nil
	}

	var descriptionHTML string
	var jsonDescription postgres.Jsonb
	if len(post.Description.RawMessage) > 0 {
		descriptionHTML, err = util.GetDescriptionHTML(post.Description)
		if err != nil {
			loggerx.Error(err)
			return nil, errorx.GetMessage("could not get html description", 422)
		}

		jsonDescription, err = util.GetJSONDescription(post.Description)
		if err != nil {
			loggerx.Error(err)
			return nil, errorx.GetMessage("could not get json description", 422)
		}
	}

	result.Post = model.Post{
		Base: config.Base{
			CreatedAt: post.CreatedAt,
			UpdatedAt: post.UpdatedAt,
		},
		Title:            post.Title,
		Slug:             slugx.Approve(&config.DB, postSlug, sID, tableName),
		Status:           status,
		IsPage:           post.IsPage,
		Subtitle:         post.Subtitle,
		Excerpt:          post.Excerpt,
		Description:      jsonDescription,
		DescriptionHTML:  descriptionHTML,
		IsHighlighted:    post.IsHighlighted,
		IsSticky:         post.IsSticky,
		FeaturedMediumID: featuredMediumID,
		FormatID:         post.FormatID,
		Meta:             post.Meta,
		HeaderCode:       post.HeaderCode,
		FooterCode:       post.FooterCode,
		MetaFields:       post.MetaFields,
		SpaceID:          uint(sID),
	}

	if status == "publish" {
		if post.PublishedDate == nil {
			currTime := time.Now()
			result.Post.PublishedDate = &currTime
		} else {
			result.Post.PublishedDate = post.PublishedDate
		}
	} else {
		result.Post.PublishedDate = nil
	}

	if len(post.TagIDs) > 0 {
		config.DB.Model(&model.Tag{}).Where(post.TagIDs).Find(&result.Post.Tags)
	}
	if len(post.CategoryIDs) > 0 {
		config.DB.Model(&model.Category{}).Where(post.CategoryIDs).Find(&result.Post.Categories)
	}

	tx := config.DB.WithContext(context.WithValue(ctx, userContext, uID)).Begin()

	err = tx.Model(&model.Post{}).Create(&result.Post).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		return nil, errorx.DBError()
	}
	tx.Model(&model.Post{}).Preload("Medium").Preload("Format").Preload("Tags").Preload("Categories").First(&result.Post)

	if result.Format.Slug == "fact-check" {
		// create post claim
		for i, id := range post.ClaimIDs {
			postClaim := &factCheckModel.PostClaim{}
			postClaim.ClaimID = uint(id)
			postClaim.PostID = result.ID
			postClaim.Position = uint(i + 1)

			err = tx.Model(&factCheckModel.PostClaim{}).Create(&postClaim).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				return nil, errorx.DBError()
			}
		}

		// fetch all post claims
		postClaims := []factCheckModel.PostClaim{}
		tx.Model(&factCheckModel.PostClaim{}).Where(&factCheckModel.PostClaim{
			PostID: result.ID,
		}).Preload("Claim").Preload("Claim.Rating").Preload("Claim.Rating.Medium").Preload("Claim.Claimant").Preload("Claim.Claimant.Medium").Find(&postClaims)

		result.ClaimOrder = make([]uint, len(postClaims))
		// appending all post claims
		for _, postClaim := range postClaims {
			result.Claims = append(result.Claims, postClaim.Claim)
			result.ClaimOrder[int(postClaim.Position-1)] = postClaim.ClaimID
		}
	}

	// Adding author
	authors, err := author.All(ctx)

	if err != nil {
		loggerx.Error(err)
		return nil, errorx.InternalServerError()
	}

	for _, id := range post.AuthorIDs {
		aID := fmt.Sprint(id)
		if _, found := authors[aID]; found && id != 0 {
			author := model.PostAuthor{
				AuthorID: id,
				PostID:   result.Post.ID,
			}
			err := tx.Model(&model.PostAuthor{}).Create(&author).Error
			if err == nil {
				result.Authors = append(result.Authors, authors[aID])
			}
		}
	}

	spaceObjectforDega, err := util.GetSpacefromKavach(uint(uID), uint(orgID), uint(sID))
	if err != nil {
		loggerx.Error(err)
		return nil, errorx.InternalServerError()
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
				MediumID:        claim.Claimant.MediumID,
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
			LogoID:            spaceObjectforDega.LogoID,
			LogoMobileID:      spaceObjectforDega.LogoMobileID,
			FavIconID:         spaceObjectforDega.FavIconID,
			MobileIconID:      spaceObjectforDega.MobileIconID,
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
		return nil, errorx.InternalServerError()
	}
	tx.Model(&result.Post).Select("Schemas").Updates(&model.Post{
		Schemas: postgres.Jsonb{RawMessage: byteArr},
	})

	result.Post.Schemas = postgres.Jsonb{RawMessage: byteArr}

	if config.SearchEnabled() {
		// Insert into search index
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
		
		err = searchService.GetSearchService().Add(meiliObj)
		if err != nil {
			return nil, errorx.InternalServerError()
		}
	}

	tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("post.created", strconv.Itoa(sID), r) {
			if err = util.NC.Publish("post.created", result); err != nil {
				return nil, errorx.GetMessage("not able to publish event", http.StatusInternalServerError)
			}

		}

		if result.Post.Status == "publish" {
			if util.CheckWebhookEvent("post.published", strconv.Itoa(sID), r) {
				if err = util.NC.Publish("post.published", result); err != nil {
					return nil, errorx.GetMessage("not able to publish event", http.StatusInternalServerError)
				}
			}

		}
	}

	return result, errorx.Message{}
}
