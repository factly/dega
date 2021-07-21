package config

import (
	"fmt"
	"log"
	"time"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
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

	var dialector gorm.Dialector
	if Sqlite() {
		dialector = sqlite.Open(viper.GetString("sqlite_db_path"))
	} else {
		dialector = postgres.Open(dbString)
	}

	var err error
	DB, err = gorm.Open(dialector, &gorm.Config{
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

	sqlDB, _ := DB.DB()

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	fmt.Println("connected to database ...")
}
