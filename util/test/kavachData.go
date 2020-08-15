package test

import (
	"log"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// Function to retrieve UserID and OrganisationID from Kavach Database.
// Can be used in the future for integration testing. Unused for unit tests.
func GetDataFromServer() (int, int) {
	kavachDB := os.Getenv("REQUESTDSN")

	var orgId int
	var userId int

	db, err := gorm.Open("postgres", kavachDB)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Raw("select user_id,organisation_id from organisation_users where deleted_at is NULL and role=? limit ?", "owner", 1).Rows()
	defer rows.Close()

	for rows.Next() {
		rows.Scan(&userId, &orgId)
	}

	return userId, orgId
}

// Function to return a dummy UserID and OrganisationID. Essentially used for unit tests to mock the above function.
func GetUserOrg() (int, int) {
	return 1, 1
}
