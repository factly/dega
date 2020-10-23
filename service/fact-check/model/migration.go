package model

import "github.com/factly/dega-server/config"

//Migration fact-check models
func Migration() {
	config.DB.AutoMigrate(
		&Claimant{},
		&Rating{},
		&Claim{},
		&PostClaim{},
	)
	// destSpace := "spaces(id)"

	// config.DB.Model(&Claimant{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
	// config.DB.Model(&Claimant{}).AddForeignKey("space_id", destSpace, "RESTRICT", "RESTRICT")
	// config.DB.Model(&Rating{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
	// config.DB.Model(&Rating{}).AddForeignKey("space_id", destSpace, "RESTRICT", "RESTRICT")
	// config.DB.Model(&Claim{}).AddForeignKey("rating_id", "ratings(id)", "RESTRICT", "RESTRICT")
	// config.DB.Model(&Claim{}).AddForeignKey("claimant_id", "claimants(id)", "RESTRICT", "RESTRICT")
	// config.DB.Model(&Claim{}).AddForeignKey("space_id", destSpace, "RESTRICT", "RESTRICT")
	// config.DB.Model(&PostClaim{}).AddForeignKey("claim_id", "claims(id)", "RESTRICT", "RESTRICT")
	// config.DB.Model(&PostClaim{}).AddForeignKey("post_id", "posts(id)", "RESTRICT", "RESTRICT")
}
