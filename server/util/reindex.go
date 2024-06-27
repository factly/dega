package util

import (
	"fmt"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	podcastModel "github.com/factly/dega-server/service/podcast/model"
	"github.com/google/uuid"
)

func ReindexAllEntities(spaceID uuid.UUID) error {
	var err error
	if err = AddPosts(spaceID); err != nil {
		return err
	}
	if err = AddCategories(spaceID); err != nil {
		return err
	}
	if err = AddTags(spaceID); err != nil {
		return err
	}
	if err = AddMedium(spaceID); err != nil {
		return err
	}
	if err = AddMenu(spaceID); err != nil {
		return err
	}
	if err = AddSpace(spaceID); err != nil {
		return err
	}
	if err = AddClaim(spaceID); err != nil {
		return err
	}
	if err = AddClaimant(spaceID); err != nil {
		return err
	}
	if err = AddRating(spaceID); err != nil {
		return err
	}
	if err = AddPodcast(spaceID); err != nil {
		return err
	}
	if err = AddEpisode(spaceID); err != nil {
		return err
	}

	return nil
}

func AddPosts(spaceID uuid.UUID) error {
	posts := make([]model.Post, 0)
	tx := config.DB.Begin()
	err := config.DB.Model(&model.Post{}).Where(&model.Post{
		SpaceID: spaceID,
	}).Preload("Format").Preload("Tags").Preload("Categories").Find(&posts).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	postAuthorMap := make(map[uuid.UUID][]string)
	postAuthors := make([]model.PostAuthor, 0)

	err = tx.Model(&model.PostAuthor{}).Find(&postAuthors).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	for _, pa := range postAuthors {
		postAuthorMap[pa.PostID] = append(postAuthorMap[pa.PostID], pa.AuthorID)
	}

	postClaimsMap := make(map[uuid.UUID][]uuid.UUID)
	postClaims := make([]factCheckModel.PostClaim, 0)

	err = tx.Model(&factCheckModel.PostClaim{}).Find(&postClaims).Error
	if err != nil {
		tx.Rollback()
		return err
	}
	for _, pc := range postClaims {
		postClaimsMap[pc.PostID] = append(postClaimsMap[pc.PostID], pc.ClaimID)
	}

	meiliPostObjects := make([]map[string]interface{}, 0)
	for _, p := range posts {
		var meiliPublishDate int64
		if p.Status == "publish" || p.PublishedDate != nil {
			meiliPublishDate = p.PublishedDate.Unix()
		}

		tagIDs := make([]string, 0)
		categoryIDs := make([]string, 0)

		for _, each := range p.Categories {
			categoryIDs = append(categoryIDs, each.ID.String())
		}
		for _, each := range p.Tags {
			tagIDs = append(tagIDs, each.ID.String())
		}

		meiliObj := map[string]interface{}{
			"object_id":      fmt.Sprint("post_", p.ID.String()),
			"id":             p.ID.String(),
			"kind":           "post",
			"title":          p.Title,
			"subtitle":       p.Subtitle,
			"slug":           p.Slug,
			"status":         p.Status,
			"excerpt":        p.Excerpt,
			"description":    p.Description,
			"is_featured":    p.IsFeatured,
			"is_sticky":      p.IsSticky,
			"is_highlighted": p.IsHighlighted,
			"is_page":        p.IsPage,
			"format_id":      p.FormatID,
			"published_date": meiliPublishDate,
			"meta_fields":    p.MetaFields,
			"space_id":       p.SpaceID.String(),
			"tag_ids":        tagIDs,
			"category_ids":   categoryIDs,
			"author_ids":     postAuthorMap[p.ID],
		}

		if p.IsPage {
			meiliObj["object_id"] = fmt.Sprint("page_", p.ID.String())
			meiliObj["kind"] = "page"
		}

		if p.Format.Slug == "fact-check" {
			meiliObj["claim_ids"] = postClaimsMap[p.ID]
		}

		meiliPostObjects = append(meiliPostObjects, meiliObj)
	}
	_, err = config.MeilisearchClient.Index("dega").UpdateDocuments(meiliPostObjects)
	tx.Commit()
	return err
}

func AddCategories(spaceID uuid.UUID) error {
	categories := make([]model.Category, 0)
	tx := config.DB.Model(&model.Category{})
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&categories)

	meiliCategoryObjects := make([]map[string]interface{}, 0)
	for _, c := range categories {
		meiliObj := map[string]interface{}{
			"object_id":   fmt.Sprint("category_", c.ID.String()),
			"id":          c.ID.String(),
			"kind":        "category",
			"name":        c.Name,
			"slug":        c.Slug,
			"description": c.Description,
			"space_id":    c.SpaceID.String(),
			"meta_fields": c.MetaFields,
		}
		meiliCategoryObjects = append(meiliCategoryObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliCategoryObjects)

	return err
}

func AddTags(spaceID uuid.UUID) error {
	tags := make([]model.Tag, 0)
	tx := config.DB.Model(&model.Tag{})
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&tags)

	meiliTagObjects := make([]map[string]interface{}, 0)
	for _, t := range tags {
		meiliObj := map[string]interface{}{
			"object_id":   fmt.Sprint("tag_", t.ID.String()),
			"id":          t.ID.String(),
			"kind":        "tag",
			"name":        t.Name,
			"slug":        t.Slug,
			"description": t.Description,
			"space_id":    t.SpaceID.String(),
		}
		meiliTagObjects = append(meiliTagObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliTagObjects)

	return err
}

func AddMedium(spaceID uuid.UUID) error {
	medium := make([]model.Medium, 0)
	tx := config.DB.Begin()
	err := config.DB.Model(&model.Medium{}).Where(&model.Medium{
		SpaceID: spaceID,
	}).Find(&medium).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	meiliMediumObjects := make([]map[string]interface{}, 0)
	for _, m := range medium {
		meiliObj := map[string]interface{}{
			"object_id":   fmt.Sprint("medium_", m.ID.String()),
			"id":          m.ID.String(),
			"kind":        "medium",
			"name":        m.Name,
			"slug":        m.Slug,
			"title":       m.Title,
			"type":        m.Type,
			"description": m.Description,
			"space_id":    m.SpaceID.String(),
		}
		meiliMediumObjects = append(meiliMediumObjects, meiliObj)
	}

	_, err = config.MeilisearchClient.Index("dega").UpdateDocuments(meiliMediumObjects)
	tx.Commit()
	return err
}

func AddMenu(spaceID uuid.UUID) error {
	menus := make([]model.Menu, 0)
	tx := config.DB.Model(&model.Menu{})
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&menus)

	meiliMenuObjects := make([]map[string]interface{}, 0)
	for _, m := range menus {
		meiliObj := map[string]interface{}{
			"object_id": fmt.Sprint("menu_", m.ID.String()),
			"id":        m.ID.String(),
			"kind":      "menu",
			"name":      m.Name,
			"slug":      m.Slug,
			"menu":      m.Menu,
			"space_id":  m.SpaceID.String(),
		}
		meiliMenuObjects = append(meiliMenuObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliMenuObjects)

	return err
}

func AddSpace(spaceID uuid.UUID) error {
	spaces := make([]model.Space, 0)
	tx := config.DB.Model(&model.Space{})
	if spaceID != uuid.Nil {
		tx.Where("id IN (?)", spaceID)
	}
	tx.First(&spaces)

	meiliSpaceObjects := make([]map[string]interface{}, 0)
	for _, s := range spaces {
		meiliObj := map[string]interface{}{
			"object_id":       fmt.Sprint("space_", s.ID.String()),
			"id":              s.ID.String(),
			"kind":            "space",
			"name":            s.Name,
			"slug":            s.Slug,
			"description":     s.Description,
			"site_title":      s.SiteTitle,
			"site_address":    s.SiteAddress,
			"tag_line":        s.TagLine,
			"organisation_id": s.OrganisationID,
			"analytics":       s.Analytics,
		}
		meiliSpaceObjects = append(meiliSpaceObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliSpaceObjects)

	return err
}

func AddClaim(spaceID uuid.UUID) error {
	claims := make([]factCheckModel.Claim, 0)
	tx := config.DB.Model(&factCheckModel.Claim{})
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&claims)

	meiliClaimObjects := make([]map[string]interface{}, 0)
	for _, c := range claims {
		var claimMeiliDate int64 = 0
		if c.ClaimDate != nil {
			claimMeiliDate = c.ClaimDate.Unix()
		}
		var checkedMeiliDate int64 = 0
		if c.CheckedDate != nil {
			checkedMeiliDate = c.CheckedDate.Unix()
		}

		meiliObj := map[string]interface{}{
			"object_id":      fmt.Sprint("claim_", c.ID.String()),
			"id":             c.ID.String(),
			"kind":           "claim",
			"claim":          c.Claim,
			"slug":           c.Slug,
			"description":    c.Description,
			"claim_date":     claimMeiliDate,
			"checked_date":   checkedMeiliDate,
			"claim_sources":  c.ClaimSources,
			"claimant_id":    c.ClaimantID,
			"rating_id":      c.RatingID,
			"fact":           c.Fact,
			"review_sources": c.ReviewSources,
			"space_id":       c.SpaceID.String(),
		}
		meiliClaimObjects = append(meiliClaimObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliClaimObjects)

	return err
}

func AddClaimant(spaceID uuid.UUID) error {
	claimants := make([]factCheckModel.Claimant, 0)
	tx := config.DB.Model(&factCheckModel.Claimant{})
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&claimants)

	meiliClaimantObjects := make([]map[string]interface{}, 0)
	for _, c := range claimants {
		meiliObj := map[string]interface{}{
			"object_id":   fmt.Sprint("claimant_", c.ID.String()),
			"id":          c.ID.String(),
			"kind":        "claimant",
			"name":        c.Name,
			"slug":        c.Slug,
			"description": c.Description,
			"tag_line":    c.TagLine,
			"space_id":    c.SpaceID.String(),
		}
		meiliClaimantObjects = append(meiliClaimantObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliClaimantObjects)

	return err
}

func AddRating(spaceID uuid.UUID) error {
	ratings := make([]factCheckModel.Rating, 0)
	tx := config.DB.Model(&factCheckModel.Rating{})
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&ratings)

	meiliRatingObjects := make([]map[string]interface{}, 0)
	for _, r := range ratings {
		meiliObj := map[string]interface{}{
			"object_id":         fmt.Sprint("rating_", r.ID.String()),
			"id":                r.ID.String(),
			"kind":              "rating",
			"name":              r.Name,
			"background_colour": r.BackgroundColour,
			"text_colour":       r.TextColour,
			"slug":              r.Slug,
			"description":       r.Description,
			"numeric_value":     r.NumericValue,
			"space_id":          r.SpaceID.String(),
		}
		meiliRatingObjects = append(meiliRatingObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliRatingObjects)

	return err
}

func AddPodcast(spaceID uuid.UUID) error {
	podcasts := make([]podcastModel.Podcast, 0)
	tx := config.DB.Model(&podcastModel.Podcast{}).Preload("Categories")
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&podcasts)

	meiliPodcastObjects := make([]map[string]interface{}, 0)
	for _, p := range podcasts {
		categoryIDs := make([]string, 0)
		for _, each := range p.Categories {
			categoryIDs = append(categoryIDs, each.ID.String())
		}

		meiliObj := map[string]interface{}{
			"object_id":           fmt.Sprint("podcast_", p.ID.String()),
			"id":                  p.ID.String(),
			"kind":                "podcast",
			"title":               p.Title,
			"slug":                p.Slug,
			"description":         p.Description,
			"language":            p.Language,
			"category_ids":        categoryIDs,
			"space_id":            p.SpaceID.String(),
			"primary_category_id": p.PrimaryCategoryID,
			"medium_id":           p.MediumID,
		}
		meiliPodcastObjects = append(meiliPodcastObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliPodcastObjects)

	return err
}

func AddEpisode(spaceID uuid.UUID) error {
	episodes := make([]podcastModel.Episode, 0)
	tx := config.DB.Model(&podcastModel.Episode{})
	if spaceID != uuid.Nil {
		tx.Where("space_id IN (?)", spaceID)
	}
	tx.Find(&episodes)

	meiliEpisodeObjects := make([]map[string]interface{}, 0)
	for _, e := range episodes {
		var publishedDate int64
		if e.PublishedDate == nil {
			publishedDate = 0
		} else {
			publishedDate = e.PublishedDate.Unix()
		}

		meiliObj := map[string]interface{}{
			"object_id":      fmt.Sprint("episode_", e.ID.String()),
			"id":             e.ID.String(),
			"kind":           "episode",
			"title":          e.Title,
			"slug":           e.Slug,
			"season":         e.Season,
			"episode":        e.Episode,
			"audio_url":      e.AudioURL,
			"podcast_id":     e.PodcastID,
			"description":    e.Description,
			"published_date": publishedDate,
			"space_id":       e.SpaceID.String(),
			"medium_id":      e.MediumID,
		}
		meiliEpisodeObjects = append(meiliEpisodeObjects, meiliObj)
	}

	_, err := config.MeilisearchClient.Index("dega").UpdateDocuments(meiliEpisodeObjects)

	return err
}
