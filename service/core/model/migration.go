package model

import "github.com/factly/dega-server/config"

//Migration - core models
func Migration() {
	config.DB.AutoMigrate(
		&Medium{},
		&Category{},
		&Tag{},
		&Space{},
		&Format{},
		&Post{},
		&PostAuthor{},
	)

	config.DB.Model(&Category{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Category{}).AddForeignKey("space_id", "spaces(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Category{}).AddForeignKey("parent_id", "categories(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Format{}).AddForeignKey("space_id", "spaces(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Medium{}).AddForeignKey("space_id", "spaces(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Space{}).AddForeignKey("logo_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Space{}).AddForeignKey("logo_mobile_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Space{}).AddForeignKey("fav_icon_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Space{}).AddForeignKey("mobile_icon_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Post{}).AddForeignKey("featured_medium_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Post{}).AddForeignKey("format_id", "formats(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Post{}).AddForeignKey("space_id", "spaces(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&Tag{}).AddForeignKey("space_id", "spaces(id)", "RESTRICT", "RESTRICT")
}
