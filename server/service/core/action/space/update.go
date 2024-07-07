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
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// update - Update space
// @Summary Update space
// @Description Update space
// @Tags Space
// @ID update-space
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param Space body space true "Space Object"
// @Success 200 {object} model.Space
// @Router /core/spaces/{space_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	id, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	space := space{}
	err = json.NewDecoder(r.Body).Decode(&space)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result := &model.Space{
		Base: config.Base{ID: id},
	}

	err = config.DB.Model(&model.Space{}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	validationError := validationx.Check(space)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result.Name = space.Name
	result.Slug = space.Slug
	result.Description = space.Description
	result.SiteTitle = space.SiteTitle
	result.TagLine = space.TagLine
	result.SiteAddress = space.SiteAddress
	result.VerificationCodes = space.VerificationCodes
	result.SocialMediaURLs = space.SocialMediaURLs
	result.ContactInfo = space.ContactInfo
	result.Analytics = space.Analytics
	result.HeaderCode = space.HeaderCode
	result.FooterCode = space.FooterCode
	result.MetaFields = space.MetaFields
	result.OrganisationID = space.OrganisationID

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

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	err = tx.Model(&model.Space{}).Updates(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("space.updated", result); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, result)

}
