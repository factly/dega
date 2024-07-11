package resolvers

import (
	"context"
	"fmt"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/dega-api/util"
)

func (r *queryResolver) Sitemap(ctx context.Context) (*models.Sitemaps, error) {
	var ok models.Sitemaps = "OKAY"
	return &ok, nil
}

func (r *sitemapsResolver) Categories(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	categories := []models.Category{}

	config.DB.Model(&models.Category{}).Where("space_id in (?)", sID).Find(&categories)
	nodes := []*models.Sitemap{}

	for _, category := range categories {
		sitemap := &models.Sitemap{
			ID:        fmt.Sprint(category.ID),
			Slug:      category.Slug,
			CreatedAt: category.CreatedAt,
			UpdatedAt: category.UpdatedAt,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

func (r *sitemapsResolver) Tags(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	tags := []models.Tag{}

	config.DB.Model(&models.Tag{}).Where("space_id in (?)", sID).Find(&tags)
	nodes := []*models.Sitemap{}

	for _, tag := range tags {
		sitemap := &models.Sitemap{
			ID:        fmt.Sprint(tag.ID),
			Slug:      tag.Slug,
			CreatedAt: tag.CreatedAt,
			UpdatedAt: tag.UpdatedAt,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

func (r *sitemapsResolver) Users(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {

	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, nil
	}

	space := &models.Space{}
	space.ID = sID

	err = config.DB.First(space).Error
	if err != nil {
		return nil, nil
	}

	// Get space members

	spaceMember := []models.SpaceUser{}
	config.DB.Model(&models.SpaceUser{}).Where("space_id = ?", sID).Find(&spaceMember)

	// Get user ids
	userIDs := make([]string, 0)
	for _, member := range spaceMember {
		userIDs = append(userIDs, member.UserID)
	}

	users, err := util.GetSpaceMembers(userIDs)

	if err != nil {
		return nil, nil
	}

	nodes := []*models.Sitemap{}

	for _, user := range users {
		sitemap := &models.Sitemap{
			ID:   fmt.Sprint(user.ID),
			Slug: user.Human.Profile.DisplayName,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

func (r *sitemapsResolver) Formats(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	formats := []models.Format{}

	config.DB.Model(&models.Format{}).Where("space_id in (?)", sID).Find(&formats)
	nodes := []*models.Sitemap{}

	for _, format := range formats {
		sitemap := &models.Sitemap{
			ID:        fmt.Sprint(format.ID),
			Slug:      format.Slug,
			CreatedAt: format.CreatedAt,
			UpdatedAt: format.UpdatedAt,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

func (r *sitemapsResolver) Posts(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	posts := []models.Post{}

	config.DB.Model(&models.Post{}).Where("space_id in (?)", sID).Find(&posts)
	nodes := []*models.Sitemap{}

	for _, post := range posts {
		var publishedDate time.Time
		if post.PublishedDate == nil {
			publishedDate = time.Time{}
		} else {
			publishedDate = *post.PublishedDate
		}

		sitemap := &models.Sitemap{
			ID:          fmt.Sprint(post.ID),
			Slug:        post.Slug,
			CreatedAt:   post.CreatedAt,
			UpdatedAt:   post.UpdatedAt,
			PublishedAt: publishedDate,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

func (r *sitemapsResolver) Claims(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	claims := []models.Claim{}

	config.DB.Model(&models.Claim{}).Where("space_id in (?)", sID).Find(&claims)
	nodes := []*models.Sitemap{}

	for _, claim := range claims {
		sitemap := &models.Sitemap{
			ID:        fmt.Sprint(claim.ID),
			Slug:      claim.Slug,
			CreatedAt: claim.CreatedAt,
			UpdatedAt: claim.UpdatedAt,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

func (r *sitemapsResolver) Claimants(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	claimants := []models.Claimant{}

	config.DB.Model(&models.Claimant{}).Where("space_id in (?)", sID).Find(&claimants)
	nodes := []*models.Sitemap{}

	for _, claimant := range claimants {
		sitemap := &models.Sitemap{
			ID:        fmt.Sprint(claimant.ID),
			Slug:      claimant.Slug,
			CreatedAt: claimant.CreatedAt,
			UpdatedAt: claimant.UpdatedAt,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

func (r *sitemapsResolver) Ratings(ctx context.Context, obj *models.Sitemaps) ([]*models.Sitemap, error) {
	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}
	ratings := []models.Rating{}

	config.DB.Model(&models.Rating{}).Where("space_id in (?)", sID).Find(&ratings)
	nodes := []*models.Sitemap{}

	for _, rating := range ratings {
		sitemap := &models.Sitemap{
			ID:        fmt.Sprint(rating.ID),
			Slug:      rating.Slug,
			CreatedAt: rating.CreatedAt,
			UpdatedAt: rating.UpdatedAt,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

// Sitemaps model resolver
func (r *Resolver) Sitemaps() generated.SitemapsResolver { return &sitemapsResolver{r} }

type sitemapsResolver struct{ *Resolver }
