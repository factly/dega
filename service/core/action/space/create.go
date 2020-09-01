package space

import (
	"encoding/json"
	"errors"
	"io/ioutil"
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
)

// create - Create space
// @Summary Create space
// @Description Create space
// @Tags Space
// @ID add-space
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Space body space true "Space Object"
// @Success 201 {object} model.Space
// @Router /core/spaces [post]
func create(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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

	req, err := http.NewRequest("GET", config.KavachURL+"/organisations/"+strconv.Itoa(space.OrganisationID), nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	org := orgWithSpace{}

	err = json.Unmarshal(body, &org)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	if org.Permission.Role != "owner" {
		return
	}

	var spaceSlug string
	if space.Slug != "" && slug.Check(space.Slug) {
		spaceSlug = space.Slug
	} else {
		spaceSlug = slug.Make(space.Name)
	}

	result := model.Space{
		Name:              space.Name,
		SiteTitle:         space.SiteTitle,
		Slug:              slug.Approve(spaceSlug, 0, config.DB.NewScope(&model.Space{}).TableName()),
		Description:       space.Description,
		TagLine:           space.TagLine,
		SiteAddress:       space.SiteAddress,
		VerificationCodes: space.VerificationCodes,
		SocialMediaURLs:   space.SocialMediaURLs,
		OrganisationID:    space.OrganisationID,
		ContactInfo:       space.ContactInfo,
	}

	err = config.DB.Create(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Insert into meili index
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
		"logo_id":         result.LogoID,
		"logo_mobile_id":  result.LogoMobileID,
		"fav_icon_id":     result.FavIconID,
		"mobile_icon_id":  result.MobileIconID,
	}

	err = meili.AddDocument(meiliObj)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
