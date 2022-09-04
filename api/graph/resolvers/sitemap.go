package resolvers

import (
	"context"
	"time"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/models"
)

func (r *sitemapResolver) PublishedDate(ctx context.Context, obj *models.Sitemap) (*time.Time, error) {
	return &obj.PublishedAt, nil
}

func (r *Resolver) Sitemap() generated.SitemapResolver { return &sitemapResolver{r} }

type sitemapResolver struct{ *Resolver }