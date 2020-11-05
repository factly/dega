package config

import (
	"flag"
	"log"

	"github.com/spf13/viper"
)

// SetupVars setups all the config variables to run application
func SetupVars() {
	var configPath string

	flag.StringVar(&configPath, "config", "./config.yaml", "Config file path")
	flag.Parse()

	viper.SetConfigFile(configPath)

	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal("config file not found...")
	}

	if !viper.IsSet("postgres.dsn") {
		log.Fatal("please provide postgres.dsn in config file")
	}

	if !viper.IsSet("kavach.url") {
		log.Fatal("please provide kavach.url in config file")
	}

	if !viper.IsSet("keto.url") {
		log.Fatal("please provide keto.url in config file")
	}

	if !viper.IsSet("meili.url") {
		log.Fatal("please provide meili.url in config file")
	}

	if !viper.IsSet("meili.key") {
		log.Fatal("please provide meili.key in config file")
	}

	if !viper.IsSet("google.key") {
		log.Fatal("please provide google.key in config file")
	}

	if !viper.IsSet("kratos.public_url") {
		log.Fatal("please provide kratos.public_url in config file")
	}

}
