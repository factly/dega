package util

import (
	"github.com/google/uuid"
)

// Converter - string to int slice
func Converter(arr []string) []uuid.UUID {
	ids := make([]uuid.UUID, 0)
	for _, each := range arr {
		id, err := uuid.Parse(each)
		if err == nil {
			ids = append(ids, id)
		}
	}
	return ids
}
