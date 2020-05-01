package config

import (
	"fmt"
	"log"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/joho/godotenv"

	core "github.com/factly/dega-server/service/core/model"
	factcheck "github.com/factly/dega-server/service/factcheck/model"
)

// DB - gorm DB
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("error loding .env file")
	}
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	connStr := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=disable password=%s", dbHost, dbUser, dbName, dbPassword) //Build connection string
	//connStr := "user=postgres dbname=data_portal host=localhost sslmode=disable password=postgres"

	DB, err = gorm.Open("postgres", connStr)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("connected to database ...")

	DB.AutoMigrate(
		&factcheck.Claimant{},
		&core.Medium{},
		&core.Category{},
	)

	DB.Model(&factcheck.Claimant{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
	DB.Model(&core.Category{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
}
