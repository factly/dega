package newtest

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
)

// Dummy response body for the mock server requesting organisation data
// Endpoint this is sent for is /organisations
var Dummy_Org = map[string]interface{}{
	"id":           1,
	"created_at":   time.Now(),
	"updated_at":   time.Now(),
	"deleted_at":   nil,
	"title":        "test org",
	"slug":         "test-org",
	"organisation": map[string]interface{}{},
	"applications": []map[string]interface{}{
		{"id": 1, "name": "test", "description": "test", "url": "test", "medium_id": 1},
	},
	"spaces": []map[string]interface{}{
		{
			"id":              1,
			"name":            "Test",
			"slug":            "test",
			"organisation_id": 1,
			"application_id":  1,
			"permissions": []map[string]interface{}{
				{
					"resource": "posts",
					"actions":  []string{"create", "update", "delete", "read"},
				},
			},
			"allowed_services": []string{"posts", "tags", "categories", "media", "pages", "formats", "spaces", "users", "organisations", "permissions"},
		},
	},
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

var PaiganatedOrg = map[string]interface{}{
	"nodes": []interface{}{
		Dummy_Org,
	},
	"total": 1,
}

var Dummy_Org_Member_List = []map[string]interface{}{{
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
		"role":            "member",
	},
},
}

var Dummy_OrgList = []map[string]interface{}{
	Dummy_Org,
}

// Dummy response for the mock server requesting list of authors
// Endpoint this is sent for is /organisations/[id]/users
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

var Dummy_KetoPolicy = []map[string]interface{}{
	{
		"id":          "id:org:1:app:dega:space:1:test-policy-4",
		"description": "",
		"subjects": []string{
			"1",
			"2",
		},
		"resources": []string{
			"resources:org:1:app:dega:space:1:categories",
			"resources:org:1:app:dega:space:1:tags",
		},
		"actions": []string{
			"actions:org:1:app:dega:space:1:categories:get",
			"actions:org:1:app:dega:space:1:categories:create",
			"actions:org:1:app:dega:space:1:tags:update",
			"actions:org:1:app:dega:space:1:tags:delete",
		},
		"effect":     "allow",
		"conditions": nil,
	},
	{
		"id":          "id:org:1:app:dega:space:1:test-policy-0",
		"description": "",
		"subjects": []string{
			"1",
		},
		"resources": []string{
			"resources:org:12:app:dega:space:18:policies",
		},
		"actions": []string{
			"actions:org:12:app:dega:space:18:policies:get",
			"actions:org:12:app:dega:space:18:policies:create",
			"actions:org:12:app:dega:space:18:policies:update",
			"actions:org:12:app:dega:space:18:policies:delete",
		},
		"effect":     "allow",
		"conditions": nil,
	},
}

var Dummy_Role = map[string]interface{}{
	"id": "roles:org:1:admin",
	"members": []string{
		"1",
	},
}

// Dummy single policy
var Dummy_SingleMock = map[string]interface{}{
	"id":          "id:org:1:app:dega:space:1:test-policy-0",
	"description": "",
	"subjects": []string{
		"1",
	},
	"resources": []string{
		"resources:org:12:app:dega:space:18:policies",
	},
	"actions": []string{
		"actions:org:12:app:dega:space:18:policies:get",
		"actions:org:12:app:dega:space:18:policies:create",
		"actions:org:12:app:dega:space:18:policies:update",
		"actions:org:12:app:dega:space:18:policies:delete",
	},
	"effect":     "allow",
	"conditions": nil,
}

var ReturnUpdate = map[string]interface{}{
	"updateId": 1,
}

var MeiliHits = map[string]interface{}{
	"hits": []map[string]interface{}{
		{
			"object_id":   "post_3",
			"kind":        "post",
			"description": "This is a test post with claim",
			"id":          1,
			"slug":        "test-post-2",
			"space_id":    1,
			"title":       "Test Post",
			"category_ids": []uint{
				2,
			},
			"excerpt":        "Test post with claim",
			"is_featured":    true,
			"is_highlighted": true,
			"is_sticky":      true,
			"published_date": 423849600,
			"status":         "draft",
			"subtitle":       "Test Post",
			"tag_ids": []uint{
				42,
			},
			"claim_ids": []uint{
				5,
			},
			"format_id": 3,
		},
		{
			"object_id":       "claim_2",
			"kind":            "claim",
			"description":     "This is a test claim",
			"id":              2,
			"slug":            "test-claim",
			"space_id":        1,
			"title":           "Test Claim",
			"checked_date":    1598959138,
			"claim_date":      423849600,
			"claim_sources":   "secret sources",
			"claimant_id":     2,
			"rating_id":       2,
			"review":          "Bad review",
			"review_sources":  "Good sources",
			"review_tag_line": "Bad review good sources",
		},
	},
	"offset":           0,
	"limit":            20,
	"nbHits":           7,
	"exhaustiveNbHits": false,
	"processingTimeMs": 2,
	"query":            "test",
}

var EmptyMeili = map[string]interface{}{
	"hits":             []map[string]interface{}{},
	"offset":           0,
	"limit":            20,
	"nbHits":           0,
	"exhaustiveNbHits": false,
	"processingTimeMs": 2,
	"query":            "test",
}

var GoogleResponse = map[string]interface{}{
	"claims": []map[string]interface{}{
		{
			"text":      "Shopkeepers sleeping inside shops due to Modi govt's handling of COVID-19",
			"claimant":  "Social media",
			"claimDate": "2016-06-20T00:00:00Z",
			"claimReview": []map[string]interface{}{
				{
					"publisher": map[string]interface{}{
						"name": "Alt News",
						"site": "altnews.in",
					},
					"url":           "https://www.altnews.in/congress-rohan-gupta-shares-old-images-of-shopkeeper-falling-a-sleep-to-target-pm-modi/",
					"title":         "Photos of shopkeepers sleeping inside shops from 2019 shared as recent",
					"reviewDate":    "2020-09-28T00:00:00Z",
					"textualRating": "False",
					"languageCode":  "en",
				},
			},
		},
	},
	"nextPageToken": "CBQ",
}

var IFramelyResponse = map[string]interface{}{
	"meta": map[string]interface{}{
		"description": "GitHub is where over 50 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and feat...",
		"title":       "GitHub: Where the world builds software",
		"theme-color": "#1e2327",
		"canonical":   "https://github.com/",
		"site":        "GitHub",
	},
	"links": map[string]interface{}{
		"thumbnail": []interface{}{
			map[string]interface{}{
				"href": "https://github.githubassets.com/images/modules/open_graph/github-mark.png",
				"type": "image/png",
				"rel": []interface{}{
					"twitter",
					"thumbnail",
					"ssl",
					"og",
				},
				"media": map[string]interface{}{
					"width":  1200,
					"height": 620,
				},
			},
		},
		"icon": []interface{}{
			map[string]interface{}{
				"href": "https://github.githubassets.com/favicons/favicon.svg",
				"type": "image/svg+xml",
			},
		},
	},
}

var OembedResponse = map[string]interface{}{
	"type":             "link",
	"version":          "1.0",
	"title":            "GitHub: Where the world builds software",
	"url":              "https://github.com/",
	"provider_name":    "GitHub",
	"description":      "GitHub is where over 50 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and feat...",
	"thumbnail_url":    "https://github.githubassets.com/images/modules/open_graph/github-mark.png",
	"thumbnail_width":  1200,
	"thumbnail_height": 620,
}

//	{
//	    "name": "new policy",
//	    "description": "this a des",
//	    "roles": [
//	        5
//	    ],
//	    "permissions": [
//	        {
//	            "resource": "posts",
//	            "actions": [
//	                "get",
//	                "create",
//	                "update"
//	            ]
//	        },
//	        {
//	            "resource": "categories",
//	            "actions": [
//	                "update"
//	            ]
//	        },
//	        {
//	            "resource": "tags",
//	            "actions": [
//	                "create",
//	                "update"
//	            ]
//	        }
//	    ]
//	}
var KavachPolicy = []map[string]interface{}{{
	"id":          1,
	"name":        "new policy",
	"description": "this a des",
	"permissions": []map[string]interface{}{
		{
			"resource": "posts",
			"actions":  []string{"get", "create", "update"},
		},
	},
	"roles": []model.SpaceRole{{
		Base:        config.Base{ID: 1},
		Name:        "test",
		Description: "test",
		Slug:        "test",
		SpaceID:     1,
		Users: []model.User{{
			FirstName: "test",
			LastName:  "test",
		}},
	}},
	"space_id": 1},
}

var SpaceRole = model.SpaceRole{
	Base:        config.Base{ID: 1},
	Name:        "test",
	Description: "test",
	Slug:        "test",
	SpaceID:     1,
	Users: []model.User{{
		FirstName: "test",
		LastName:  "test",
	}},
}

var KavachCreateSpace = map[string]interface{}{
	"name":            "Test",
	"slug":            "test",
	"description":     "Test",
	"id":              1,
	"organisation_id": 1,
	"application_id":  1,
}
