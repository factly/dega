package models

type Base struct {
	CreatedByID uint `json:"created_by_id"`
	UpdatedByID uint `json:"updated_by_id"`
}
