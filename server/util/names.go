package util

import (
	"strings"

	"github.com/factly/dega-server/config"
)

// CheckName checks if the table contains any entry with same name
func CheckName(space uint, name, table string) bool {
	var count int64
	newName := strings.ToLower(strings.TrimSpace(name))
	if config.Sqlite() {
		config.DB.Table(table).Where("deleted_at IS NULL AND (space_id = ? AND name LIKE ?)", space, newName).Count(&count)
	} else {
		config.DB.Table(table).Where("deleted_at IS NULL AND (space_id = ? AND name ILIKE ?)", space, newName).Count(&count)
	}
	return count > 0
}
