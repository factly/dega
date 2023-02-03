package model

type Base struct {
	ID          uint `json:"id"`
	CreatedByID uint `json:"created_by_id"`
	UpdatedByID uint `json:"updated_by_id"`
}
