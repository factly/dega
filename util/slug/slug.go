package slug

import (
	"strconv"

	"github.com/factly/dega-server/config"
)

type comman struct {
	Slug string `gorm:"column:slug" json:"slug"`
}

// Approve return slug
func Approve(slug string, space int, table string) string {
	var result []comman
	config.DB.Table(table).Select("slug, space_id").Where("slug LIKE ? AND space_id = ? AND deleted_at IS NULL", slug+"%", space).First(&result)
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
