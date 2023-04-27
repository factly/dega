package handlers

import (
	"github.com/factly/dega-server/plugin/fact-check/shared"
)

func HandleHello(r shared.Request) (interface{}, error) {
	return "Hello from fact-check plugin", nil
}
