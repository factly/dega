package resolvers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/factly/dega-api/graph/generated"
	"github.com/factly/dega-api/graph/loaders"
	"github.com/factly/dega-api/graph/models"
	"github.com/factly/dega-api/graph/validator"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
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

	log.Println(" Space resolver entry")

	sID, err := validator.GetSpace(ctx)
	if err != nil {
		return nil, err
	}

	spaceToken, err := validator.GetSpaceToken(ctx)
	if sID == 0 || err != nil {
		return nil, errors.New("invalid space token header")
	}

	url := fmt.Sprint(viper.GetString("kavach_url"), "/util/space/", sID, "/details")
	resp, err := requestx.Request("GET", url, nil, map[string]string{
		"Content-Type":  "application/json",
		"X-Space-Token": spaceToken,
	})

	if err != nil {
		return nil, errors.New("http request to kavach-server was unsuccessful")
	}
	
	spaceObjectfromKavach := &models.KavachSpace{}
	err = json.NewDecoder(resp.Body).Decode(spaceObjectfromKavach)
	if err != nil {
		return nil, err
	}

	spaceObjectforDega := &models.Space{}
	spaceObjectforDega.ID = spaceObjectfromKavach.ID
	spaceObjectforDega.CreatedAt = spaceObjectfromKavach.CreatedAt
	spaceObjectforDega.UpdatedAt = spaceObjectfromKavach.UpdatedAt
	spaceObjectforDega.DeletedAt = spaceObjectfromKavach.DeletedAt
	spaceObjectforDega.Name = spaceObjectfromKavach.Name
	spaceObjectforDega.Slug = spaceObjectfromKavach.Slug
	spaceObjectforDega.Description = spaceObjectfromKavach.Description
	err = json.Unmarshal(spaceObjectfromKavach.Metadata.RawMessage, &spaceObjectforDega)
	if err != nil {
		return nil, err
	}
	return spaceObjectforDega, nil
}

func (r *Resolver) Space() generated.SpaceResolver { return &spaceResolver{r} }

type spaceResolver struct{ *Resolver }
