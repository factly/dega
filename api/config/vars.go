package config

import (
	"log"

	"github.com/factly/dega-api/util/cache"
	"github.com/spf13/viper"
)

// SetupVars setups all the config variables to run application
func SetupVars() {

	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.SetEnvPrefix("dega_api")
	viper.AutomaticEnv()
	err := viper.ReadInConfig()
	if err != nil {
		log.Println("config file not found...")
	}

	if !viper.IsSet("database_host") {
		log.Fatal("please provide database_host config param")
	}

	if !viper.IsSet("database_user") {
		log.Fatal("please provide database_user config param")
	}

	if !viper.IsSet("database_name") {
		log.Fatal("please provide database_name config param")
	}

	if !viper.IsSet("database_password") {
		log.Fatal("please provide database_password config param")
	}

	if !viper.IsSet("database_port") {
		log.Fatal("please provide database_port config param")
	}

	if !viper.IsSet("database_ssl_mode") {
		log.Fatal("please provide database_ssl_mode config param")
	}

	if !viper.IsSet("kavach_url") {
		log.Fatal("please provide kavach_url config param")
	}

	if !viper.IsSet("enable_cache") {
		log.Fatal("please provide enable_cache config param")
	}

	if cache.IsEnabled() {
		if !viper.IsSet("redis_url") {
			log.Fatal("please provide redis_url config param")
		}

		if !viper.IsSet("redis_password") {
			log.Fatal("please provide redis_password config param")
		}
	}

	if SearchEnabled() {
		if !viper.IsSet("meili_url") {
			log.Fatal("please provide meili_url config param")
		}

		if !viper.IsSet("meili_api_key") {
			log.Fatal("please provide meili_key config param")
		}
	}

	if Sqlite() {
		if !viper.IsSet("sqlite_db_path") {
			log.Fatal("please provide sqlite_db_path config param")
		}
	}
}

func SearchEnabled() bool {
	return viper.IsSet("enable_search_indexing") && viper.GetBool("enable_search_indexing")
}

func Sqlite() bool {
	return viper.IsSet("use_sqlite") && viper.GetBool("use_sqlite")
}
