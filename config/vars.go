package config

import (
	"log"

	"github.com/spf13/viper"
)

// SetupVars setups all the config variables to run application
func SetupVars() {

	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Println("config file not found...")
	}

	if !viper.IsSet("dsn") {
		log.Fatal("please provide postgres_dsn config param")
	}

	if !viper.IsSet("kavach_url") {
		log.Fatal("please provide kavach_url config param")
	}

	if !viper.IsSet("keto_url") {
		log.Fatal("please provide keto_url config param")
	}

	if !viper.IsSet("meili_url") {
		log.Fatal("please provide meili_url config param")
	}

	if !viper.IsSet("meili_key") {
		log.Fatal("please provide meili_key config param")
	}

	if !viper.IsSet("google_key") {
		log.Fatal("please provide google_key config param")
	}

	if !viper.IsSet("kratos_public_url") {
		log.Fatal("please provide kratos_public_url config param")
	}

	if !viper.IsSet("super_organisation") {
		log.Fatal("please provide super_organisation (bool) config param")
	}

}
