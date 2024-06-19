package space

import (
	"context"
	"encoding/json"
	"errors"

	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create space
// @Summary Create space
// @Description Create space
// @Tags Space
// @ID add-space
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Space body space true "Space Object"
// @Success 201 {object} model.Space
// @Router /core/spaces [post]
func create(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	space := space{}
	err = json.NewDecoder(r.Body).Decode(&space)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(space)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &model.Space{
		Name:              space.Name,
		Slug:              space.Slug,
		SiteTitle:         space.SiteTitle,
		TagLine:           space.TagLine,
		Description:       space.Description,
		SiteAddress:       space.SiteAddress,
		VerificationCodes: space.VerificationCodes,
		SocialMediaURLs:   space.SocialMediaURLs,
		ContactInfo:       space.ContactInfo,
		Analytics:         space.Analytics,
		HeaderCode:        space.HeaderCode,
		FooterCode:        space.FooterCode,
		MetaFields:        space.MetaFields,
		// OrganisationID:    space.OrganisationID,
	}

	if space.LogoID != nil {
		result.LogoID = space.LogoID
	}

	if space.LogoMobileID != nil {
		result.LogoMobileID = space.LogoMobileID
	}

	if space.FavIconID != nil {
		result.FavIconID = space.FavIconID
	}

	if space.MobileIconID != nil {
		result.MobileIconID = space.MobileIconID
	}

	err = config.DB.Model(&model.Space{}).Create(result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":              result.ID,
		"kind":            "space",
		"name":            result.Name,
		"slug":            result.Slug,
		"site_title":      result.SiteTitle,
		"tag_line":        result.TagLine,
		"description":     result.Description,
		"site_address":    result.SiteAddress,
		"organisation_id": result.OrganisationID,
	}

	if config.SearchEnabled() {
		err = meilisearchx.AddDocument("dega", meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("space.created", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusCreated, result)

}
