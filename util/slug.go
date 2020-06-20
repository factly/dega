package util

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/factly/dega-server/config"
)

type comman struct {
	Slug string `gorm:"column:slug" json:"slug"`
}

// SlugApprover return slug
func SlugApprover(slug string, space int, table string) string {
	var result []comman
	config.DB.Table(table).Select("slug, space_id").Where("slug LIKE ? AND space_id = ?", slug+"%", space).Scan(&result)
	count := 0
	for true {
		flag := true
		for _, each := range result {
			temp := slug
			if count != 0 {
				temp = temp + "-" + strconv.Itoa(count)
			}
			if each.Slug == temp {
				flag = false
				break
			}
		}
		if flag {
			break
		}
		count++
	}
	temp := slug
	if count != 0 {
		temp = temp + "-" + strconv.Itoa(count)
	}
	fmt.Printf(temp)
	return temp

}

// SlugMaker return slug
func SlugMaker(title string) string {
	var re = regexp.MustCompile("[^a-z0-9]+")
	return strings.Trim(re.ReplaceAllString(strings.ToLower(title), "-"), "-")
}

// SlugChecker return match
func SlugChecker(slug string) bool {
	match, err := regexp.MatchString("^[a-z0-9]+(?:-[a-z0-9]+)*$", slug)
	if err != nil {
		return false
	}
	return match
}
