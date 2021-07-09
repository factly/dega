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

	if !viper.IsSet("create_super_organisation") {
		log.Fatal("please provide create_super_organisation (bool) config param")
	}

	if viper.GetBool("create_super_organisation") {
		if !viper.IsSet("kratos_public_url") {
			log.Fatal("please provide kratos_public_url config param")
		}
	}
}
