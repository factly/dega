package util

import "strconv"

// Converter - string to int slice
func Converter(arr []string) []int {
	ids := make([]int, 0)
	for _, each := range arr {
		id, err := strconv.Atoi(each)
		if err == nil {
			ids = append(ids, int(id))
		}
	}
	return ids
}
