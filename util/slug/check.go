package slug

import "regexp"

// Check return match
func Check(slug string) bool {
	match, err := regexp.MatchString("^[a-z0-9]+(?:-[a-z0-9]+)*$", slug)
	if err != nil {
		return false
	}
	return match
}
