package util

import "strconv"

// Converter - string to int slice
func Converter(arr []string) []uint {
	ids := make([]uint, 0)
	for _, each := range arr {
		id, err := strconv.Atoi(each)
		if err == nil {
			ids = append(ids, uint(id))
		}
	}
	return ids
}
