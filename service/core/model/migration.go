package model

import "github.com/factly/dega-server/config"

//Migration - core models
func Migration() {
	_ = config.DB.AutoMigrate(
		&Medium{},
		&Category{},
		&Tag{},
		&Space{},
		&Format{},
		&Post{},
		&PostAuthor{},
	)
}
