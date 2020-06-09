package space

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
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
		return
	}

	space := &space{}

	json.NewDecoder(r.Body).Decode(&space)

	if space.OrganisationID == 0 {
		return
	}

	req, err := http.NewRequest("GET", os.Getenv("KAVACH_URL")+"/organizations/"+strconv.Itoa(space.OrganisationID), nil)
	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	org := orgWithSpace{}

	err = json.Unmarshal(body, &org)

	if org.Permission.Role != "owner" {
		return
	}

	result := &model.Space{
		Name:              space.Name,
		SiteTitle:         space.SiteTitle,
		Slug:              space.Slug,
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

	render.JSON(w, http.StatusCreated, result)
}
