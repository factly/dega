package config

import (
	"log"

	"github.com/spf13/viper"
)

// DSN dsn
var DSN string

// KavachURL kavach server url
var KavachURL string

// KetoURL keto server url
var KetoURL string

// MeiliURL meili search server url
var MeiliURL string

// MeiliKey meili search server url
var MeiliKey string

//GoogleKey  google API Key string
var GoogleKey string

// SetupVars setups all the config variables to run application
func SetupVars() {
	viper.AddConfigPath(".")
	viper.SetConfigName("config")

	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal("config file not found...")
	}

	if viper.IsSet("postgres.dsn") {
		DSN = viper.GetString("postgres.dsn")
	} else {
		log.Fatal("please provide postgres.dsn in config file")
	}

	if viper.IsSet("kavach.url") {
		KavachURL = viper.GetString("kavach.url")
	} else {
		log.Fatal("please provide kavach.url in config file")
	}

	if viper.IsSet("keto.url") {
		KetoURL = viper.GetString("keto.url")
	} else {
		log.Fatal("please provide keto.url in config file")
	}

	if viper.IsSet("meili.url") {
		MeiliURL = viper.GetString("meili.url")
	} else {
		log.Fatal("please provide meili.url in config file")
	}

	if viper.IsSet("meili.key") {
		MeiliKey = viper.GetString("meili.key")
	} else {
		log.Fatal("please provide meili.key in config file")
	}

	if viper.IsSet("google.key") {
		GoogleKey = viper.GetString("google.key")
	} else {
		log.Fatal("please provide google.key in config file")
	}

}
