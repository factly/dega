package util

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
)

// CheckName checks if the table contains any entry with same name
func CheckName(space uuid.UUID, name, table string) bool {
	var count int64
	newName := strings.ToLower(strings.TrimSpace(name))
	if config.Sqlite() {
		config.DB.Table(table).Where("deleted_at IS NULL AND (space_id = ? AND name LIKE ?)", space, newName).Count(&count)
	} else {
		config.DB.Table(table).Where("deleted_at IS NULL AND (space_id = ? AND name ILIKE ?)", space, newName).Count(&count)
	}
	return count > 0
}

// Check return match
func CheckSlug(slug string) bool {
	match, err := regexp.MatchString("^[a-z0-9]+(?:-[a-z0-9]+)*$", slug)
	if err != nil {
		return false
	}
	return match
}

func MakeSlug(title string) string {
	var re = regexp.MustCompile("[^a-z0-9]+")
	return strings.Trim(re.ReplaceAllString(strings.ToLower(title), "-"), "-")
}

type comman struct {
	Slug string `gorm:"column:slug" json:"slug"`
}

// Approve return slug
func ApproveSlug(slug string, space uuid.UUID, table string) string {
	var result []comman
	config.DB.Table(table).Select("slug, space_id").Where("slug LIKE ? AND space_id = ? AND deleted_at IS NULL", slug+"%", space).Find(&result)
	count := 0
	for {
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
	return temp
}
