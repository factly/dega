package config

import (
	"fmt"
	"log"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB() {

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	connStr := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=disable password=%s", dbHost, dbUser, dbName, dbPassword) //Build connection string

	var err error

	DB, err = gorm.Open("postgres", connStr)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("connected to database ...")

}
