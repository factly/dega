package util

func ColumnValidator(str string, arr []string) bool {
	for _, each := range arr {
		if each == str {
			return true
		}
	}

	return false
}
