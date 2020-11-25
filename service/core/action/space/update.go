package space

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/meili"
	"github.com/factly/dega-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
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
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	spaceID := chi.URLParam(r, "space_id")
	id, err := strconv.Atoi(spaceID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	space := &space{}

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

	if space.OrganisationID == 0 {
		return
	}

	err = util.CheckSpaceKetoPermission("update", uint(space.OrganisationID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Message{
			Code:    http.StatusUnauthorized,
			Message: err.Error(),
		}))
		return
	}

	result := model.Space{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	logoID := &space.LogoID
	result.LogoID = &space.LogoID
	if space.LogoID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"logo_id": nil}).Error
		logoID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	logoMobileID := &space.LogoMobileID
	result.LogoMobileID = &space.LogoMobileID
	if space.LogoMobileID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"logo_mobile_id": nil}).Error
		logoMobileID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	favIconID := &space.FavIconID
	result.FavIconID = &space.FavIconID
	if space.FavIconID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"fav_icon_id": nil}).Error
		favIconID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	mobileIconID := &space.MobileIconID
	result.MobileIconID = &space.MobileIconID
	if space.MobileIconID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"mobile_icon_id": nil}).Error
		mobileIconID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	var spaceSlug string
	if result.Slug == space.Slug {
		spaceSlug = result.Slug
	} else if space.Slug != "" && slug.Check(space.Slug) {
		spaceSlug = approveSpaceSlug(space.Slug)
	} else {
		spaceSlug = approveSpaceSlug(slug.Make(space.Name))
	}

	err = tx.Model(&result).Updates(model.Space{
		Base:              config.Base{UpdatedBy: uint(uID)},
		Name:              space.Name,
		SiteTitle:         space.SiteTitle,
		Slug:              spaceSlug,
		Description:       space.Description,
		TagLine:           space.TagLine,
		SiteAddress:       space.SiteAddress,
		LogoID:            logoID,
		FavIconID:         favIconID,
		MobileIconID:      mobileIconID,
		LogoMobileID:      logoMobileID,
		VerificationCodes: space.VerificationCodes,
		SocialMediaURLs:   space.SocialMediaURLs,
		ContactInfo:       space.ContactInfo,
	}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":              result.ID,
		"kind":            "space",
		"name":            result.Name,
		"slug":            result.Slug,
		"description":     result.Description,
		"site_title":      result.SiteTitle,
		"site_address":    result.SiteAddress,
		"tag_line":        result.TagLine,
		"organisation_id": result.OrganisationID,
	}

	err = meili.UpdateDocument(meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
