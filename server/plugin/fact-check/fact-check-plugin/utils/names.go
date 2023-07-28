package utils

import (
	"strings"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/plugin/fact-check/fact-check-plugin/db"
)

// CheckName checks if the table contains any entry with same name
func CheckName(space uint, name, table string) bool {
	var count int64
	newName := strings.ToLower(strings.TrimSpace(name))
	if config.Sqlite() {
		db.DB.Table(table).Where("deleted_at IS NULL AND (space_id = ? AND name LIKE ?)", space, newName).Count(&count)
	} else {
		db.DB.Table(table).Where("deleted_at IS NULL AND (space_id = ? AND name ILIKE ?)", space, newName).Count(&count)
	}
	return count > 0
}
