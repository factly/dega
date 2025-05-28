package config

import (
	"log"

	"github.com/spf13/viper"
)

// SetupVars setups all the config variables to run application
func SetupVars() {

	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.SetEnvPrefix("dega")
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

	if !viper.IsSet("zitadel_domain") {
		log.Fatal("please provide zitadel_domain config param")
	}

	if !viper.IsSet("zitadel_protocol") {
		log.Fatal("please provide zitadel_protocol config param")
	}

	if !viper.IsSet("zitadel_personal_access_token") {
		log.Fatal("please provide zitadel_personal_access_token config param")
	}

	if !viper.IsSet("zitadel_project_id") {
		log.Fatal("please provide zitadel_project_id config param")
	}

	if viper.IsSet("google_fact_check_search_enabled") && viper.GetBool("google_fact_check_search_enabled") {
		if !viper.IsSet("google_key") {
			log.Fatal("please provide google_key config param")
		}
	}

	if !viper.IsSet("create_super_organisation") {
		log.Fatal("please provide create_super_organisation (bool) config param")
	}

	if SearchEnabled() {
		if !viper.IsSet("meili_url") {
			log.Fatal("please provide meili_url config param")
		}

		if !viper.IsSet("meili_api_key") {
			log.Fatal("please provide meili_api_key config param")
		}
	}

	if CacheEnabled() {
		if !viper.IsSet("redis_address") {
			log.Fatal("please provide redis_address config param")
		}

		if !viper.IsSet("redis_password") {
			log.Fatal("please provide redis_password config param")
		}

		if !viper.IsSet("redis_db") {
			log.Fatal("please provide redis_db config param")
		}

		if !viper.IsSet("redis_cache_duration") {
			log.Fatal("please provide redis_cache_duration config param")
		}
	}

	if HukzEnabled() {
		if !viper.IsSet("hukz_url") {
			log.Fatal("please provide hukz_url config param")
		}
	}

}

func SearchEnabled() bool {
	return viper.IsSet("enable_search_indexing") && viper.GetBool("enable_search_indexing")
}

func Sqlite() bool {
	return viper.IsSet("use_sqlite") && viper.GetBool("use_sqlite") && false
}

func CacheEnabled() bool {
	return viper.IsSet("enable_cache") && viper.GetBool("enable_cache")
}

func HukzEnabled() bool {
	return viper.IsSet("enable_hukz") && viper.GetBool("enable_hukz")
}
