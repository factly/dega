package models

import (
	"time"
)

// User model
type User struct {
	ID                  string       `bson:"_id"`
	FirstName           string       `bson:"first_name"`
	LastName            string       `bson:"last_name"`
	DisplayName         string       `bson:"display_name"`
	Slug                string       `bson:"slug"`
	Description         string       `bson:"description"`
	Enabled             bool         `bson:"enabled"`
	EmailVerified       bool         `bson:"email_verified"`
	Email               string       `bson:"email"`
	KeycloakID          string       `bson:"keycloak_id"`
	CreatedDate         time.Time    `bson:"created_date"`
	IsSuperAdmin        bool         `bson:"is_super_admin"`
	OrganizationDefault DatabaseRef  `bson:"organizationDefault"`
	OrganizationCurrent *DatabaseRef `bson:"organizationCurrent"`
	Media               *DatabaseRef `bson:"media"`
	Class               string       `bson:"_class"`
}

// UsersPaging model
type UsersPaging struct {
	Nodes []*User `json:"nodes"`
	Total int     `json:"total"`
}
