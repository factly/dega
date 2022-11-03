package config

import (
	"log"

	"github.com/spf13/viper"
)

func SetupVars() {
	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.SetEnvPrefix("custom-search-service")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Println("config file not found...")
	}

	if !viper.IsSet("port") {
		log.Fatal("please provide port config param")
	}
}
