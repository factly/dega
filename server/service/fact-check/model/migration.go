package model

import "github.com/factly/dega-server/config"

//Migration fact-check models
func Migration() {
	_ = config.DB.AutoMigrate(
		&Claimant{},
		&Rating{},
		&Claim{},
		&PostClaim{},
	)
}
