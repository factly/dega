package space

import (
	"bytes"
	"context"
	"encoding/json"

	"fmt"
	"net/http"
	"strconv"

	"github.com/spf13/viper"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
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

	space := map[string]interface{}{}

	err = json.NewDecoder(r.Body).Decode(&space)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	// err = util.CheckSpaceKetoPermission("create", uint(space.OrganisationID), uint(uID))
	// if err != nil {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusUnauthorized)))
	// 	return
	// }

	// validationError := validationx.Check(space)

	// if validationError != nil {
	// 	loggerx.Error(errors.New("validation error"))
	// 	errorx.Render(w, validationError)
	// 	return
	// }

	spaceOrgID := int(space["organisation_id"].(float64))
	if spaceOrgID == 0 {
		return
	}

	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(&space)
	fmt.Println(space, "spacetestnew")
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req, err := http.NewRequest("POST", viper.GetString("kavach_url")+"/organisations/"+strconv.Itoa(spaceOrgID)+"/applications/"+viper.GetString("dega_application_id")+"/spaces", buf)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	fmt.Println(resp.Status, "resp status")
	result := &model.Space{}
	err = json.NewDecoder(resp.Body).Decode(result)
	if err != nil {
		loggerx.Error(err)
		return
	}
	fmt.Println(resp)

	var superOrgID int
	if viper.GetBool("create_super_organisation") {
		superOrgID, err = middlewarex.GetSuperOrganisationID("dega")
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		// Fetch organisation permissions
		permission := model.OrganisationPermission{}
		err = config.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
			OrganisationID: uint(spaceOrgID),
		}).First(&permission).Error

		if err != nil && spaceOrgID != superOrgID {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot create more spaces", http.StatusUnprocessableEntity)))
			return
		}

		if err == nil {
			// Fetch total number of spaces in organisation
			var totSpaces int64
			config.DB.Model(&model.Space{}).Where(&model.Space{
				OrganisationID: spaceOrgID,
			}).Count(&totSpaces)

			if totSpaces >= permission.Spaces && permission.Spaces > 0 {
				errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot create more spaces", http.StatusUnprocessableEntity)))
				return
			}
		}
	}

	tx := config.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	if viper.GetBool("create_super_organisation") {
		// Create SpacePermission for super organisation
		var spacePermission model.SpacePermission
		if superOrgID == spaceOrgID {
			spacePermission = model.SpacePermission{
				SpaceID:   result.ID,
				Media:     -1,
				Posts:     -1,
				Podcast:   true,
				Episodes:  -1,
				FactCheck: true,
				Videos:    -1,
			}
		} else {
			spacePermission = model.SpacePermission{
				SpaceID:   result.ID,
				Media:     viper.GetInt64("default_number_of_media"),
				Posts:     viper.GetInt64("default_number_of_posts"),
				Episodes:  viper.GetInt64("default_number_of_episodes"),
				Videos:    viper.GetInt64("default_number_of_videos"),
				Podcast:   false,
				FactCheck: false,
			}
		}
		var spacePermContext config.ContextKey = "space_perm_user"
		if err = tx.WithContext(context.WithValue(r.Context(), spacePermContext, uID)).Create(&spacePermission).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

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
		"analytics":       result.Analytics,
	}

	if config.SearchEnabled() {
		_ = meilisearchx.AddDocument("dega", meiliObj)
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

func approveSpaceSlug(slug string) string {
	spaceList := make([]model.Space, 0)
	config.DB.Model(&model.Space{}).Where("slug LIKE ? AND deleted_at IS NULL", slug+"%").Find(&spaceList)

	count := 0
	for {
		flag := true
		for _, each := range spaceList {
			temp := slug
			if count != 0 {
				temp = temp + "-" + strconv.Itoa(count)
			}
			if each.Slug == temp {
				flag = false
				break
			}
		}
		if flag {
			break
		}
		count++
	}
	temp := slug
	if count != 0 {
		temp = temp + "-" + strconv.Itoa(count)
	}
	return temp
}
