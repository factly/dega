package resolvers

import (
	"context"
	"fmt"
	"time"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"gorm.io/gorm"
)

func (r *spaceResolver) ID(ctx context.Context, obj *models.Space) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *spaceResolver) Logo(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.LogoID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.LogoID))
}

func (r *spaceResolver) LogoMobile(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.LogoMobileID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.LogoMobileID))
}

func (r *spaceResolver) FavIcon(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.FavIconID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.FavIconID))
}

func (r *spaceResolver) MobileIcon(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.MobileIconID == 0 {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.MobileIconID))
}

func (r *spaceResolver) VerificationCodes(ctx context.Context, obj *models.Space) (interface{}, error) {
	return obj.VerificationCodes, nil
}

func (r *spaceResolver) SocialMediaUrls(ctx context.Context, obj *models.Space) (interface{}, error) {
	return obj.SocialMediaURLs, nil
}
func (r *spaceResolver) ContactInfo(ctx context.Context, obj *models.Space) (interface{}, error) {
	return obj.ContactInfo, nil
}

func (r *queryResolver) Space(ctx context.Context) (*models.Space, error) {

	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	result := &models.Space{}

	ctxTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	config.DB.Session(&gorm.Session{Context: ctxTimeout}).Where(&models.Space{
		ID: sID,
	}).First(&result)

	return result, nil
}

func (r *Resolver) Space() generated.SpaceResolver { return &spaceResolver{r} }

type spaceResolver struct{ *Resolver }
