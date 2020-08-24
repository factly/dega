package setup

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

const media_id = "media(id)"
const spaces_id = "spaces(id)"

func CreateDB() {
	config.DB.AutoMigrate(
		&model.Medium{},
		&model.Category{},
		&model.Tag{},
		&model.Space{},
		&model.Format{},
		&model.Post{},
		&model.PostAuthor{},
	)

	config.DB.Model(&model.Category{}).AddForeignKey("medium_id", media_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Category{}).AddForeignKey("space_id", spaces_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Category{}).AddForeignKey("parent_id", "categories(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Format{}).AddForeignKey("space_id", spaces_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Medium{}).AddForeignKey("space_id", spaces_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("logo_id", media_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("logo_mobile_id", media_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("fav_icon_id", media_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("mobile_icon_id", media_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Post{}).AddForeignKey("featured_medium_id", media_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Post{}).AddForeignKey("format_id", "formats(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Post{}).AddForeignKey("space_id", spaces_id, "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Tag{}).AddForeignKey("space_id", spaces_id, "RESTRICT", "RESTRICT")
}

func DeleteTestDB() {
	config.DB.Model(&model.Tag{}).RemoveForeignKey("space_id", spaces_id)
	config.DB.Model(&model.Tag{}).RemoveForeignKey("space_id", spaces_id)
	config.DB.Model(&model.Post{}).RemoveForeignKey("format_id", "formats(id)")
	config.DB.Model(&model.Post{}).RemoveForeignKey("featured_medium_id", media_id)
	config.DB.Model(&model.Space{}).RemoveForeignKey("mobile_icon_id", media_id)
	config.DB.Model(&model.Space{}).RemoveForeignKey("fav_icon_id", media_id)
	config.DB.Model(&model.Space{}).RemoveForeignKey("logo_mobile_id", media_id)
	config.DB.Model(&model.Space{}).RemoveForeignKey("logo_id", media_id)
	config.DB.Model(&model.Medium{}).RemoveForeignKey("space_id", spaces_id)
	config.DB.Model(&model.Format{}).RemoveForeignKey("space_id", spaces_id)
	config.DB.Model(&model.Category{}).RemoveForeignKey("parent_id", "categories(id)")
	config.DB.Model(&model.Category{}).RemoveForeignKey("space_id", spaces_id)
	config.DB.Model(&model.Category{}).RemoveForeignKey("medium_id", media_id)

	config.DB.DropTable(&model.PostAuthor{})
	config.DB.DropTable(&model.Post{})
	config.DB.DropTable(&model.Format{})
	config.DB.DropTable(&model.Space{})
	config.DB.DropTable(&model.Tag{})
	config.DB.DropTable(&model.Category{})
	config.DB.DropTable(&model.Medium{})
}
