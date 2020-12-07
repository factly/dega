package config

import (
	"fmt"
	"log"
	"time"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB() {

	fmt.Println("connecting to database ...")

	var err error
	DB, err = gorm.Open(postgres.Open(viper.GetString("postgres.dsn")), &gorm.Config{
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
