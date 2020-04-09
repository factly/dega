package models

// User model
type User struct {
	ID           string       `bson:"_id"`
	FirstName    string       `bson:"first_name"`
	LastName     string       `bson:"last_name"`
	DisplayName  string       `bson:"display_name"`
	Slug         string       `bson:"slug"`
	Description  string       `bson:"description"`
	FacebookURL  *string      `bson:"facebook_url"`
	TwitterURL   *string      `bson:"twitter_url"`
	InstagramURL *string      `bson:"instagram_url"`
	LinkedinURL  *string      `bson:"linkedin_url"`
	GithubURL    *string      `bson:"github_url"`
	Email        string       `bson:"email"`
	Media        *DatabaseRef `bson:"media"`
	Class        string       `bson:"_class"`
}

// UsersPaging model
type UsersPaging struct {
	Nodes []*User `json:"nodes"`
	Total int     `json:"total"`
}
