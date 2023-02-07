package categories

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/newtest"
	"github.com/factly/dega-server/service/core/model"
)

func SetupDB() {
	newtest.SetupSqlite("./categories.db")
	config.DB.AutoMigrate(&model.Category{}, &model.Medium{})
	config.DB.Create(&model.Category{
		DescriptionHTML:  TestDescriptionHtml,
		Description:      TestDescriptionJson,
		Name:             Data.Name,
		Slug:             Data.Slug,
		BackgroundColour: Data.BackgroundColour,
		ParentID:         Data.ParentID,
		MediumID:         Data.MediumID,
		IsFeatured:       Data.IsFeatured,
		SpaceID:          Data.SpaceID,
		MetaFields:       Data.MetaFields,
		Meta:             Data.Meta,
		HeaderCode:       Data.HeaderCode,
		FooterCode:       Data.FooterCode,
	})
	config.DB.Create(&model.Medium{
		Name:        mediumData.Name,
		Slug:        mediumData.Slug,
		Type:        mediumData.Type,
		Title:       mediumData.Title,
		Description: mediumData.Description,
		Caption:     mediumData.Caption,
		AltText:     mediumData.AltText,
		FileSize:    mediumData.FileSize,
		URL:         mediumData.URL,
		Dimensions:  mediumData.Dimensions,
		SpaceID:     mediumData.SpaceID,
		MetaFields:  mediumData.MetaFields,
	})
}
