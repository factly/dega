package model

import "github.com/factly/dega-server/config"

// Webhook webhook model
type Webhook struct {
	config.Base
	URL     string  `json:"url"`
	Enabled bool    `json:"enabled"`
	Events  []Event `json:"events"`
}

// Event event model
type Event struct {
	config.Base
	Name string `json:"name"`
}
