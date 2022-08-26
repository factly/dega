package util

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/x/loggerx"
)

func GetAllowedServices(spaceID uint) ([]string, error) {
	spacePermission := new(model.SpacePermission)
	err := config.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
		SpaceID: spaceID,
	}).First(spacePermission).Error
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
