package config

import (
	"fmt"
	"log"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB(dsn interface{}) {

	fmt.Println("connecting to database ...")
	var err error
	DB, err = gorm.Open("postgres", dsn)

	if err != nil {
		log.Fatal(err)
	}

	// Query log
	DB.LogMode(true)

	fmt.Println("connected to database ...")
}
