package space

import (
	//"context"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
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

	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	applicationID, err := util.GetApplicationID(uint(uID), "dega")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	space := &model.Space{}
	err = json.NewDecoder(r.Body).Decode(&space)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	space.ID = uint(spaceID)
	validationError := validationx.Check(space)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	requestBody := map[string]interface{}{
		"name":        space.Name,
		"slug":        space.Slug,
		"description": space.Description,
		"metadata": map[string]interface{}{
			"meta_fields":        space.MetaFields,
			"site_address":       space.SiteAddress,
			"tag_line":           space.TagLine,
			"site_title":         space.SiteTitle,
			"logo_id":            space.LogoID,
			"logo_mobile_id":     space.LogoMobileID,
			"fav_icon_id":        space.FavIconID,
			"mobile_icon_id":     space.MobileIconID,
			"verification_codes": space.VerificationCodes,
			"social_media_urls":  space.SocialMediaURLs,
			"contact_info":       space.ContactInfo,
			"analytics":          space.Analytics,
			"header_code":        space.HeaderCode,
			"footer_code":        space.FooterCode,
		},
	}
	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(&requestBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	client := httpx.CustomHttpClient()
	req, err := http.NewRequest("PUT", viper.GetString("kavach_url")+"/organisations/"+fmt.Sprintf("%d", space.OrganisationID)+"/applications/"+fmt.Sprintf("%d", applicationID)+"/spaces/"+fmt.Sprintf("%d", spaceID), buf)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	spaceObjectfromKavach := &model.KavachSpace{}
	err = json.NewDecoder(resp.Body).Decode(spaceObjectfromKavach)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	spaceObjectforDega := model.Space{}
	spaceObjectforDega.ID = spaceObjectfromKavach.ID
	spaceObjectforDega.CreatedAt = spaceObjectfromKavach.CreatedAt
	spaceObjectforDega.UpdatedAt = spaceObjectfromKavach.UpdatedAt
	spaceObjectforDega.DeletedAt = spaceObjectfromKavach.DeletedAt
	spaceObjectforDega.CreatedByID = spaceObjectfromKavach.CreatedByID
	spaceObjectforDega.UpdatedByID = spaceObjectfromKavach.UpdatedByID
	spaceObjectforDega.Name = spaceObjectfromKavach.Name
	spaceObjectforDega.Slug = spaceObjectfromKavach.Slug
	spaceObjectforDega.Description = spaceObjectfromKavach.Description
	spaceObjectforDega.ApplicationID = spaceObjectfromKavach.ApplicationID
	spaceObjectforDega.OrganisationID = int(spaceObjectfromKavach.OrganisationID)
	err = json.Unmarshal(spaceObjectfromKavach.Metadata.RawMessage, &spaceObjectforDega)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":              sID,
		"kind":            "space",
		"name":            spaceObjectforDega.Name,
		"slug":            spaceObjectforDega.Slug,
		"description":     spaceObjectforDega.Description,
		"site_title":      spaceObjectforDega.SiteTitle,
		"site_address":    spaceObjectforDega.SiteAddress,
		"tag_line":        spaceObjectforDega.TagLine,
		"organisation_id": spaceObjectforDega.OrganisationID,
		"analytics":       spaceObjectforDega.Analytics,
	}

	if config.SearchEnabled() {
		err = meilisearchx.UpdateDocument("dega", meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	//tx.Commit()

	if util.CheckNats() {
		if util.CheckWebhookEvent("space.updated", spaceID, r) {
			if err = util.NC.Publish("space.updated", result); err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

	}

	renderx.JSON(w, http.StatusOK, spaceObjectforDega)
}
