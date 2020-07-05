package space

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/slug"
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
		errors.Parser(w, r, errors.InternalServerError, 500)
		return
	}

	space := &space{}

	json.NewDecoder(r.Body).Decode(&space)

	validationError := validationx.Check(space)

	if validationError != nil {
		renderx.JSON(w, http.StatusBadRequest, validationError)
		return
	}

	if space.OrganisationID == 0 {
		return
	}

	req, err := http.NewRequest("GET", os.Getenv("KAVACH_URL")+"/organizations/"+strconv.Itoa(space.OrganisationID), nil)
	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		errors.Parser(w, r, err.Error(), 503)
		return
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	org := orgWithSpace{}

	err = json.Unmarshal(body, &org)

	if org.Permission.Role != "owner" {
		return
	}

	var spaceSlug string
	if space.Slug != "" && slug.Check(space.Slug) {
		spaceSlug = space.Slug
	} else {
		spaceSlug = slug.Make(space.Name)
	}

	result := &model.Space{
		Name:              space.Name,
		SiteTitle:         space.SiteTitle,
		Slug:              slug.Approve(spaceSlug, 0, config.DB.NewScope(&model.Space{}).TableName()),
		Description:       space.Description,
		TagLine:           space.TagLine,
		SiteAddress:       space.SiteAddress,
		LogoID:            space.LogoID,
		FavIconID:         space.FavIconID,
		MobileIconID:      space.MobileIconID,
		LogoMobileID:      space.LogoMobileID,
		VerificationCodes: space.VerificationCodes,
		SocialMediaURLs:   space.SocialMediaURLs,
		OrganisationID:    space.OrganisationID,
		ContactInfo:       space.ContactInfo,
	}

	err = config.DB.Create(&result).Error

	if err != nil {
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
