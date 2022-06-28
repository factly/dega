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
	// dbString := "postgresql://root@crdb:26257/dega?sslmode=disable"
	// dbString := "postgresql://root@crdb:26257/dega?sslmode=disable"
	dbString := fmt.Sprintf("postgresql://root@%s:%s/%s?sslmode=%s", viper.GetString("database_host"), viper.GetString("database_port"), viper.GetString("database_name"), viper.GetString("database_ssl_mode"))
	var err error

	// if Sqlite() {
	// 	dialector = sqlite.Open(viper.GetString("sqlite_db_path"))
	// } else {
	dialector := postgres.Open(dbString)
	//}

	DB, err = gorm.Open(dialector, &gorm.Config{
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
