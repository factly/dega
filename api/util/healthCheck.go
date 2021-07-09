package util

import (
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
)

func KavachChecker() error {
	_, err := requestx.Request("GET", viper.GetString("kavach_url")+"/health/ready", nil, nil)
	return err
}
