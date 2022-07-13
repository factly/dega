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
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
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
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusUnauthorized)))
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
	var spaceSlug string
	if result.Slug == space.Slug {
		spaceSlug = result.Slug
	} else if space.Slug != "" && slugx.Check(space.Slug) {
		spaceSlug = approveSpaceSlug(space.Slug)
	} else {
		spaceSlug = approveSpaceSlug(slugx.Make(space.Name))
	}
	updateMap := map[string]interface{}{
		"name":               space.Name,
		"slug":               spaceSlug,
		"site_title":         space.SiteTitle,
		"tag_line":           space.TagLine,
		"site_address":       space.SiteAddress,
		"description":        space.Description,
		"logo_id":            space.LogoID,
		"logo_mobile_id":     space.LogoMobileID,
		"fav_icon_id":        space.FavIconID,
		"mobile_icon_id":     space.MobileIconID,
		"header_code":        space.HeaderCode,
		"footer_code":        space.FooterCode,
		"meta_fields":        space.MetaFields,
		"verification_codes": space.VerificationCodes,
		"social_media_urls":  space.SocialMediaURLs,
		"contact_info":       space.ContactInfo,
		"analytics":          space.Analytics,
	}

	// check if the id for all the mediums in space is 0 or not if it is zero then make it null
	if space.LogoID == 0 {
		updateMap["logo_id"] = nil
	}

	if space.LogoMobileID == 0 {
		updateMap["logo_mobile_id"] = nil
	}

	if space.FavIconID == 0 {
		updateMap["fav_icon_id"] = nil
	}

	if space.MobileIconID == 0 {
		updateMap["mobile_icon_id"] = nil
	}

	err = tx.Model(&result).Updates(&updateMap).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&result).Error

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
		"analytics":       result.Analytics,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.UpdateDocument("dega", meiliObj)
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
