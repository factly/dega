package model

// Author model
type Author struct {
	Base
	Email     string  `gorm:"column:email;unique_index" json:"email"`
	FirstName string  `gorm:"column:first_name" json:"first_name"`
	LastName  string  `gorm:"column:last_name" json:"last_name"`
	BirthDate string  `gorm:"column:birth_date" json:"birth_date"`
	Gender    string  `gorm:"column:gender" json:"gender"`
	Medium    *Medium `gorm:"foreignKey:featured_medium_id" json:"medium"`
}
