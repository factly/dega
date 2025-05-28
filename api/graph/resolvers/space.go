package resolvers

import (
	"context"
	"fmt"

	"github.com/factly/dega-api/config"
	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/google/uuid"
)

func (r *spaceResolver) ID(ctx context.Context, obj *models.Space) (string, error) {
	return fmt.Sprint(obj.ID), nil
}

func (r *spaceResolver) Logo(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.LogoID == uuid.Nil {
		return nil, nil
	}
	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.LogoID))
}

func (r *spaceResolver) LogoMobile(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.LogoMobileID == uuid.Nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.LogoMobileID))
}

func (r *spaceResolver) FavIcon(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.FavIconID == uuid.Nil {
		return nil, nil
	}

	return loaders.GetMediumLoader(ctx).Load(fmt.Sprint(obj.FavIconID))
}

func (r *spaceResolver) MobileIcon(ctx context.Context, obj *models.Space) (*models.Medium, error) {
	if obj.MobileIconID == uuid.Nil {
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

func (r *spaceResolver) HeaderCode(ctx context.Context, obj *models.Space) (*string, error) {
	return &obj.HeaderCode, nil
}

func (r *spaceResolver) FooterCode(ctx context.Context, obj *models.Space) (*string, error) {
	return &obj.FooterCode, nil
}

func (r *spaceResolver) MetaFields(ctx context.Context, obj *models.Space) (interface{}, error) {
	return obj.MetaFields, nil
}

func (r *queryResolver) Space(ctx context.Context) (*models.Space, error) {

	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	space := &models.Space{}

	err = config.DB.Model(&models.Space{}).Where(&models.Space{
		ID: sID,
	}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&space).Error

	if err != nil {
		return nil, err
	}

	return space, nil
}

func (r *Resolver) Space() generated.SpaceResolver { return &spaceResolver{r} }

type spaceResolver struct{ *Resolver }
