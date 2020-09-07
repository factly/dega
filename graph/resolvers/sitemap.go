package resolvers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
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
			ID:          fmt.Sprint(category.ID),
			Slug:        category.Slug,
			CreatedDate: category.CreatedDate,
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
			ID:          fmt.Sprint(tag.ID),
			Slug:        tag.Slug,
			CreatedDate: tag.CreatedDate,
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

	post := &models.Post{}
	post.SpaceID = sID

	err = config.DB.First(post).Error
	if err != nil {
		return nil, nil
	}

	postAuthor := &models.PostAuthor{}
	postAuthor.PostID = post.ID

	err = config.DB.First(postAuthor).Error
	if err != nil {
		return nil, nil
	}

	space := &models.Space{}
	space.ID = sID

	err = config.DB.First(space).Error
	if err != nil {
		return nil, nil
	}

	url := fmt.Sprint(config.KavachURL, "/organisations/", space.OrganisationID, "/users")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, nil
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", fmt.Sprint(postAuthor.AuthorID))
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, nil
	}

	defer resp.Body.Close()

	users := []*models.User{}
	err = json.NewDecoder(resp.Body).Decode(&users)

	if err != nil {
		return nil, nil
	}

	nodes := []*models.Sitemap{}

	for _, user := range users {
		sitemap := &models.Sitemap{
			ID:          fmt.Sprint(user.ID),
			Slug:        fmt.Sprint(user.ID),
			CreatedDate: user.CreatedDate,
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
			ID:          fmt.Sprint(format.ID),
			Slug:        format.Slug,
			CreatedDate: format.CreatedDate,
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
		sitemap := &models.Sitemap{
			ID:          fmt.Sprint(post.ID),
			Slug:        post.Slug,
			CreatedDate: post.CreatedDate,
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
			ID:          fmt.Sprint(claim.ID),
			Slug:        claim.Slug,
			CreatedDate: claim.CreatedDate,
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
			ID:          fmt.Sprint(claimant.ID),
			Slug:        claimant.Slug,
			CreatedDate: claimant.CreatedDate,
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
			ID:          fmt.Sprint(rating.ID),
			Slug:        rating.Slug,
			CreatedDate: rating.CreatedDate,
		}
		nodes = append(nodes, sitemap)
	}
	return nodes, nil
}

// Sitemaps model resolver
func (r *Resolver) Sitemaps() generated.SitemapsResolver { return &sitemapsResolver{r} }

type sitemapsResolver struct{ *Resolver }
