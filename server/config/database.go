package config

import (
	"fmt"
	"log"
	"time"

	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB() {

	fmt.Println("connecting to database ...")

	dbString := fmt.Sprint("host=", viper.GetString("database_host"), " ",
		"user=", viper.GetString("database_user"), " ",
		"password=", viper.GetString("database_password"), " ",
		"dbname=", viper.GetString("database_name"), " ",
		"port=", viper.GetInt("database_port"), " ",
		"sslmode=", viper.GetString("database_ssl_mode"))

	var err error
	DB, err = gorm.Open(postgres.Open(dbString), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix: "de_",
		},
		Logger: loggerx.NewGormLogger(logger.Config{
			SlowThreshold: 200 * time.Millisecond,
			LogLevel:      logger.Info,
			Colorful:      true,
		}),
	})

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("connected to database ...")
}
