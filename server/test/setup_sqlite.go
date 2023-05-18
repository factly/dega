package test

import (
	"github.com/factly/dega-server/config"
	"github.com/spf13/viper"
)

func SetupSqlite(path string) {
	viper.Set("sqlite_db_path", path)
	viper.Set("use_sqlite", true)
	config.SetupDB()
}
