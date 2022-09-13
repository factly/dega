package util

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/spf13/viper"
)

func GetAllowedServices(spaceID, orgID, userID uint) ([]string, error) {
	superOrgID, err := middlewarex.GetSuperOrganisationID("Kavach")
	if err != nil {
		return nil, err
	}
	err = createSpacePermissionIfDoesNotExist(spaceID, superOrgID == int(orgID), userID)
	if err != nil {
		return nil, err
	}

	spacePermission := new(model.SpacePermission)
	err = config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
		SpaceID: spaceID,
	}).Find(spacePermission).Error
	if err != nil {
		if !(err.Error() == "record not found") {
			loggerx.Error(err)
			return nil, err
		}
	}

	var serviceList []string
	serviceList = append(serviceList, "core")
	if spacePermission.FactCheck {
		serviceList = append(serviceList, "fact-checking")
	}
	if spacePermission.Podcast {
		serviceList = append(serviceList, "podcast")
	}

	return serviceList, nil
}

func createSpacePermissionIfDoesNotExist(spaceID uint, isSuperOrg bool, userID uint) error {
	var count int64
	err := config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
		SpaceID: spaceID,
	}).Count(&count).Error
	if err != nil {
		return err
	}

	if count == 1 {
		return nil
	}

	if count == 0 {
		var spacePermission model.SpacePermission
		if isSuperOrg {
			spacePermission = model.SpacePermission{
				Base: config.Base{
					CreatedByID: userID,
				},
				SpaceID:   spaceID,
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
					SpaceID:   spaceID,
					Media:     viper.GetInt64("default_number_of_media"),
					Posts:     viper.GetInt64("default_number_of_posts"),
					Episodes:  viper.GetInt64("default_number_of_episodes"),
					Videos:    viper.GetInt64("default_number_of_videos"),
					Podcast:   false,
					FactCheck: false,
				}
			} else {
				spacePermission = model.SpacePermission{
					SpaceID:   spaceID,
					Media:     -1,
					Posts:     -1,
					Podcast:   true,
					Episodes:  -1,
					FactCheck: true,
					Videos:    -1,
				}
			}
		}
		if err = config.DB.Model(&model.SpacePermission{}).Create(&spacePermission).Error; err != nil {
			return err
		}
	}
	return nil
}
