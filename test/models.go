package test

import "time"

var Dummy_Org = map[string]interface{}{
	"id":         1,
	"created_at": time.Now(),
	"updated_at": time.Now(),
	"deleted_at": nil,
	"title":      "test org",
	"permission": map[string]interface{}{
		"id":              1,
		"created_at":      time.Now(),
		"updated_at":      time.Now(),
		"deleted_at":      nil,
		"user_id":         1,
		"user":            nil,
		"organisation_id": 1,
		"organisation":    nil,
		"role":            "owner",
	},
}

var Dummy_AuthorList = []map[string]interface{}{
	{
		"id":         1,
		"created_at": time.Now(),
		"updated_at": time.Now(),
		"deleted_at": nil,
		"email":      "abc@abc.com",
		"kid":        "",
		"first_name": "abc",
		"last_name":  "cba",
		"birth_date": time.Now(),
		"gender":     "male",
		"permission": map[string]interface{}{
			"id":              1,
			"created_at":      time.Now(),
			"updated_at":      time.Now(),
			"deleted_at":      nil,
			"user_id":         1,
			"user":            nil,
			"organisation_id": 1,
			"organisation":    nil,
			"role":            "owner",
		},
	},
	{
		"id":         2,
		"created_at": time.Now(),
		"updated_at": time.Now(),
		"deleted_at": nil,
		"email":      "def@def.com",
		"kid":        "",
		"first_name": "def",
		"last_name":  "fed",
		"birth_date": time.Now(),
		"gender":     "male",
		"permission": map[string]interface{}{
			"id":              2,
			"created_at":      time.Now(),
			"updated_at":      time.Now(),
			"deleted_at":      nil,
			"user_id":         2,
			"user":            nil,
			"organisation_id": 1,
			"organisation":    nil,
			"role":            "member",
		},
	},
}
