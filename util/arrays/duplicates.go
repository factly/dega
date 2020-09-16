package arrays

// RemoveDuplicate removes duplicate values from slice
func RemoveDuplicate(intSlice []uint) []uint {
	keys := make(map[uint]bool)
	list := []uint{}

	for _, entry := range intSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}
