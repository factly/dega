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
	"github.com/factly/x/renderx"
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
// @Param X-Space header string true "Space ID"
// @Param space_id header string true "Space ID"
// @Param Space body space true "Space Object"
// @Success 200 {object} model.Space
// @Router /core/spaces/{space_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		errors.Parser(w, r, errors.InternalServerError, 500)
		return
	}

	spaceID := chi.URLParam(r, "space_id")
	id, err := strconv.Atoi(spaceID)

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

	result := &model.Space{}
	result.ID = uint(id)

	err = space.CheckSpaceUpdate(config.DB, uint(id))

	if err != nil {
		renderx.JSON(w, http.StatusBadRequest, err.Error)
		return
	}

	err = config.DB.Model(&result).Updates(model.Space{
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
		ContactInfo:       space.ContactInfo,
	}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&result).Error

	if err != nil {
		renderx.JSON(w, http.StatusInternalServerError, err)
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
