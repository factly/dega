package space

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"net/http"
	"strconv"

	"github.com/spf13/viper"

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
	//"github.com/factly/x/slugx"
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
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	applicationID, err := util.GetApplicationID(uint(uID), "dega")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	space := util.Space{}
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
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	buf := new(bytes.Buffer)

	requestBody := map[string]interface{}{
		"name":        space.Name,
		"description": space.Description,
		"slug":        space.Slug,
		"meta_fields": space.MetaFields,
	}
	err = json.NewEncoder(buf).Encode(&requestBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var superOrgID int
	superOrgID, err = middlewarex.GetSuperOrganisationID("Kavach")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if viper.GetBool("create_super_organisation") && viper.GetBool("organisation_permission_enabled") {
		// Fetch organisation permissions
		permission := model.OrganisationPermission{}
		err = config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
			OrganisationID: uint(space.OrganisationID),
		}).First(&permission).Error

		if err != nil && space.OrganisationID != superOrgID {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot create more spaces", http.StatusUnprocessableEntity)))
			return
		}

		// if err == nil {
		// 	// Fetch total number of spaces in organisation
		// 	// var totSpaces int64
		// 	// err = config.DB.Model(&model.Space{}).Where(&model.Space{
		// 	// 	OrganisationID: space.OrganisationID,
		// 	// }).Count(&totSpaces).Error
		// 	// if err != nil {
		// 	// 	loggerx.Error(err)
		// 	// 	errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		// 	// 	return
		// 	// }
		// 	// if totSpaces >= permission.Spaces && permission.Spaces > 0 {
		// 	// 	errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot create more spaces", http.StatusUnprocessableEntity)))
		// 	// 	return
		// 	// }
		// }
	}

	req, err := http.NewRequest("POST", viper.GetString("kavach_url")+"/organisations/"+fmt.Sprintf("%d", space.OrganisationID)+"/applications/"+fmt.Sprintf("%d", applicationID)+"/spaces", buf)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := httpx.CustomHttpClient()
	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != 201 {
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

	spaceSettings := &model.SpaceSettings{
		SpaceID:     spaceObjectfromKavach.ID,
		SiteAddress: space.SiteAddress,
		SiteTitle:   space.SiteTitle,
		TagLine:     space.TagLine,
	}
	err = config.DB.Model(&model.SpaceSettings{}).Create(spaceSettings).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	spaceObjectforDega := util.Space{}
	spaceObjectforDega.ID = spaceObjectfromKavach.ID
	spaceObjectforDega.CreatedAt = spaceObjectfromKavach.CreatedAt
	spaceObjectforDega.UpdatedAt = spaceObjectfromKavach.UpdatedAt
	spaceObjectforDega.DeletedAt = spaceObjectfromKavach.DeletedAt
	spaceObjectforDega.CreatedByID = spaceObjectfromKavach.CreatedByID
	spaceObjectforDega.UpdatedByID = spaceObjectfromKavach.UpdatedByID
	spaceObjectforDega.Name = spaceObjectfromKavach.Name
	spaceObjectforDega.Slug = spaceObjectfromKavach.Slug
	spaceObjectforDega.Description = spaceObjectfromKavach.Description
	spaceObjectforDega.MetaFields = spaceObjectfromKavach.MetaFields
	spaceObjectforDega.ApplicationID = spaceObjectfromKavach.ApplicationID
	spaceObjectforDega.OrganisationID = int(spaceObjectfromKavach.OrganisationID)
	spaceObjectforDega.SiteTitle = spaceSettings.SiteTitle
	spaceObjectforDega.TagLine = spaceSettings.TagLine
	spaceObjectforDega.SiteAddress = spaceSettings.SiteAddress

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	if viper.GetBool("create_super_organisation") {
		//Create SpacePermission for super organisation
		var spacePermission model.SpacePermission
		if superOrgID == space.OrganisationID {
			spacePermission = model.SpacePermission{
				SpaceID:   spaceObjectforDega.ID,
				Media:     -1,
				Posts:     -1,
				Podcast:   true,
				Episodes:  -1,
				FactCheck: true,
				Videos:    -1,
			}
		} else {
			if viper.GetBool("organisation_permission_enabled") {
				spacePermission = model.SpacePermission{
					SpaceID:   spaceObjectforDega.ID,
					Media:     viper.GetInt64("default_number_of_media"),
					Posts:     viper.GetInt64("default_number_of_posts"),
					Episodes:  viper.GetInt64("default_number_of_episodes"),
					Videos:    viper.GetInt64("default_number_of_videos"),
					Podcast:   false,
					FactCheck: false,
				}
			} else {
				spacePermission = model.SpacePermission{
					SpaceID:   spaceObjectforDega.ID,
					Media:     -1,
					Posts:     -1,
					Podcast:   true,
					Episodes:  -1,
					FactCheck: true,
					Videos:    -1,
				}
			}
		}

		if err = tx.Model(&model.SpacePermission{}).Create(&spacePermission).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":              spaceObjectforDega.ID,
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
		err = meilisearchx.AddDocument("dega", meiliObj)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()

	if util.CheckNats() {
		if err = util.NC.Publish("space.created", spaceObjectforDega); err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusCreated, spaceObjectforDega)

}
