package slug

import (
	"regexp"
	"strings"
)

// Make return slug
func Make(title string) string {
	var re = regexp.MustCompile("[^a-z0-9]+")
	return strings.Trim(re.ReplaceAllString(strings.ToLower(title), "-"), "-")
}
