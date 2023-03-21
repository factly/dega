package test

import (
	"encoding/json"

	"github.com/jinzhu/gorm/dialects/postgres"
)

func NilJsonb() postgres.Jsonb {
	ba, _ := json.Marshal(nil)
	return postgres.Jsonb{
		RawMessage: ba,
	}
}
