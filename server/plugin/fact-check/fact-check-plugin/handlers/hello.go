package handlers

import (
	"github.com/factly/dega-server/plugin/fact-check/shared"
)

func HandleHello(r shared.Request) (shared.Any, *shared.Error) {
	return "Hello from fact-check-plugin", nil
}
